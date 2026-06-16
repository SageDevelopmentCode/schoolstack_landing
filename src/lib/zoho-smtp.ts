import nodemailer from "nodemailer";

const ZOHO_SMTP_HOST = process.env.ZOHO_SMTP_HOST ?? "smtp.zoho.com";
const ZOHO_SMTP_PORT = parseInt(process.env.ZOHO_SMTP_PORT ?? "465", 10);
const ZOHO_SMTP_USER = process.env.ZOHO_SMTP_USER;
const ZOHO_SMTP_PASSWORD = process.env.ZOHO_SMTP_PASSWORD;
const ZOHO_FROM_ADDRESS = process.env.ZOHO_FROM_ADDRESS;
const ZOHO_FROM_NAME = process.env.ZOHO_FROM_NAME ?? "Julius Cecilia";

export function isSmtpConfigured(): boolean {
  return !!(ZOHO_SMTP_USER && ZOHO_SMTP_PASSWORD && ZOHO_FROM_ADDRESS);
}

export async function sendViaSmtp(opts: {
  toAddress: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!isSmtpConfigured()) {
    return { success: false, error: "Zoho SMTP is not configured" };
  }

  try {
    const transport = nodemailer.createTransport({
      host: ZOHO_SMTP_HOST,
      port: ZOHO_SMTP_PORT,
      secure: ZOHO_SMTP_PORT === 465,
      auth: {
        user: ZOHO_SMTP_USER,
        pass: ZOHO_SMTP_PASSWORD,
      },
    });

    await transport.sendMail({
      from: {
        name: ZOHO_FROM_NAME,
        address: ZOHO_FROM_ADDRESS!,
      },
      to: opts.toAddress,
      subject: opts.subject,
      html: opts.html,
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
