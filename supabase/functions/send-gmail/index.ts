import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-gmail function invoked");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html }: EmailRequest = await req.json();
    console.log("Sending email to:", to);
    console.log("Subject:", subject);

    const smtpPassword = Deno.env.get("GMAIL_SMTP_PASSWORD");
    
    if (!smtpPassword) {
      console.error("Gmail SMTP password not configured");
      throw new Error("Gmail SMTP password not configured");
    }

    console.log("Connecting to SMTP server...");
    const client = new SmtpClient();

    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: "ispbtnau@gmail.com",
      password: smtpPassword,
    });

    console.log("Connected to SMTP, sending email...");

    await client.send({
      from: "ispbtnau@gmail.com",
      to: to,
      subject: subject,
      content: html,
      html: html,
    });

    await client.close();
    
    console.log("Email sent successfully to:", to);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    console.error("Error details:", error.message, error.stack);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
