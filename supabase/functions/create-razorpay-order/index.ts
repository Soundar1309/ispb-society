
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Request headers:', Object.fromEntries(req.headers))

    // Try to get user from auth header first
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    let userId: string | null = null

    // Try JWT auth first
    const { data: { user } } = await authClient.auth.getUser()
    if (user) {
      userId = user.id
      console.log('Authenticated via JWT:', userId)
    }

    // Use service role for database operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    console.log('Request body:', requestBody)

    const { membershipPlanId, amount, membershipId: providedMembershipId, userId: bodyUserId } = requestBody

    // If no JWT auth, try to use userId from body (for SSR/proxy scenarios)
    if (!userId && bodyUserId) {
      userId = bodyUserId
      console.log('Using userId from request body:', userId)
    }

    if (!userId) {
      console.error('Unauthorized: No user found')
      return new Response(
        JSON.stringify({ error: 'Unauthorized - please login again' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!membershipPlanId || !amount) {
      console.error('Missing required fields:', { membershipPlanId, amount })
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get payment settings from database
    const { data: paymentSettings } = await supabaseClient
      .from('payment_settings')
      .select('razorpay_key_id, razorpay_key_secret_encrypted, is_test_mode, is_enabled')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Check if payments are enabled
    if (paymentSettings && !paymentSettings.is_enabled) {
      console.error('Payments are disabled')
      return new Response(
        JSON.stringify({ error: 'Payment gateway is currently disabled' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use key from DB settings if available, otherwise fall back to env
    const razorpayKeyId = paymentSettings?.razorpay_key_id?.trim() || Deno.env.get('RAZORPAY_KEY_ID')?.trim()
    const razorpayKeySecret = paymentSettings?.razorpay_key_secret_encrypted?.trim() || Deno.env.get('RAZORPAY_KEY_SECRET')?.trim()
    const isTestMode = paymentSettings?.is_test_mode ?? true

    console.log('Payment mode:', isTestMode ? 'TEST' : 'LIVE')
    console.log('Using Razorpay Key ID:', razorpayKeyId?.substring(0, 15) + '...')

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials not configured')
      return new Response(
        JSON.stringify({ error: 'Razorpay credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate key matches mode
    const keyIsTest = razorpayKeyId.startsWith('rzp_test_')
    if (isTestMode && !keyIsTest) {
      console.warn('Test mode enabled but using live key - proceeding anyway')
    } else if (!isTestMode && keyIsTest) {
      console.warn('Live mode enabled but using test key - proceeding anyway')
    }

    console.log('Creating Razorpay order for user:', userId)

    // CRITICAL: Require approved application - do not allow direct payment
    let membershipId: string
    let existingOrderId: string | null = null

    if (providedMembershipId) {
      // Verify the provided membership is approved and belongs to the user
      const { data: membership, error: fetchError } = await supabaseClient
        .from('memberships')
        .select('id, application_status, payment_status, user_id, razorpay_order_id')
        .eq('id', providedMembershipId)
        .maybeSingle()

      if (fetchError || !membership) {
        console.error('Membership not found:', providedMembershipId)
        return new Response(
          JSON.stringify({ error: 'Membership not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (membership.user_id !== userId) {
        console.error('Membership does not belong to user')
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (membership.application_status !== 'approved') {
        console.error('Application not approved yet:', membership.application_status)
        return new Response(
          JSON.stringify({ error: 'Your application must be approved before payment' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (membership.payment_status === 'paid') {
        console.error('Payment already completed')
        return new Response(
          JSON.stringify({ error: 'Payment already completed for this membership' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      membershipId = membership.id
      existingOrderId = membership.razorpay_order_id
      console.log('Using provided approved membership:', membershipId)
    } else {
      // Check if user has any approved application pending payment
      const { data: existingApp } = await supabaseClient
        .from('memberships')
        .select('id, razorpay_order_id')
        .eq('user_id', userId)
        .eq('application_status', 'approved')
        .eq('payment_status', 'pending')
        .maybeSingle()

      if (!existingApp) {
        console.error('No approved application found for user')
        return new Response(
          JSON.stringify({ error: 'You must submit an application and get it approved before payment' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      membershipId = existingApp.id
      existingOrderId = existingApp.razorpay_order_id
      console.log('Found existing approved application:', membershipId)
    }

    // PAYMENT RETRY: Check if there's an existing pending order to reuse
    if (existingOrderId) {
      console.log('Checking existing order for reuse:', existingOrderId)

      // Verify order status with Razorpay
      try {
        const orderStatusResponse = await fetch(`https://api.razorpay.com/v1/orders/${existingOrderId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
          },
        })

        if (orderStatusResponse.ok) {
          const existingOrder = await orderStatusResponse.json()

          // Reuse order if it's still created (not paid or expired)
          if (existingOrder.status === 'created') {
            console.log('Reusing existing Razorpay order:', existingOrderId)

            return new Response(
              JSON.stringify({
                orderId: existingOrderId,
                amount: existingOrder.amount,
                currency: existingOrder.currency,
                keyId: razorpayKeyId,
                membershipId: membershipId,
                reused: true
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          console.log('Existing order not reusable, status:', existingOrder.status)
        }
      } catch (orderCheckError) {
        console.error('Error checking existing order:', orderCheckError)
        // Continue to create a new order
      }
    }

    // Create Razorpay order
    const razorpayOrder = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `membership_${Date.now()}`,
    }

    console.log('Creating Razorpay order:', razorpayOrder)

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(razorpayOrder),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Razorpay API error status:', response.status)
      console.error('Razorpay API error response:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to create Razorpay order', details: errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const order = await response.json()
    console.log('Razorpay order created:', order.id)

    // Update membership with order ID
    const { error: updateError } = await supabaseClient
      .from('memberships')
      .update({ razorpay_order_id: order.id })
      .eq('id', membershipId)

    if (updateError) {
      console.error('Error updating membership with order ID:', updateError)
    }

    // Create order record
    const { error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: userId,
        membership_id: membershipId,
        razorpay_order_id: order.id,
        amount: amount,
        currency: 'INR',
        status: 'pending'
      })

    if (orderError) {
      console.error('Error creating order:', orderError)
    } else {
      console.log('Order created successfully')
    }

    console.log('Returning success response')
    return new Response(
      JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: razorpayKeyId,
        membershipId: membershipId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
