import type { OutboundEmailDiscordMeta } from "@/lib/discord";
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
  discord: OutboundEmailDiscordMeta;
  sendClass?: import("@/lib/outbound-email-unsubscribe").OutboundEmailSendClass;
}): Promise<void> {
  await ensureZohoConfigured(input.channel);

  const result = await sendZohoEmail({
    toAddress: input.toAddress,
    subject: input.subject,
    content: input.content,
    sendClass: input.sendClass,
    discord: {
      ...input.discord,
      channel: input.discord.channel || input.channel,
    },
  });

  if (!result.success) {
    throw new Error(
      `${input.channel} email failed: ${result.error ?? "unknown error"}`,
    );
  }
}
