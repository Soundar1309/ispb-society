
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
    console.log('Verifying payment...')

    // Try to get user from auth header first
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    )

    let authedUserEmail: string | null = null
    let userId: string | null = null

    // Try JWT auth first
    const { data: { user } } = await authClient.auth.getUser()
    if (user) {
      userId = user.id
      authedUserEmail = user.email
      console.log('Authenticated via JWT:', userId)
    }

    const requestBody = await req.json()
    console.log('Payment verification request:', { ...requestBody, razorpay_signature: '***' })

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      membershipId,
      userId: bodyUserId,
    } = requestBody

    // If no JWT auth, try to use userId from body
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

    // Use service role for database operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !membershipId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get payment settings to fetch the secret key
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

    console.log('Signature verified successfully')

    // Get membership details
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

    // CRITICAL: Only process payment if application was approved
    if (membership.application_status !== 'approved') {
      console.error('Payment received but application not approved yet')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Application must be approved by admin before payment can be processed',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update membership with validity dates
    console.log('Updating membership status to active')
    const validFrom = new Date().toISOString().split('T')[0]
    const validUntil =
      membership.membership_type === 'lifetime'
        ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]

    // Generate member code manually to avoid trigger ambiguity issue
    let memberCode = membership.member_code
    if (!memberCode) {
      // Get the highest existing member code number
      const { data: maxLifeMember } = await supabaseClient
        .from('life_members')
        .select('life_member_no')
        .not('life_member_no', 'is', null)
        .like('life_member_no', 'LM-%')
        .order('life_member_no', { ascending: false })
        .limit(1)
        .maybeSingle()

      const { data: maxMembership } = await supabaseClient
        .from('memberships')
        .select('member_code')
        .not('member_code', 'is', null)
        .like('member_code', 'LM-%')
        .order('member_code', { ascending: false })
        .limit(1)
        .maybeSingle()

      let maxNum = 0
      if (maxLifeMember?.life_member_no) {
        const num = parseInt(maxLifeMember.life_member_no.replace('LM-', ''), 10)
        if (!isNaN(num)) maxNum = Math.max(maxNum, num)
      }
      if (maxMembership?.member_code) {
        const num = parseInt(maxMembership.member_code.replace('LM-', ''), 10)
        if (!isNaN(num)) maxNum = Math.max(maxNum, num)
      }

      memberCode = `LM-${String(maxNum + 1).padStart(3, '0')}`
      console.log('Generated member code:', memberCode)
    }

    const { error: updateError } = await supabaseClient
      .from('memberships')
      .update({
        status: 'active',
        payment_status: 'paid',
        razorpay_payment_id: razorpay_payment_id,
        valid_from: validFrom,
        valid_until: validUntil,
        member_code: memberCode,
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

    // Use the generated member code
    const updatedMembership = { member_code: memberCode, membership_type: membership.membership_type }
    console.log('Membership updated with member code:', memberCode)

    // Update order (IMPORTANT: mark as 'paid' to match admin payments view)
    console.log('Updating order status')
    const { error: orderUpdateError } = await supabaseClient
      .from('orders')
      .update({
        razorpay_payment_id: razorpay_payment_id,
        status: 'paid',
        payment_method: 'razorpay',
      })
      .eq('razorpay_order_id', razorpay_order_id)

    if (orderUpdateError) {
      console.error('Error updating order:', orderUpdateError)
    } else {
      console.log('Order updated successfully')
    }

    // Create payment tracking record
    console.log('Creating payment tracking record')
    const { error: paymentTrackingError } = await supabaseClient.from('payment_tracking').insert({
      membership_id: membershipId,
      user_id: userId,
      amount: membership.amount,
      currency: 'INR',
      payment_method: 'razorpay',
      razorpay_payment_id: razorpay_payment_id,
      razorpay_order_id: razorpay_order_id,
      payment_status: 'paid',
      payment_date: new Date().toISOString(),
    })

    if (paymentTrackingError) {
      console.error('Error creating payment tracking:', paymentTrackingError)
    } else {
      console.log('Payment tracking created successfully')
    }

    // Get user details for email and life_members creation
    const { data: userProfile } = await supabaseClient
      .from('user_roles')
      .select('full_name, email, phone, designation, institution')
      .eq('user_id', userId)
      .maybeSingle()

    const userEmail = userProfile?.email || authedUserEmail || ''
    const userName = userProfile?.full_name || 'Member'

    // AUTO-CREATE LIFE_MEMBERS RECORD
    // Only create if: member_code exists
    if (updatedMembership?.member_code) {
      console.log('Creating life_members record...')

      // Check if life_member already exists
      const { data: existingLifeMember } = await supabaseClient
        .from('life_members')
        .select('id')
        .eq('life_member_no', updatedMembership.member_code)
        .maybeSingle()

      if (!existingLifeMember) {
        const { error: lifeMemberError } = await supabaseClient.from('life_members').insert({
          name: userName,
          email: userEmail || null,
          mobile: userProfile?.phone || null,
          life_member_no: updatedMembership.member_code,
          date_of_enrollment: new Date().toISOString().split('T')[0],
          occupation: userProfile?.designation || null,
          address: userProfile?.institution || null,
          is_active: true,
        })

        if (lifeMemberError) {
          console.error('Error creating life member:', lifeMemberError)
        } else {
          console.log('✅ Life member record created successfully')
        }
      } else {
        console.log('Life member record already exists')
      }
    } else {
      console.log('Skipping life_members creation - member code not generated')
    }

    // Send welcome email with member code
    if (updatedMembership?.member_code && userEmail) {
      console.log('Sending welcome email to:', userEmail)

      try {
        const welcomeEmailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-gmail`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': req.headers.get('Authorization') || '',
          },
          body: JSON.stringify({
            to: userEmail,
            subject: '🎉 Welcome to ISPB - Your Membership is Active!',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to ISPB!</h1>
                </div>

                <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <p style="font-size: 16px; color: #374151;">Dear <strong>${userName}</strong>,</p>

                  <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                    Congratulations! Your payment has been successfully processed and your ISPB membership is now <strong style="color: #059669;">ACTIVE</strong>! 🎊
                  </p>

                  <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #059669 0%, #047857 100%); border-radius: 12px; text-align: center;">
                    <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px; letter-spacing: 1px;">YOUR LIFE MEMBER NUMBER</p>
                    <p style="color: white; margin: 15px 0 0 0; font-size: 36px; font-weight: bold; letter-spacing: 3px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                      ${updatedMembership.member_code}
                    </p>
                  </div>

                  <p style="color: #6b7280; margin-top: 25px;">
                    Warm regards,<br>
                    <strong style="color: #374151;">The ISPB Team</strong>
                  </p>
                </div>
              </div>
            `,
          }),
        })

        const emailResult = await welcomeEmailResponse.json()
        console.log('Welcome email sent:', emailResult)
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)
      }
    } else {
      console.log('Skipping welcome email - member code or email not available')
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
              <li><strong>Email:</strong> ${userEmail || 'N/A'}</li>
            </ul>
            <h3>Payment Details:</h3>
            <ul>
              <li><strong>Amount:</strong> ₹${membership.amount}</li>
              <li><strong>Payment ID:</strong> ${razorpay_payment_id}</li>
              <li><strong>Order ID:</strong> ${razorpay_order_id}</li>
              <li><strong>Membership Type:</strong> ${membership.membership_type}</li>
              ${updatedMembership?.member_code ? `<li><strong>Member Code:</strong> ${updatedMembership.member_code}</li>` : ''}
            </ul>
          `,
        }),
      })
    } catch (emailError) {
      console.error('Failed to send admin email:', emailError)
    }

    // Generate invoice PDF
    try {
      console.log('Generating invoice...')
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          membershipId: membershipId,
          userId: userId
        }),
      })
      console.log('Invoice generation triggered')
    } catch (invoiceError) {
      console.error('Failed to generate invoice:', invoiceError)
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
