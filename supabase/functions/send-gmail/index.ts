import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.7";

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

    console.log("Creating nodemailer transporter...");
    
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: "ispbtnau@gmail.com",
        pass: smtpPassword,
      },
    });

    console.log("Sending email via nodemailer...");

    const info = await transporter.sendMail({
      from: '"ISPB" <ispbtnau@gmail.com>',
      to: to,
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully. Message ID:", info.messageId);
    
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
