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

    const { orderId, membershipId, userId } = await req.json()
    console.log('Generating invoice for order:', orderId)

    if (!orderId && !membershipId) {
      return new Response(
        JSON.stringify({ error: 'Order ID or Membership ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch order details
    let order, membership, userProfile

    if (orderId) {
      const { data: orderData, error: orderError } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (orderError || !orderData) {
        console.error('Order not found:', orderError)
        return new Response(
          JSON.stringify({ error: 'Order not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      order = orderData

      // Get membership
      if (order.membership_id) {
        const { data: memData } = await supabaseClient
          .from('memberships')
          .select('*')
          .eq('id', order.membership_id)
          .single()
        membership = memData
      }
    } else if (membershipId) {
      const { data: memData, error: memError } = await supabaseClient
        .from('memberships')
        .select('*')
        .eq('id', membershipId)
        .single()

      if (memError || !memData) {
        return new Response(
          JSON.stringify({ error: 'Membership not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      membership = memData

      // Find related order
      const { data: orderData } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('membership_id', membershipId)
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      order = orderData
    }

    // Get user profile
    const targetUserId = userId || order?.user_id || membership?.user_id
    if (targetUserId) {
      const { data: profileData } = await supabaseClient
        .from('user_roles')
        .select('*')
        .eq('user_id', targetUserId)
        .single()
      userProfile = profileData
    }

    // Generate invoice number
    const invoiceNumber = `ISPB-INV-${Date.now()}`
    const invoiceDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })

    // Generate HTML invoice
    const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
    .invoice { max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #059669; }
    .logo-section h1 { color: #059669; font-size: 28px; margin-bottom: 5px; }
    .logo-section p { color: #666; font-size: 14px; }
    .invoice-info { text-align: right; }
    .invoice-info h2 { color: #333; font-size: 24px; margin-bottom: 10px; }
    .invoice-info p { color: #666; font-size: 14px; }
    .invoice-number { color: #059669; font-weight: bold; font-size: 16px; }
    .billing-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .billing-section > div { flex: 1; }
    .billing-section h3 { color: #059669; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .billing-section p { color: #333; font-size: 14px; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .items-table th { background: #059669; color: white; padding: 15px; text-align: left; font-size: 14px; }
    .items-table td { padding: 15px; border-bottom: 1px solid #eee; font-size: 14px; }
    .items-table tr:nth-child(even) { background: #f9fafb; }
    .totals { text-align: right; margin-top: 20px; }
    .totals-table { margin-left: auto; width: 300px; }
    .totals-table td { padding: 10px 15px; }
    .totals-table .label { color: #666; }
    .totals-table .total-row { font-size: 18px; font-weight: bold; border-top: 2px solid #059669; color: #059669; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px; }
    .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .status-paid { background: #dcfce7; color: #166534; }
    .payment-info { background: #f0fdf4; padding: 20px; border-radius: 8px; margin-top: 20px; }
    .payment-info h4 { color: #059669; margin-bottom: 10px; }
    .payment-info p { font-size: 13px; color: #333; }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="logo-section">
        <h1>ISPB</h1>
        <p>Indian Society of Plant Breeders</p>
        <p style="margin-top: 10px;">TNAU, Coimbatore - 641003</p>
        <p>Email: ispbtnau@gmail.com</p>
      </div>
      <div class="invoice-info">
        <h2>INVOICE</h2>
        <p class="invoice-number">${invoiceNumber}</p>
        <p>Date: ${invoiceDate}</p>
        <p style="margin-top: 10px;">
          <span class="status-badge status-paid">PAID</span>
        </p>
      </div>
    </div>

    <div class="billing-section">
      <div>
        <h3>Bill To</h3>
        <p><strong>${userProfile?.full_name || 'Member'}</strong></p>
        <p>${userProfile?.email || ''}</p>
        <p>${userProfile?.phone || ''}</p>
        <p>${userProfile?.institution || ''}</p>
      </div>
      <div style="text-align: right;">
        <h3>Member Details</h3>
        <p><strong>Member Code:</strong> ${membership?.member_code || 'Pending'}</p>
        <p><strong>Type:</strong> ${(membership?.membership_type || '').charAt(0).toUpperCase() + (membership?.membership_type || '').slice(1)} Membership</p>
        <p><strong>Valid From:</strong> ${membership?.valid_from || 'N/A'}</p>
        ${membership?.valid_until ? `<p><strong>Valid Until:</strong> ${membership.valid_until}</p>` : ''}
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Duration</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${(membership?.membership_type || '').charAt(0).toUpperCase() + (membership?.membership_type || '').slice(1)} Membership</strong>
            <br><span style="color: #666; font-size: 12px;">ISPB Membership Fee</span>
          </td>
          <td>${membership?.membership_type === 'lifetime' ? 'Lifetime' : '1 Year'}</td>
          <td style="text-align: right;">₹${(order?.amount || membership?.amount || 0).toLocaleString()}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals">
      <table class="totals-table">
        <tr>
          <td class="label">Subtotal:</td>
          <td>₹${(order?.amount || membership?.amount || 0).toLocaleString()}</td>
        </tr>
        <tr>
          <td class="label">Tax (0%):</td>
          <td>₹0</td>
        </tr>
        <tr class="total-row">
          <td>Total:</td>
          <td>&#8377;${(order?.amount || membership?.amount || 0).toLocaleString()}</td>
        </tr>
      </table>
    </div>

    ${order?.razorpay_payment_id ? `
    <div class="payment-info">
      <h4>Payment Information</h4>
      <p><strong>Payment ID:</strong> ${order.razorpay_payment_id}</p>
      <p><strong>Order ID:</strong> ${order.razorpay_order_id || 'N/A'}</p>
      <p><strong>Payment Method:</strong> ${order.payment_method || 'Razorpay'}</p>
      <p><strong>Payment Date:</strong> ${new Date(order.updated_at || order.created_at).toLocaleDateString('en-IN')}</p>
    </div>
    ` : ''}

    <div class="footer">
      <p>Thank you for your membership with the Indian Society of Plant Breeders</p>
      <p style="margin-top: 10px;">This is a computer-generated invoice. No signature required.</p>
      <p style="margin-top: 5px;">For queries: ispbtnau@gmail.com | Website: https://ispb.ejplantbreeding.org</p>
    </div>
  </div>
</body>
</html>`

    // Convert HTML to base64 for PDF generation placeholder
    // In production, you might use a PDF service like Puppeteer or an API
    const encoder = new TextEncoder()
    const htmlBytes = encoder.encode(invoiceHtml)
    const htmlBase64 = btoa(String.fromCharCode(...htmlBytes))

    // Store invoice HTML in storage as a file
    const fileName = `${targetUserId}/${invoiceNumber}.html`

    const { error: uploadError } = await supabaseClient.storage
      .from('invoices')
      .upload(fileName, invoiceHtml, {
        contentType: 'text/html',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading invoice:', uploadError)
    }

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from('invoices')
      .getPublicUrl(fileName)

    const invoiceUrl = urlData?.publicUrl

    // Update order with invoice URL
    if (order?.id && invoiceUrl) {
      await supabaseClient
        .from('orders')
        .update({ invoice_url: invoiceUrl })
        .eq('id', order.id)
    }

    console.log('Invoice generated:', invoiceNumber)

    return new Response(
      JSON.stringify({
        success: true,
        invoiceNumber,
        invoiceUrl,
        invoiceHtml
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } }
    )

  } catch (error) {
    console.error('Error generating invoice:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate invoice' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})