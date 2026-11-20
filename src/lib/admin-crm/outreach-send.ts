import "server-only";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { OutreachPlan } from "@/data/outreach/types";
import {
  ensureSchoolForDemo,
  listOutreachEmails,
  loadOutreach,
  logDemoOutreachTouch,
} from "@/lib/admin-crm/demo-outreach";
import { completedOutreachSteps, type DemoOutreach, type OutreachChannel } from "@/lib/admin-crm/demo-outreach-types";
import { isCrmStatus } from "@/lib/admin-crm/crm-status";
import {
  followUpSubject,
  hasBlockingWarning,
  isOutreachSequenceStoppedByCrmStatus,
  nextOutreachStep,
  outreachWarnings,
  renderOutreachEmail,
  type OutreachWarning,
} from "@/lib/admin-crm/outreach-email";
import { isOutboundEmailDisabled } from "@/lib/outbound-email";
import { sendZohoEmail } from "@/lib/zoho";

/** Hunter's 2026 data: reply rates hold up to ~50 sends per inbox per day. Stay under that. */
export const OUTREACH_DAILY_SEND_CAP = 40;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class OutreachSendError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
    readonly warnings: OutreachWarning[] = [],
  ) {
    super(message);
  }
}

export const POSTAL_ADDRESS_MISSING_MESSAGE =
  "Set OUTREACH_POSTAL_ADDRESS to a street address, PO box or virtual mailbox (not an email). US law (CAN-SPAM) requires one in every cold email.";

export const OUTREACH_SEQUENCE_STOPPED_MESSAGE =
  "They've replied or the deal has moved on, so the sequence has stopped.";

/**
 * The postal address printed in every cold email's footer (CAN-SPAM). Not the sender's email:
 * that's ZOHO_FROM_ADDRESS. OUTREACH_MAILING_ADDRESS is the old name, still read for now.
 * A value containing "@" is treated as missing so an email address can't slip in.
 */
export function getOutreachPostalAddress(): string | null {
  const value = (process.env.OUTREACH_POSTAL_ADDRESS ?? process.env.OUTREACH_MAILING_ADDRESS)?.trim();
  if (!value || value.includes("@")) return null;
  return value;
}

type Demo = { slug: string; schoolName: string };

export type OutreachDraftInput = {
  stepId: string;
  subject?: string;
  body: string;
};

