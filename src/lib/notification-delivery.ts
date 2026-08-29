import { isZohoConfigured, sendZohoEmail } from "@/lib/zoho";

export async function ensureZohoConfigured(channel: string): Promise<void> {
  if (!(await isZohoConfigured())) {
    throw new Error(`${channel}: Zoho outbound email is not configured`);
  }
}

export async function deliverZohoEmail(input: {
  channel: string;
  toAddress: string;
  subject: string;
  content: string;
}): Promise<void> {
  await ensureZohoConfigured(input.channel);

  const result = await sendZohoEmail({
    toAddress: input.toAddress,
    subject: input.subject,
    content: input.content,
  });

  if (!result.success) {
    throw new Error(
      `${input.channel} email failed: ${result.error ?? "unknown error"}`,
    );
  }
}
