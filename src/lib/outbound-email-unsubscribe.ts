import { createHmac, timingSafeEqual } from "node:crypto";
import type { OutboundEmailDiscordMeta } from "@/lib/discord";
import { SITE_URL } from "@/lib/site";
import type { OutboundEmailSuppressionRow } from "@/lib/outbound-email-suppressions-types";
import { createAdminClient } from "@/utils/supabase/admin";

const FONT_BODY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

/** Channels that bypass marketing unsubscribe (receipts, confirmations, critical payment notices). */
export const TRANSACTIONAL_OUTBOUND_EMAIL_CHANNELS = new Set<string>([
  "demo_booking_confirmation",
  "homepage_question_confirmation",
  "public_support_request_confirmation",
  "demo_feedback_confirmation",
  "admin_support_request_confirmation",
  "application_submitted_confirmation",
  "application_accepted_enrollment",
  "enrollment_completed_confirmation",
  "post_submit_visit_confirmation",
  "public_campus_tour_confirmation",
  "admissions_payment_receipt",
  "tuition_payment_receipt",
  "application_submitted_owner_notification",
  "post_submit_visit_owner_notification",
  "payment_received_admin_notification",
  "ach_bank_verification",
  "ach_bank_verification_admin_notification",
  "tuition_ach_settlement_failed",
  "stripe_payments_ready",
  "friday_branch_enrollment_admin",
  "committee_join_request_admin",
  "committee_task_assigned",
  "committee_join_approved",
  "committee_unread_catchup",
  "teacher_parent_form_response_signed",
  "tuition_invoice",
  "tuition_autopay_failed",
  "new_message",
]);

export type OutboundEmailSendClass = "transactional" | "marketing";

export function normalizeOutboundEmail(raw: string): string {
  if (!raw) return "";
  const cleaned = raw
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
  const match = cleaned.match(/<([^>]+)>/);
  const address = match ? match[1] : cleaned.replace(/"/g, "").trim();
  return address.toLowerCase();
}

function unsubscribeSecret(): string {
  const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET;
  if (!secret) {
    throw new Error("EMAIL_UNSUBSCRIBE_SECRET is not set");
  }
  return secret;
}

export function signUnsubscribeToken(email: string): string {
  const normalized = normalizeOutboundEmail(email);
  return createHmac("sha256", unsubscribeSecret())
    .update(normalized)
    .digest("base64url");
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!token) return false;
  try {
    const expected = signUnsubscribeToken(email);
    const a = Buffer.from(expected);
    const b = Buffer.from(token);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function buildUnsubscribeUrl(email: string): string {
  const normalized = normalizeOutboundEmail(email);
  const token = signUnsubscribeToken(normalized);
  const params = new URLSearchParams({
    email: normalized,
    token,
  });
  return `${SITE_URL}/email/unsubscribe?${params.toString()}`;
}

export function appendUnsubscribeFooter(html: string, email: string): string {
  let url: string;
  try {
    url = buildUnsubscribeUrl(email);
  } catch {
    return html;
  }

  const footer = `<p style="margin:20px 0 0;font-family:${FONT_BODY};font-size:10px;line-height:1.4;text-align:center;opacity:0.45;">
  <a href="${url}" style="color:inherit;text-decoration:underline;">Unsubscribe from non-essential emails</a>
</p>`;

  if (html.includes("</body>")) {
    return html.replace("</body>", `${footer}</body>`);
  }
  return `${html}${footer}`;
}

export function isTransactionalOutboundEmail(input: {
  sendClass?: OutboundEmailSendClass;
  discord?: OutboundEmailDiscordMeta;
}): boolean {
  if (input.sendClass === "transactional") return true;
  if (input.sendClass === "marketing") return false;
  const channel = input.discord?.channel;
  if (!channel) return false;
  return TRANSACTIONAL_OUTBOUND_EMAIL_CHANNELS.has(channel);
}

export async function isOutboundEmailSuppressedForMarketing(
  email: string,
): Promise<boolean> {
  const normalized = normalizeOutboundEmail(email);
  if (!normalized) return false;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("outbound_email_suppressions")
    .select("status")
    .eq("email", normalized)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load outbound email suppression: ${error.message}`,
    );
  }

  if (!data) return false;
  if (data.status === "whitelisted") return false;
  return data.status === "unsubscribed";
}

export async function recordOutboundEmailUnsubscribe(input: {
  email: string;
  source: "link" | "admin";
  updatedBy?: string | null;
  notes?: string | null;
}): Promise<void> {
  const normalized = normalizeOutboundEmail(input.email);
  if (!normalized) {
    throw new Error("Invalid email address");
  }

  const now = new Date().toISOString();
  const supabase = createAdminClient();
  const { error } = await supabase.from("outbound_email_suppressions").upsert(
    {
      email: normalized,
      status: "unsubscribed",
      unsubscribed_at: now,
      whitelisted_at: null,
      source: input.source,
      notes: input.notes ?? null,
      updated_by: input.updatedBy ?? null,
      updated_at: now,
    },
    { onConflict: "email" },
  );

  if (error) {
    throw new Error(`Failed to record unsubscribe: ${error.message}`);
  }
}

export async function whitelistOutboundEmail(input: {
  email: string;
  notes?: string | null;
  updatedBy?: string | null;
}): Promise<void> {
  const normalized = normalizeOutboundEmail(input.email);
  if (!normalized) {
    throw new Error("Invalid email address");
  }

  const now = new Date().toISOString();
  const supabase = createAdminClient();
  const { error } = await supabase.from("outbound_email_suppressions").upsert(
    {
      email: normalized,
      status: "whitelisted",
      whitelisted_at: now,
      source: "admin",
      notes: input.notes ?? null,
      updated_by: input.updatedBy ?? null,
      updated_at: now,
    },
    { onConflict: "email" },
  );

  if (error) {
    throw new Error(`Failed to whitelist email: ${error.message}`);
  }
}

export type { OutboundEmailSuppressionRow } from "@/lib/outbound-email-suppressions-types";

export async function listOutboundEmailSuppressions(): Promise<
  OutboundEmailSuppressionRow[]
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("outbound_email_suppressions")
    .select(
      "email, status, unsubscribed_at, whitelisted_at, source, notes, updated_at, created_at",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list suppressions: ${error.message}`);
  }

  return (data ?? []) as OutboundEmailSuppressionRow[];
}