/** The subject an email step will go out with: the first email's own, or "Re: <first subject>". */
async function resolveSubject(
  supabase: SupabaseClient,
  schoolId: string | null,
  stepId: string,
  draftSubject: string | undefined,
): Promise<{ subject: string; firstMessageId: string | null; references: string[] }> {
  if (stepId === "first") return { subject: (draftSubject ?? "").trim(), firstMessageId: null, references: [] };
  if (!schoolId) throw new OutreachSendError("Send the first email before any follow-up.", "first_not_sent", 409);

  const { data, error } = await supabase
    .from("crm_outreach_emails")
    .select("step_id, subject, message_id, sent_at")
    .eq("school_id", schoolId)
    .eq("channel", "email")
    .eq("status", "sent")
    .order("sent_at", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as { step_id: string; subject: string; message_id: string | null }[];
  const first = rows.find((r) => r.step_id === "first");
  if (!first) throw new OutreachSendError("Send the first email before any follow-up.", "first_not_sent", 409);

  return {
    subject: followUpSubject(first.subject),
    firstMessageId: first.message_id,
    references: rows.map((r) => r.message_id).filter((id): id is string => Boolean(id)),
  };
}

/** Exactly what an email step will look like, plus the content checks (no side effects). */
export async function previewOutreachEmail(
  supabase: SupabaseClient,
  input: { plan: OutreachPlan; schoolId: string | null; draft: OutreachDraftInput },
): Promise<{ subject: string; text: string; html: string; warnings: OutreachWarning[]; mailingAddressMissing: boolean }> {
  const step = input.plan.steps.find((s) => s.id === input.draft.stepId);
  if (!step || step.kind !== "email") throw new OutreachSendError("Unknown email step.", "unknown_step", 400);

  let subject = (input.draft.subject ?? "").trim();
  const warnings: OutreachWarning[] = [];
  try {
    subject = (await resolveSubject(supabase, input.schoolId, step.id, input.draft.subject)).subject;
  } catch (error) {
    if (!(error instanceof OutreachSendError)) throw error;
    warnings.push({ code: "subject", level: "block", message: error.message });
  }

  const mailingAddress = getOutreachPostalAddress();
  const rendered = renderOutreachEmail({ body: input.draft.body, mailingAddress: mailingAddress ?? "{postal address}" });
  warnings.push(...outreachWarnings({ stepId: step.id, subject: step.id === "first" ? subject : undefined, body: input.draft.body }));
  return { subject, ...rendered, warnings, mailingAddressMissing: !mailingAddress };
}

export type SendOutreachResult = {
  status: "sent" | "skipped_unsubscribed";
  /** True when DISABLE_OUTBOUND_EMAIL is on: logged, but nothing left the server. */
  dryRun: boolean;
  outreach: DemoOutreach;
};

export async function sendOutreachEmail(
  supabase: SupabaseClient,
  input: {
    demo: Demo;
    plan: OutreachPlan;
    draft: OutreachDraftInput;
    toEmail: string;
    factsChecked: boolean;
    userId: string;
    now?: Date;
  },
): Promise<SendOutreachResult> {
  const { demo, plan, draft } = input;
  const now = input.now ?? new Date();

  if (plan.doNotEmail) {
    throw new OutreachSendError(`Don't email ${plan.schoolName}: ${plan.doNotEmail.reason}`, "do_not_email", 409);
  }
  const step = plan.steps.find((s) => s.id === draft.stepId);
  if (!step || step.kind !== "email") throw new OutreachSendError("Unknown email step.", "unknown_step", 400);

  const mailingAddress = getOutreachPostalAddress();
  if (!mailingAddress) {
    throw new OutreachSendError(POSTAL_ADDRESS_MISSING_MESSAGE, "mailing_address_missing", 503);
  }

  const toEmail = input.toEmail.trim().toLowerCase();
  if (!EMAIL_RE.test(toEmail)) throw new OutreachSendError("Enter a valid email address.", "invalid_email", 400);
  if (plan.checkBeforeSending.length > 0 && !input.factsChecked) {
    throw new OutreachSendError("Confirm you've checked the facts flagged for this school.", "facts_unchecked", 400);
  }

  const school = await ensureSchoolForDemo(supabase, demo);
  const crmStatus = isCrmStatus(school.crm_status) ? school.crm_status : "not_contacted";
  if (isOutreachSequenceStoppedByCrmStatus(crmStatus)) {
    throw new OutreachSendError(OUTREACH_SEQUENCE_STOPPED_MESSAGE, "outreach_stopped", 409);
  }

  const { subject, firstMessageId, references } = await resolveSubject(supabase, school.id, step.id, draft.subject);

  const warnings = outreachWarnings({ stepId: step.id, subject: step.id === "first" ? subject : undefined, body: draft.body });
  if (hasBlockingWarning(warnings)) {
    throw new OutreachSendError(warnings.filter((w) => w.level === "block").map((w) => w.message).join(" "), "content_blocked", 400, warnings);
  }

  const existing = await listOutreachEmails(supabase, [school.id]);
  if (completedOutreachSteps(existing.get(school.id) ?? []).some((c) => c.stepId === step.id)) {
    throw new OutreachSendError("This step was already sent to this school.", "already_sent", 409);
  }

  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from("crm_outreach_emails")
    .select("id", { count: "exact", head: true })
    .eq("channel", "email")
    .in("status", ["sent", "sending"])
    .gte("sent_at", since);
  if (countError) throw countError;
  if ((count ?? 0) >= OUTREACH_DAILY_SEND_CAP) {
    throw new OutreachSendError(
      `${OUTREACH_DAILY_SEND_CAP} outreach emails have gone out in the last 24 hours. Send more tomorrow to protect deliverability.`,
      "daily_cap",
      429,
    );
  }

  const { text, html } = renderOutreachEmail({ body: draft.body, mailingAddress });
  const domain = process.env.ZOHO_FROM_ADDRESS?.split("@")[1] ?? "trymudkitchen.com";
  const messageId = `<outreach-${randomUUID()}@${domain}>`;
  const dryRun = isOutboundEmailDisabled();

  // Claim the step before emailing: the unique index allows one 'sending' / 'sent' row per
  // school + step, so a concurrent request fails here instead of sending a second email.
  const claimId = await claimOutreachStep(supabase, {
    school_id: school.id,
    demo_slug: demo.slug,
    step_id: step.id,
    channel: "email",
    to_email: toEmail,
    subject,
    body_text: text,
    in_reply_to: firstMessageId,
    sent_by: input.userId,
    sent_at: now.toISOString(),
  }, now);

  let result: Awaited<ReturnType<typeof sendZohoEmail>>;
  try {
    result = await sendZohoEmail({
      toAddress: toEmail,
      subject,
      content: html,
      text,
      messageId,
      inReplyTo: firstMessageId ?? undefined,
      references: references.length > 0 ? references : undefined,
      sendClass: "marketing",
      discord: {
        channel: "demo_outreach",
        audience: "prospect",
        surface: "web",
        entityType: "demo_outreach",
        entityId: `${demo.slug}:${step.id}`,
      },
    });
  } catch (error) {
    await supabase
      .from("crm_outreach_emails")
      .update({ status: "failed", error: error instanceof Error ? error.message : "Zoho send failed" })
      .eq("id", claimId);
    throw error;
  }

  const status = !result.success ? "failed" : "skipped" in result && result.skipped ? "skipped_unsubscribed" : "sent";
  const { error: updateError } = await supabase
    .from("crm_outreach_emails")
    .update({
      message_id: status === "sent" ? messageId : null,
      status,
      error: !result.success
        ? result.error ?? "Zoho send failed"
        : dryRun
          ? "DISABLE_OUTBOUND_EMAIL is on: logged but not actually sent"
          : null,
    })
    .eq("id", claimId);
  if (updateError) throw updateError;

  if (!result.success) {
    throw new OutreachSendError(`Zoho didn't send it: ${result.error ?? "unknown error"}`, "send_failed", 502);
  }

  if (status === "sent") {
    await recordCompletedStep(supabase, {
      plan,
      schoolId: school.id,
      note: `${step.id === "first" ? "First email" : step.id} sent: "${subject}"`,
      channel: "email",
      userId: input.userId,
      now,
      school,
    });
    if (!school.contact_email) {
      const { error } = await supabase.from("schools").update({ contact_email: toEmail }).eq("id", school.id);
      if (error) throw error;
    }
  }

  const finalStatus = status === "skipped_unsubscribed" ? "skipped_unsubscribed" : "sent";
  return { status: finalStatus, dryRun, outreach: await loadOutreach(supabase, school.id) };
}

/** A 'sending' claim older than this belongs to a request that died mid-send. */
const STALE_SEND_CLAIM_MS = 10 * 60 * 1000;

/**
 * Inserts the 'sending' row that reserves an email step for one request, and returns its id.
 * Throws `already_sent` when another request holds the step or it already went out.
 */
async function claimOutreachStep(
  supabase: SupabaseClient,
  row: {
    school_id: string;
    demo_slug: string;
    step_id: string;
    channel: "email";
    to_email: string;
    subject: string;
    body_text: string;
    in_reply_to: string | null;
    sent_by: string;
    sent_at: string;
  },
  now: Date,
): Promise<string> {
  // Free a step left reserved by a request that crashed, so it isn't blocked forever.
  const { error: staleError } = await supabase
    .from("crm_outreach_emails")
    .update({ status: "failed", error: "Send was interrupted. Check the Zoho Sent folder before retrying." })
    .eq("school_id", row.school_id)
    .eq("step_id", row.step_id)
    .eq("status", "sending")
    .lt("sent_at", new Date(now.getTime() - STALE_SEND_CLAIM_MS).toISOString());
  if (staleError) throw staleError;

  const { data, error } = await supabase
    .from("crm_outreach_emails")
    .insert({ ...row, status: "sending" })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") {
      throw new OutreachSendError("This step is already being sent or was sent to this school.", "already_sent", 409);
    }
    throw error;
  }
  return (data as { id: string }).id;
}

