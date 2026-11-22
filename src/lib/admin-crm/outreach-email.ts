/**
 * Pure helpers for cold outreach emails: rendering, content checks and the funnel's "what's next".
 * Shared by the admin UI, the send API and the plan validator test.
 */
import type { CrmStatus } from "@/lib/admin-crm/crm-status";
import {
  OUTREACH_FILL_IN_TOKENS,
  SNAPSHOT_LINK_TOKEN,
  type OutreachPlan,
  type OutreachStep,
} from "@/data/outreach/types";

// ── Footer and rendering ──────────────────────────────────────────────────────

export const OUTREACH_SENDER_LINE = "Julius Cecilia · MudKitchen (trymudkitchen.com) · Sage Field, Round Rock, TX";
export const OUTREACH_OPT_OUT_LINE = "If this isn't useful, reply \"no thanks\" and I won't email again.";

/** The legal footer (CAN-SPAM: sender identity, postal address, opt-out). */
export function outreachFooter(mailingAddress: string): string {
  return `${OUTREACH_SENDER_LINE} · ${mailingAddress.trim()}\n${OUTREACH_OPT_OUT_LINE}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function linkify(escaped: string): string {
  return escaped.replace(/https?:\/\/[^\s<]+/g, (url) => `<a href="${url}">${url}</a>`);
}

/** Normalises line endings and trims each paragraph. */
export function normalizeBody(body: string): string {
  return body.replace(/\r\n?/g, "\n").trim();
}

/**
 * The email as it will be sent: plain text plus a minimal HTML version that looks like a personal
 * email (paragraphs only, no logo, no images). The unsubscribe link is appended later by sendZohoEmail.
 */
export function renderOutreachEmail(input: { body: string; mailingAddress: string }): { text: string; html: string } {
  const body = normalizeBody(input.body);
  const footer = outreachFooter(input.mailingAddress);
  const text = `${body}\n\n--\n${footer}`;

  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;">${linkify(escapeHtml(p)).replace(/\n/g, "<br>")}</p>`)
    .join("");
  const footerHtml = `<p style="margin:24px 0 0;font-size:12px;color:#6b6b6b;">${escapeHtml(footer).replace(/\n/g, "<br>")}</p>`;
  const html = `<!doctype html><html><body><div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#222;max-width:560px;">${paragraphs}${footerHtml}</div></body></html>`;

  return { text, html };
}

/** Follow-ups reply in the same thread as the first email. */
export function followUpSubject(firstSubject: string): string {
  return /^re:/i.test(firstSubject.trim()) ? firstSubject.trim() : `Re: ${firstSubject.trim()}`;
}

// ── Content checks ────────────────────────────────────────────────────────────

export type OutreachWarning = {
  code: "placeholder" | "length" | "links" | "stock_phrase" | "subject";
  /** "block" stops a send; "warn" is shown but allowed. */
  level: "block" | "warn";
  message: string;
};

/** Phrases that read as templated or salesy (from the playbook and the cold-email plugin's checks). */
export const STOCK_PHRASES = [
  "quick question",
  "i hope this finds you",
  "hope you're well",
  "hope you are well",
  "worth a look",
  "yours to keep",
  "touch base",
  "circle back",
  "i came across",
  "just following up",
  "following up on my last email",
  "did you get a chance",
  "fellow founder",
  "best-in-class",
  "game-changer",
  "game changer",
  "take it to the next level",
  "streamline",
  "leverage",
];

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countLinks(text: string): number {
  return (text.match(/https?:\/\/\S+|\{loom link\}|\{snapshot link\}/gi) ?? []).length;
}

/** Path of a plan's free snapshot page, or null when it has none. */
export function snapshotPath(plan: Pick<OutreachPlan, "slug" | "snapshot"> | null): string | null {
  if (!plan?.snapshot) return null;
  return `/snapshot/${plan.slug}/${plan.snapshot.token}`;
}

/**
 * Replaces `{snapshot link}` with the plan's snapshot URL. Left as-is when the plan has no
 * snapshot, so the placeholder check blocks the send.
 */
export function fillSnapshotLink(body: string, plan: Pick<OutreachPlan, "slug" | "snapshot"> | null, siteUrl: string): string {
  const path = snapshotPath(plan);
  if (!path || !body.includes(SNAPSHOT_LINK_TOKEN)) return body;
  return body.split(SNAPSHOT_LINK_TOKEN).join(`${siteUrl.replace(/\/+$/, "")}${path}`);
}

/** Leftover `{…}` tokens. `allowFillIns` keeps the known send-time tokens (for plan files). */
export function findPlaceholders(text: string, allowFillIns: boolean): string[] {
  const found = text.match(/\{[^}\n]*\}/g) ?? [];
  const allowed = new Set<string>(allowFillIns ? OUTREACH_FILL_IN_TOKENS : []);
  return found.filter((token) => !allowed.has(token.toLowerCase()));
}

