import nodemailer from "nodemailer";
import { isOutboundEmailDisabled } from "@/lib/outbound-email";

function readSmtpEnv() {
  return {
    host: process.env.ZOHO_SMTP_HOST ?? "smtp.zoho.com",
    port: parseInt(process.env.ZOHO_SMTP_PORT ?? "465", 10),
    user: process.env.ZOHO_SMTP_USER,
    password: process.env.ZOHO_SMTP_PASSWORD,
    fromAddress: process.env.ZOHO_FROM_ADDRESS,
    fromName: process.env.ZOHO_FROM_NAME ?? "Julius Cecilia",
  };
}

export function isSmtpConfigured(): boolean {
  if (isOutboundEmailDisabled()) return false;
  const env = readSmtpEnv();
  return !!(env.user && env.password && env.fromAddress);
}

export type EmailAttachment = {
  filename: string;
  content: string;
  contentType?: string;
};

export async function sendViaSmtp(opts: {
  toAddress: string;
  subject: string;
  html: string;
  /** Optional plain-text part (sent as multipart/alternative with the HTML). */
  text?: string;
  /** Optional Message-ID, so a later email can thread under this one. */
  messageId?: string;
  /** Threading headers for a reply in the same conversation. */
  inReplyTo?: string;
  references?: string[];
  attachments?: EmailAttachment[];
}): Promise<{ success: boolean; error?: string }> {
  const env = readSmtpEnv();
  if (!isSmtpConfigured()) {
    return { success: false, error: "Zoho SMTP is not configured" };
  }

  try {
    const transport = nodemailer.createTransport({
      host: env.host,
      port: env.port,
      secure: env.port === 465,
      auth: {
        user: env.user,
        pass: env.password,
      },
    });

    await transport.sendMail({
      from: {
        name: env.fromName,
        address: env.fromAddress!,
      },
      to: opts.toAddress,
      subject: opts.subject,
      html: opts.html,
      ...(opts.text ? { text: opts.text } : {}),
      ...(opts.messageId ? { messageId: opts.messageId } : {}),
      ...(opts.inReplyTo ? { inReplyTo: opts.inReplyTo } : {}),
      ...(opts.references?.length ? { references: opts.references } : {}),
      ...(opts.attachments?.length ? { attachments: opts.attachments } : {}),
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