/** Logs a touch for a completed step and sets the follow-up date to the next step's due date. */
async function recordCompletedStep(
  supabase: SupabaseClient,
  input: {
    plan: OutreachPlan;
    schoolId: string;
    note: string;
    channel: OutreachChannel;
    userId: string;
    now: Date;
    school: { id: string; crm_status: string; last_contacted_at: string | null };
  },
) {
  const current = await loadOutreach(supabase, input.schoolId);
  const next = nextOutreachStep({
    plan: input.plan,
    completed: completedOutreachSteps(current.emails),
    crmStatus: current.crmStatus,
    now: input.now,
  });
  await logDemoOutreachTouch(supabase, { ...input.school, crm_status: current.crmStatus, last_contacted_at: current.lastContactedAt }, {
    channel: input.channel,
    direction: "outbound",
    note: input.note,
    occurredAt: input.now.toISOString(),
    nextFollowUpAt: next.dueAt,
    createdBy: input.userId,
  });
}

const SOCIAL_CHANNELS: OutreachChannel[] = ["instagram", "facebook", "linkedin"];

/** Marks the social step as done (sent by hand on Instagram, Facebook or LinkedIn). */
export async function logOutreachSocialStep(
  supabase: SupabaseClient,
  input: { demo: Demo; plan: OutreachPlan; channel: OutreachChannel; userId: string; now?: Date },
): Promise<DemoOutreach> {
  const now = input.now ?? new Date();
  const step = input.plan.steps.find((s) => s.id === "social");
  if (!step || step.kind !== "social") throw new OutreachSendError("This plan has no social step.", "unknown_step", 400);
  if (!SOCIAL_CHANNELS.includes(input.channel)) {
    throw new OutreachSendError("Pick Instagram, Facebook or LinkedIn.", "invalid_channel", 400);
  }

  const school = await ensureSchoolForDemo(supabase, input.demo);
  const crmStatus = isCrmStatus(school.crm_status) ? school.crm_status : "not_contacted";
  if (isOutreachSequenceStoppedByCrmStatus(crmStatus)) {
    throw new OutreachSendError(OUTREACH_SEQUENCE_STOPPED_MESSAGE, "outreach_stopped", 409);
  }

  const existing = await listOutreachEmails(supabase, [school.id]);
  if (completedOutreachSteps(existing.get(school.id) ?? []).some((c) => c.stepId === "social")) {
    throw new OutreachSendError("The social note is already logged for this school.", "already_sent", 409);
  }

  const { error } = await supabase.from("crm_outreach_emails").insert({
    school_id: school.id,
    demo_slug: input.demo.slug,
    step_id: "social",
    channel: "social",
    subject: "",
    body_text: step.body,
    status: "logged",
    sent_by: input.userId,
    sent_at: now.toISOString(),
  });
  if (error) {
    if (error.code === "23505") {
      throw new OutreachSendError("The social note is already logged for this school.", "already_sent", 409);
    }
    throw error;
  }

  await recordCompletedStep(supabase, {
    plan: input.plan,
    schoolId: school.id,
    note: `Social note sent on ${input.channel}`,
    channel: input.channel,
    userId: input.userId,
    now,
    school,
  });
  return loadOutreach(supabase, school.id);
}
