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

    const { orderId, membershipId, userId, proofUrl, notes } = await req.json()

    if (!orderId || !membershipId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: orderId, membershipId, userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // STEP 1: Fetch membership
    const { data: membership, error: membershipFetchError } = await supabaseClient
      .from('memberships')
      .select('*')
      .eq('id', membershipId)
      .maybeSingle()

    if (membershipFetchError || !membership) {
      return new Response(
        JSON.stringify({ error: 'Membership not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // STEP 2: Validity dates
    const validFrom = new Date().toISOString().split('T')[0]
    const validUntil =
      membership.membership_type === 'lifetime'
        ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // STEP 3: Generate member code from life_members table
    let memberCode = membership.member_code
    if (!memberCode) {
      const { data: allLifeMembers } = await supabaseClient
        .from('life_members')
        .select('life_member_no')
        .not('life_member_no', 'is', null)
        .like('life_member_no', 'LM-%')

      let maxNum = 0
      if (allLifeMembers && allLifeMembers.length > 0) {
        for (const member of allLifeMembers) {
          if (member.life_member_no) {
            const num = parseInt(member.life_member_no.replace('LM-', ''), 10)
            if (!isNaN(num) && num > maxNum) maxNum = num
          }
        }
      }
      memberCode = `LM-${String(maxNum + 1).padStart(3, '0')}`
    }

    // STEP 4: Update membership -> active, paid, member_code
    const { error: membershipUpdateError } = await supabaseClient
      .from('memberships')
      .update({ status: 'active', payment_status: 'paid', valid_from: validFrom, valid_until: validUntil, member_code: memberCode })
      .eq('id', membershipId)

    if (membershipUpdateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update membership', details: membershipUpdateError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // STEP 5: Update order -> paid (manual)
    await supabaseClient
      .from('orders')
      .update({ status: 'paid', payment_method: 'manual' })
      .eq('id', orderId)

    // STEP 6: Create payment_tracking record (with proof and notes)
    await supabaseClient.from('payment_tracking').insert({
      membership_id: membershipId,
      user_id: userId,
      amount: membership.amount,
      currency: 'INR',
      payment_method: 'manual',
      payment_status: 'paid',
      payment_date: new Date().toISOString(),
      notes: notes ? `Manual approval. Reason: ${notes}${proofUrl ? ` | Proof: ${proofUrl}` : ''}` : 'Manual approval by admin',
    })

    // STEP 7: Fetch user profile
    const { data: userProfile } = await supabaseClient
      .from('user_roles')
      .select('full_name, email, phone, designation, institution')
      .eq('user_id', userId)
      .maybeSingle()

    const userEmail = userProfile?.email || ''
    const userName = userProfile?.full_name || 'Member'

    // STEP 8: Create life_members record if not already exists
    if (memberCode) {
      const { data: existingLifeMember } = await supabaseClient
        .from('life_members')
        .select('id')
        .eq('life_member_no', memberCode)
        .maybeSingle()

      if (!existingLifeMember) {
        await supabaseClient.from('life_members').insert({
          name: userName,
          email: userEmail || null,
          mobile: userProfile?.phone || null,
          life_member_no: memberCode,
          date_of_enrollment: validFrom,
          occupation: userProfile?.designation || null,
          address: userProfile?.institution || null,
          is_active: true,
        })
      }
    }

    // STEP 9: Welcome email to member
    if (memberCode && userEmail) {
      try {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-gmail`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: userEmail,
            subject: 'Welcome to ISPB - Your Membership is Active!',
            html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:linear-gradient(135deg,#059669,#047857);padding:30px;text-align:center;border-radius:12px 12px 0 0"><h1 style="color:white;margin:0">Welcome to ISPB!</h1></div><div style="background:white;padding:30px;border-radius:0 0 12px 12px"><p>Dear <strong>${userName}</strong>,</p><p>Your ISPB membership is now <strong style="color:#059669">ACTIVE</strong>!</p><div style="margin:30px 0;padding:25px;background:linear-gradient(135deg,#059669,#047857);border-radius:12px;text-align:center"><p style="color:rgba(255,255,255,.9);margin:0;letter-spacing:1px">YOUR LIFE MEMBER NUMBER</p><p style="color:white;margin:15px 0 0;font-size:36px;font-weight:bold;letter-spacing:3px">${memberCode}</p></div><p>Warm regards,<br><strong>The ISPB Team</strong></p></div></div>`,
          }),
        })
      } catch (e) { console.error('Welcome email failed:', e) }
    }

    // STEP 10: Admin notification email
    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-gmail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'ispbtnau@gmail.com',
          subject: '[Manual] Membership Activated by Admin',
          html: `<h2>Manual Payment Confirmation</h2><p>Admin manually marked payment as paid.</p><ul><li><strong>Name:</strong> ${userName}</li><li><strong>Email:</strong> ${userEmail || 'N/A'}</li><li><strong>Member Code:</strong> ${memberCode}</li><li><strong>Amount:</strong> Rs.${membership.amount}</li><li><strong>Type:</strong> ${membership.membership_type}</li><li><strong>Valid:</strong> ${validFrom} to ${validUntil}</li></ul>`,
        }),
      })
    } catch (e) { console.error('Admin email failed:', e) }

    // STEP 11: Generate invoice
    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipId, userId }),
      })
    } catch (e) { console.error('Invoice generation failed:', e) }

    return new Response(
      JSON.stringify({ success: true, message: 'Payment marked as paid successfully', memberCode, memberName: userName, memberEmail: userEmail }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
