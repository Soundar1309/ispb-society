
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
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    
    if (!user) {
      console.error('Unauthorized: No user found')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestBody = await req.json()
    console.log('Request body:', requestBody)
    
    const { membershipPlanId, amount } = requestBody

    if (!membershipPlanId || !amount) {
      console.error('Missing required fields:', { membershipPlanId, amount })
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials not configured')
      return new Response(
        JSON.stringify({ error: 'Razorpay credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Creating Razorpay order for user:', user.id)

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

    // Create membership record
    console.log('Creating membership record for user:', user.id)
    const { data: membership, error: membershipError } = await supabaseClient
      .from('memberships')
      .insert({
        user_id: user.id,
        membership_type: membershipPlanId,
        amount: amount,
        status: 'pending',
        payment_status: 'pending',
        razorpay_order_id: order.id,
        currency: 'INR'
      })
      .select()
      .maybeSingle()

    if (membershipError || !membership) {
      console.error('Error creating membership:', membershipError)
      return new Response(
        JSON.stringify({ error: 'Failed to create membership record', details: membershipError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Membership created:', membership.id)

    // Create order record
    const { error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: user.id,
        membership_id: membership.id,
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
        membershipId: membership.id
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
