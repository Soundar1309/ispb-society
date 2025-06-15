
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { orderId, paymentId, signature } = await req.json();

    // Update order status
    const { error: orderError } = await supabaseClient
      .from("orders")
      .update({
        razorpay_payment_id: paymentId,
        status: "paid",
        payment_method: "razorpay"
      })
      .eq("id", orderId);

    if (orderError) throw orderError;

    // Update membership status
    const { data: order } = await supabaseClient
      .from("orders")
      .select("membership_id")
      .eq("id", orderId)
      .single();

    if (order?.membership_id) {
      const validFrom = new Date();
      const validUntil = new Date();
      validUntil.setFullYear(validUntil.getFullYear() + 1);

      const { error: membershipError } = await supabaseClient
        .from("memberships")
        .update({
          status: "active",
          payment_status: "paid",
          razorpay_payment_id: paymentId,
          valid_from: validFrom.toISOString().split('T')[0],
          valid_until: validUntil.toISOString().split('T')[0]
        })
        .eq("id", order.membership_id);

      if (membershipError) throw membershipError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
