
// @ts-nocheck
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    const { name, email, author_name, article_id, article_name, bypass } = requestBody

    if (!name || !email || !author_name || !article_id || !article_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const amount = 500 // Fixed amount in INR

    // 1. Handle Bypass for Test Mode
    if (bypass === true) {
      console.log('Bypass requested for test submission:', article_name);
      const { data: submission, error: submissionError } = await supabaseClient
        .from('article_submissions')
        .insert({
          name: `${name} (Test)`,
          email,
          author_name,
          article_id,
          article_name,
          amount,
          payment_status: 'paid',
          razorpay_payment_id: `test_bypass_${Math.random().toString(36).substring(7).toUpperCase()}`
        })
        .select()
        .single()

      if (submissionError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create bypass submission', details: submissionError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          bypassCompleted: true,
          submissionId: submission.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get payment settings
    const { data: paymentSettings } = await supabaseClient
      .from('payment_settings')
      .select('razorpay_key_id, razorpay_key_secret_encrypted, is_enabled')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (paymentSettings && !paymentSettings.is_enabled) {
      return new Response(
        JSON.stringify({ error: 'Payment gateway is currently disabled' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Safely get keys with fallbacks
    const razorpayKeyId = (paymentSettings?.razorpay_key_id || Deno.env.get('RAZORPAY_KEY_ID'))?.trim();
    const razorpayKeySecret = (paymentSettings?.razorpay_key_secret_encrypted || Deno.env.get('RAZORPAY_KEY_SECRET'))?.trim();

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Credentials missing');
      return new Response(
        JSON.stringify({ error: 'Payment configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Create a pending submission record
    const { data: submission, error: submissionError } = await supabaseClient
      .from('article_submissions')
      .insert({
        name,
        email,
        author_name,
        article_id,
        article_name,
        amount,
        payment_status: 'pending'
      })
      .select()
      .single()

    if (submissionError) {
      console.error('DB Insert Error:', submissionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create submission', details: submissionError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Create Razorpay order
    // NOTE: 'receipt' has a 40-character limit in Razorpay
    const razorpayOrder = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `sub_${submission.id.substring(0, 8)}`,
    }

    try {
      const authHeader = `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`;
      const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(razorpayOrder),
      })

      if (!rzpResponse.ok) {
        const errorText = await rzpResponse.text()
        console.error('Razorpay Error:', rzpResponse.status, errorText);
        return new Response(
          JSON.stringify({ error: 'Razorpay order creation failed', details: errorText }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const order = await rzpResponse.json()

      // 3. Update submission with order ID
      await supabaseClient
        .from('article_submissions')
        .update({ razorpay_order_id: order.id })
        .eq('id', submission.id)

      return new Response(
        JSON.stringify({
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: razorpayKeyId,
          submissionId: submission.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (fetchError) {
      console.error('Network Error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Razorpay connection failed', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Internal Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
