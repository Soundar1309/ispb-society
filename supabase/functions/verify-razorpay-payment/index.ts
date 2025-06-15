
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, membershipId } = await req.json()

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
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get membership plan details
    const { data: membership } = await supabaseClient
      .from('memberships')
      .select('*, membership_plans(*)')
      .eq('id', membershipId)
      .single()

    if (!membership) {
      return new Response(
        JSON.stringify({ error: 'Membership not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate validity dates
    const validFrom = new Date().toISOString().split('T')[0]
    let validUntil = null
    
    if (membership.membership_plans?.duration_months > 0) {
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + membership.membership_plans.duration_months)
      validUntil = endDate.toISOString().split('T')[0]
    }

    // Update membership
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
        JSON.stringify({ error: 'Failed to update membership' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update order
    await supabaseClient
      .from('orders')
      .update({
        razorpay_payment_id: razorpay_payment_id,
        status: 'completed',
        payment_method: 'razorpay'
      })
      .eq('razorpay_order_id', razorpay_order_id)

    // Create payment tracking record
    await supabaseClient
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
