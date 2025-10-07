
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Verifying payment...')
    
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
    console.log('Payment verification request:', { ...requestBody, razorpay_signature: '***' })
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, membershipId } = requestBody

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !membershipId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!razorpayKeySecret) {
      return new Response(
        JSON.stringify({ error: 'Razorpay credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(razorpayKeySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    ).then(key => 
      crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body))
    ).then(signature => 
      Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    )

    if (expectedSignature !== razorpay_signature) {
      console.error('Invalid signature')
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Signature verified successfully')

    // Get membership plan details
    const { data: membership, error: membershipFetchError } = await supabaseClient
      .from('memberships')
      .select('*')
      .eq('id', membershipId)
      .maybeSingle()

    if (membershipFetchError || !membership) {
      console.error('Error fetching membership:', membershipFetchError)

      return new Response(
        JSON.stringify({ error: 'Membership not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Membership found:', membership.id)

    // Calculate validity dates
    const validFrom = new Date().toISOString().split('T')[0]
    let validUntil = null
    
    // For lifetime, set to 1 year from now (will be auto-renewed)
    // For annual, set to 1 year from now
    const endDate = new Date()
    endDate.setFullYear(endDate.getFullYear() + 1)
    validUntil = endDate.toISOString().split('T')[0]
    
    console.log('Validity dates:', { validFrom, validUntil })

    // Update membership
    console.log('Updating membership status to active')
    const { error: updateError } = await supabaseClient
      .from('memberships')
      .update({
        status: 'active',
        payment_status: 'paid',
        razorpay_payment_id: razorpay_payment_id,
        valid_from: validFrom,
        valid_until: validUntil
      })
      .eq('id', membershipId)

    if (updateError) {
      console.error('Error updating membership:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update membership', details: updateError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Membership updated successfully')

    // Update order
    console.log('Updating order status')
    const { error: orderUpdateError } = await supabaseClient
      .from('orders')
      .update({
        razorpay_payment_id: razorpay_payment_id,
        status: 'completed',
        payment_method: 'razorpay'
      })
      .eq('razorpay_order_id', razorpay_order_id)

    if (orderUpdateError) {
      console.error('Error updating order:', orderUpdateError)
    } else {
      console.log('Order updated successfully')
    }

    // Create payment tracking record
    console.log('Creating payment tracking record')
    const { error: paymentTrackingError } = await supabaseClient
      .from('payment_tracking')
      .insert({
        membership_id: membershipId,
        user_id: user.id,
        amount: membership.amount,
        currency: 'INR',
        payment_method: 'razorpay',
        razorpay_payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
        payment_status: 'paid',
        payment_date: new Date().toISOString()
      })

    if (paymentTrackingError) {
      console.error('Error creating payment tracking:', paymentTrackingError)
    } else {
      console.log('Payment tracking created successfully')
    }

    // Get user details for email
    const { data: userProfile } = await supabaseClient
      .from('user_roles')
      .select('full_name, email')
      .eq('user_id', user.id)
      .single()

    const userEmail = userProfile?.email || user.email
    const userName = userProfile?.full_name || 'Member'

    // Send confirmation email to user
    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-gmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.get('Authorization') || '',
        },
        body: JSON.stringify({
          to: userEmail,
          subject: 'Payment Confirmation - ISPB Membership',
          html: `
            <h2>Payment Successful!</h2>
            <p>Dear ${userName},</p>
            <p>Thank you for your payment. Your membership has been successfully activated.</p>
            <h3>Payment Details:</h3>
            <ul>
              <li><strong>Amount:</strong> ₹${membership.amount}</li>
              <li><strong>Payment ID:</strong> ${razorpay_payment_id}</li>
              <li><strong>Membership Type:</strong> ${membership.membership_type}</li>
              <li><strong>Valid From:</strong> ${validFrom}</li>
              ${validUntil ? `<li><strong>Valid Until:</strong> ${validUntil}</li>` : ''}
            </ul>
            <p>You can now access all membership benefits.</p>
            <br>
            <p>Best regards,<br>ISPB Team</p>
          `
        })
      })
    } catch (emailError) {
      console.error('Failed to send user email:', emailError)
    }

    // Send notification email to admin
    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-gmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.get('Authorization') || '',
        },
        body: JSON.stringify({
          to: 'ispbtnau@gmail.com',
          subject: 'New Membership Payment Received',
          html: `
            <h2>New Payment Received</h2>
            <p>A new membership payment has been received.</p>
            <h3>Member Details:</h3>
            <ul>
              <li><strong>Name:</strong> ${userName}</li>
              <li><strong>Email:</strong> ${userEmail}</li>
            </ul>
            <h3>Payment Details:</h3>
            <ul>
              <li><strong>Amount:</strong> ₹${membership.amount}</li>
              <li><strong>Payment ID:</strong> ${razorpay_payment_id}</li>
              <li><strong>Order ID:</strong> ${razorpay_order_id}</li>
              <li><strong>Membership Type:</strong> ${membership.membership_type}</li>
              <li><strong>Valid From:</strong> ${validFrom}</li>
              ${validUntil ? `<li><strong>Valid Until:</strong> ${validUntil}</li>` : ''}
            </ul>
          `
        })
      })
    } catch (emailError) {
      console.error('Failed to send admin email:', emailError)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Payment verified successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
