
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
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    let userId: string | null = null
    
    // Try JWT auth first
    const { data: { user } } = await authClient.auth.getUser()
    if (user) {
      userId = user.id
      console.log('Authenticated via JWT:', userId)
    }

    const requestBody = await req.json()
    console.log('Payment verification request:', { ...requestBody, razorpay_signature: '***' })
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, membershipId, userId: bodyUserId } = requestBody

    // If no JWT auth, try to use userId from body
    if (!userId && bodyUserId) {
      userId = bodyUserId
      console.log('Using userId from request body:', userId)
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

    // CRITICAL: Only process payment if application was approved
    if (membership.application_status !== 'approved') {
      console.error('Payment received but application not approved yet')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Application must be approved by admin before payment can be processed' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Application approved, proceeding with payment verification')

    // Update membership with validity dates
    console.log('Updating membership status to active')
    const validFrom = new Date().toISOString().split('T')[0]
    const validUntil = membership.membership_type === 'lifetime' 
      ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

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

    // Fetch updated membership to get member_code (generated by trigger)
    const { data: updatedMembership } = await supabaseClient
      .from('memberships')
      .select('member_code, membership_type')
      .eq('id', membershipId)
      .maybeSingle()

    console.log('Updated membership with member code:', updatedMembership?.member_code)

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

    // Get user details for email and life_members creation
    const { data: userProfile } = await supabaseClient
      .from('user_roles')
      .select('full_name, email, phone, designation, institution')
      .eq('user_id', user.id)
      .maybeSingle()

    const userEmail = userProfile?.email || user.email
    const userName = userProfile?.full_name || 'Member'

    // AUTO-CREATE LIFE_MEMBERS RECORD
    // Only create if: payment is paid, application approved, and member_code exists
    if (updatedMembership?.member_code) {
      console.log('Creating life_members record...')
      
      // Check if life_member already exists
      const { data: existingLifeMember } = await supabaseClient
        .from('life_members')
        .select('id')
        .eq('life_member_no', updatedMembership.member_code)
        .maybeSingle()

      if (!existingLifeMember) {
        const { error: lifeMemberError } = await supabaseClient
          .from('life_members')
          .insert({
            name: userProfile?.full_name || userName,
            email: userProfile?.email || userEmail,
            mobile: userProfile?.phone || '',
            life_member_no: updatedMembership.member_code,
            date_of_enrollment: new Date().toISOString().split('T')[0],
            occupation: userProfile?.designation || '',
            address: userProfile?.institution || '',
            is_active: true
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
    if (updatedMembership?.member_code) {
      console.log('Sending welcome email to:', userEmail)
      
      try {
        const welcomeEmailResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-gmail`,
          {
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
                    
                    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #059669;">
                      <h3 style="margin-top: 0; color: #065f46; font-size: 18px;">✨ Your Membership Benefits:</h3>
                      <ul style="margin-bottom: 0; color: #047857; line-height: 1.8;">
                        <li><strong>Exclusive Access:</strong> Research publications and journals</li>
                        <li><strong>Conference Participation:</strong> Annual ISPB conferences and workshops</li>
                        <li><strong>Professional Network:</strong> Connect with plant breeding experts</li>
                        <li><strong>Members Portal:</strong> Access to exclusive resources and tools</li>
                        <li><strong>Certificate:</strong> Official Life Membership Certificate</li>
                        <li><strong>Voting Rights:</strong> Participate in society decisions</li>
                      </ul>
                    </div>
                    
                    <div style="background-color: #eff6ff; padding: 18px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 25px 0;">
                      <p style="margin: 0; color: #1e40af; font-size: 14px;">
                        <strong>📌 Important:</strong> Please save your Life Member Number (<strong>${updatedMembership.member_code}</strong>) for future reference. You'll need it for conference registrations and accessing member benefits.
                      </p>
                    </div>
                    
                    <div style="background-color: #fef3c7; padding: 18px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0;">
                      <p style="margin: 0; color: #92400e; font-size: 14px;">
                        <strong>📋 Next Steps:</strong>
                      </p>
                      <ol style="margin: 10px 0 0 0; color: #92400e; font-size: 14px;">
                        <li>Login to your dashboard to view your membership details</li>
                        <li>Update your profile with complete information</li>
                        <li>Explore upcoming conferences and events</li>
                        <li>Connect with fellow members</li>
                      </ol>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                    
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                      If you have any questions or need assistance, please contact us at 
                      <a href="mailto:ispbtnau@gmail.com" style="color: #059669; text-decoration: none;">ispbtnau@gmail.com</a>
                    </p>
                    
                    <p style="color: #6b7280; margin-top: 25px;">
                      Warm regards,<br>
                      <strong style="color: #374151;">The ISPB Team</strong><br>
                      <span style="font-size: 13px;">Indian Society of Plant Breeders</span>
                    </p>
                  </div>
                </div>
              `
            })
          }
        )

        const emailResult = await welcomeEmailResponse.json()
        console.log('Welcome email sent:', emailResult)
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)
      }
    } else {
      console.log('Skipping welcome email - member code not available')
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
              ${updatedMembership?.member_code ? `<li><strong>Member Code:</strong> ${updatedMembership.member_code}</li>` : ''}
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
