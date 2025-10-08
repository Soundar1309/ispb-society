import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html }: EmailRequest = await req.json();

    const smtpPassword = Deno.env.get("GMAIL_SMTP_PASSWORD");
    
    if (!smtpPassword) {
      throw new Error("Gmail SMTP password not configured");
    }

    // Connect to Gmail SMTP with TLS
    const conn = await Deno.connect({
      hostname: "smtp.gmail.com",
      port: 587,
    });
    
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Upgrade to TLS
    const tlsConn = await Deno.startTls(conn, { hostname: "smtp.gmail.com" });
    
    // Helper function to read response
    const readResponse = async () => {
      const buffer = new Uint8Array(4096);
      const n = await tlsConn.read(buffer);
      if (n === null) return "";
      return decoder.decode(buffer.subarray(0, n));
    };
    
    // Read initial banner
    const banner = await readResponse();
    console.log("Banner:", banner);
    
    // Send EHLO
    await tlsConn.write(encoder.encode("EHLO localhost\r\n"));
    const ehlo = await readResponse();
    console.log("EHLO response:", ehlo);
    
    // Send AUTH LOGIN
    await tlsConn.write(encoder.encode("AUTH LOGIN\r\n"));
    await readResponse();
    
    // Send username (base64)
    await tlsConn.write(encoder.encode(btoa("ispbtnau@gmail.com") + "\r\n"));
    await readResponse();
    
    // Send password (base64)
    await tlsConn.write(encoder.encode(btoa(smtpPassword) + "\r\n"));
    const authResp = await readResponse();
    console.log("Auth response:", authResp);
    
    if (!authResp.includes("235")) {
      throw new Error("Authentication failed");
    }
    
    // Send MAIL FROM
    await tlsConn.write(encoder.encode(`MAIL FROM:<ispbtnau@gmail.com>\r\n`));
    await readResponse();
    
    // Send RCPT TO
    await tlsConn.write(encoder.encode(`RCPT TO:<${to}>\r\n`));
    await readResponse();
    
    // Send DATA
    await tlsConn.write(encoder.encode("DATA\r\n"));
    await readResponse();
    
    // Send email content
    const emailContent = [
      `From: "ISPB" <ispbtnau@gmail.com>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      ``,
      html,
      `.`
    ].join("\r\n") + "\r\n";
    
    await tlsConn.write(encoder.encode(emailContent));
    const contentResp = await readResponse();
    console.log("Content response:", contentResp);
    
    // Send QUIT
    await tlsConn.write(encoder.encode("QUIT\r\n"));
    tlsConn.close();

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
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
