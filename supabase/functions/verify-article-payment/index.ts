
// @ts-nocheck
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      submissionId
    } = requestBody

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !submissionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get payment settings
    const { data: paymentSettings } = await supabaseClient
      .from('payment_settings')
      .select('razorpay_key_secret_encrypted')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const razorpayKeySecret = paymentSettings?.razorpay_key_secret_encrypted?.trim() || Deno.env.get('RAZORPAY_KEY_SECRET')?.trim()

    if (!razorpayKeySecret) {
      return new Response(
        JSON.stringify({ error: 'Razorpay credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = await crypto.subtle
      .importKey(
        "raw",
        new TextEncoder().encode(razorpayKeySecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      )
      .then((key) => crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)))
      .then((signature) =>
        Array.from(new Uint8Array(signature))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
      )

    if (expectedSignature !== razorpay_signature) {
      console.error('Invalid signature')
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update submission
    const { error: updateError } = await supabaseClient
      .from('article_submissions')
      .update({
        payment_status: 'paid',
        razorpay_payment_id: razorpay_payment_id
      })
      .eq('id', submissionId)

    if (updateError) {
      console.error('Error updating submission:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update submission status', details: updateError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send email notifications
    const { data: submission } = await supabaseClient
      .from('article_submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (submission) {
      // Send receipt to user
      try {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-gmail`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': req.headers.get('Authorization') || '',
          },
          body: JSON.stringify({
            to: submission.email,
            subject: 'Article Submission Payment Received - ISPB',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden;">
                <div style="background: #047857; padding: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0;">Payment Successful</h1>
                </div>
                <div style="padding: 20px;">
                  <p>Dear ${submission.name},</p>
                  <p>Thank you for your article submission. We have successfully received your payment of <strong>₹500</strong>.</p>
                  <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Submission Details</h3>
                    <p><strong>Article Name:</strong> ${submission.article_name}</p>
                    <p><strong>Article ID:</strong> ${submission.article_id}</p>
                    <p><strong>Author:</strong> ${submission.author_name}</p>
                    <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
                  </div>
                  <p>Our team will review your submission shortly.</p>
                  <p>Regards,<br>ISPB Team</p>
                </div>
              </div>
            `,
          }),
        })
      } catch (err) {
        console.error('Failed to send receipt:', err)
      }

      // Notify admin
      try {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-gmail`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': req.headers.get('Authorization') || '',
          },
          body: JSON.stringify({
            to: 'ispbtnau@gmail.com', // Admin email
            subject: 'New Article Submission Payment',
            html: `
              <h2>New Article Submission Received</h2>
              <p>A new article submission payment has been confirmed.</p>
              <ul>
                <li><strong>Submitter:</strong> ${submission.name} (${submission.email})</li>
                <li><strong>Author:</strong> ${submission.author_name}</li>
                <li><strong>Article:</strong> ${submission.article_name} (ID: ${submission.article_id})</li>
                <li><strong>Payment ID:</strong> ${razorpay_payment_id}</li>
              </ul>
            `,
          }),
        })
      } catch (err) {
        console.error('Failed to notify admin:', err)
      }
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
