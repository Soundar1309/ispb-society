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

    const smtpConfig = {
      server: "smtp.gmail.com",
      port: 587,
      username: "ispbtnau@gmail.com",
      password: Deno.env.get("GMAIL_SMTP_PASSWORD"),
    };

    if (!smtpConfig.password) {
      throw new Error("Gmail SMTP password not configured");
    }

    // Create email message in MIME format
    const message = [
      `From: ISPB <${smtpConfig.username}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=UTF-8",
      "",
      html,
    ].join("\r\n");

    // Connect to SMTP server and send email
    const conn = await Deno.connect({
      hostname: smtpConfig.server,
      port: smtpConfig.port,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Helper to read response
    const readResponse = async () => {
      const buffer = new Uint8Array(1024);
      const n = await conn.read(buffer);
      return decoder.decode(buffer.subarray(0, n || 0));
    };

    // Helper to send command
    const sendCommand = async (command: string) => {
      await conn.write(encoder.encode(command + "\r\n"));
      return await readResponse();
    };

    // SMTP conversation
    await readResponse(); // Read welcome message
    await sendCommand(`EHLO ${smtpConfig.server}`);
    await sendCommand("STARTTLS");

    // Upgrade to TLS
    const tlsConn = await Deno.startTls(conn, { hostname: smtpConfig.server });

    const tlsSendCommand = async (command: string) => {
      await tlsConn.write(encoder.encode(command + "\r\n"));
      const buffer = new Uint8Array(1024);
      const n = await tlsConn.read(buffer);
      return decoder.decode(buffer.subarray(0, n || 0));
    };

    await tlsSendCommand(`EHLO ${smtpConfig.server}`);
    await tlsSendCommand("AUTH LOGIN");
    await tlsSendCommand(btoa(smtpConfig.username));
    await tlsSendCommand(btoa(smtpConfig.password));
    await tlsSendCommand(`MAIL FROM:<${smtpConfig.username}>`);
    await tlsSendCommand(`RCPT TO:<${to}>`);
    await tlsSendCommand("DATA");
    await tlsSendCommand(message + "\r\n.");
    await tlsSendCommand("QUIT");

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