export function outreachWarnings(input: {
  stepId: OutreachStep["id"];
  subject?: string;
  body: string;
  /** true when checking a plan file (fill-in tokens allowed); false right before sending. */
  allowFillIns?: boolean;
}): OutreachWarning[] {
  const warnings: OutreachWarning[] = [];
  const isFirst = input.stepId === "first";
  const words = countWords(input.body);

  const placeholders = findPlaceholders(`${input.subject ?? ""}\n${input.body}`, input.allowFillIns ?? false);
  if (placeholders.length > 0) {
    warnings.push({
      code: "placeholder",
      level: "block",
      message: `Fill in or remove ${placeholders.join(", ")} before sending.`,
    });
  }

  if (input.stepId === "social") {
    if (input.body.length > 200) {
      warnings.push({ code: "length", level: "warn", message: `Social note is ${input.body.length} characters; keep it under 200.` });
    }
  } else {
    const [min, max] = isFirst ? [50, 125] : [20, 80];
    if (words < min || words > max) {
      warnings.push({
        code: "length",
        level: "warn",
        message: `${words} words. ${isFirst ? "A first email" : "A follow-up"} works best at ${min}–${max}.`,
      });
    }
  }

  if (isFirst && countLinks(input.body) > 1) {
    warnings.push({ code: "links", level: "warn", message: "More than one link in a first email hurts delivery. Keep one, or none." });
  }

  const lower = `${input.subject ?? ""}\n${input.body}`.toLowerCase();
  const stock = STOCK_PHRASES.filter((phrase) => lower.includes(phrase));
  if (stock.length > 0) {
    warnings.push({ code: "stock_phrase", level: "warn", message: `Reads as templated: "${stock.join('", "')}".` });
  }

  if (isFirst) {
    const subject = (input.subject ?? "").trim();
    const subjectWords = countWords(subject);
    if (!subject) {
      warnings.push({ code: "subject", level: "block", message: "The first email needs a subject." });
    } else if (/^(re|fwd?):/i.test(subject)) {
      warnings.push({ code: "subject", level: "block", message: "Don't start a first email with \"Re:\" or \"Fwd:\"." });
    } else if (subjectWords < 2 || subjectWords > 6) {
      warnings.push({ code: "subject", level: "warn", message: `Subject is ${subjectWords} words; 2–6 reads best.` });
    }
  }

  return warnings;
}

export function hasBlockingWarning(warnings: OutreachWarning[]): boolean {
  return warnings.some((w) => w.level === "block");
}

// ── Funnel: what's next for a school ─────────────────────────────────────────

export type OutreachStage =
  | "due"
  | "ready"
  | "waiting"
  | "replied"
  | "closed"
  | "do_not_email"
  | "needs_research";

export const OUTREACH_STAGE_ORDER: OutreachStage[] = [
  "due",
  "ready",
  "waiting",
  "replied",
  "closed",
  "do_not_email",
  "needs_research",
];

export const OUTREACH_STAGE_LABEL: Record<OutreachStage, string> = {
  due: "Follow-up due",
  ready: "Ready to send",
  waiting: "Waiting",
  replied: "Replied / call booked",
  closed: "Closed",
  do_not_email: "Do not email",
  needs_research: "Needs research",
};

/** A completed step (an email sent, or a social note logged). */
export type CompletedStep = { stepId: string; at: string };

/** Adds business days (Mon–Fri) to a date, landing at 9am local time. */
export function addBusinessDays(fromIso: string, days: number): Date {
  const d = new Date(fromIso);
  let remaining = days;
  while (remaining > 0) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  d.setHours(9, 0, 0, 0);
  return d;
}

function endOfDay(now: Date): number {
  const d = new Date(now);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

const REPLIED_STATUSES: CrmStatus[] = ["replied", "demo_scheduled", "proposal_sent"];
const CLOSED_STATUSES: CrmStatus[] = ["won", "not_interested"];

/** True when CRM status means the automated outreach sequence must not send (reply or closed deal). */
export function isOutreachSequenceStoppedByCrmStatus(status: CrmStatus): boolean {
  return REPLIED_STATUSES.includes(status) || CLOSED_STATUSES.includes(status);
}

export type NextOutreachStep = {
  stage: OutreachStage;
  /** The next step to do, when there is one. */
  step: OutreachStep | null;
  /** When the next step is due (ISO), after the first email has gone out. */
  dueAt: string | null;
};

export function nextOutreachStep(input: {
  plan: OutreachPlan | null;
  completed: CompletedStep[];
  crmStatus: CrmStatus;
  now?: Date;
}): NextOutreachStep {
  const { plan, completed, crmStatus } = input;
  const now = input.now ?? new Date();

  if (plan?.doNotEmail) return { stage: "do_not_email", step: null, dueAt: null };
  // A reply or a closed deal wins over everything else, plan or no plan.
  if (isOutreachSequenceStoppedByCrmStatus(crmStatus)) {
    return REPLIED_STATUSES.includes(crmStatus)
      ? { stage: "replied", step: null, dueAt: null }
      : { stage: "closed", step: null, dueAt: null };
  }
  if (!plan) return { stage: "needs_research", step: null, dueAt: null };

  const done = new Set(completed.map((c) => c.stepId));
  const first = completed.find((c) => c.stepId === "first");
  const remaining = plan.steps.filter((s) => !done.has(s.id));

  if (!first) {
    const firstStep = plan.steps.find((s) => s.id === "first") ?? null;
    return { stage: firstStep ? "ready" : "needs_research", step: firstStep, dueAt: null };
  }

  const next = remaining[0];
  if (!next) return { stage: "closed", step: null, dueAt: null };

  const due = addBusinessDays(first.at, next.businessDay);
  return {
    stage: due.getTime() <= endOfDay(now) ? "due" : "waiting",
    step: next,
    dueAt: due.toISOString(),
  };
}
