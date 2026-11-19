import { CRM_STATUS_RANK, type CrmStatus } from "@/lib/admin-crm/crm-status";

export const OUTREACH_CHANNELS = ["email", "instagram", "facebook", "linkedin", "phone", "in_person", "other"] as const;
export type OutreachChannel = (typeof OUTREACH_CHANNELS)[number];

export const OUTREACH_CHANNEL_LABEL: Record<OutreachChannel, string> = {
  email: "Email",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  phone: "Phone",
  in_person: "In person",
  other: "Other",
};

export type OutreachDirection = "outbound" | "inbound";

export type DemoOutreachTouch = {
  id: string;
  channel: OutreachChannel;
  direction: OutreachDirection;
  note: string;
  occurredAt: string;
};

/** Outreach state for one demo, read from its linked CRM school (`schools.demo_slug`). */
export type DemoOutreach = {
  schoolId: string;
  crmStatus: CrmStatus;
  lastContactedAt: string | null;
  nextFollowUpAt: string | null;
  contactName: string;
  contactEmail: string;
  /** The school's website from the CRM ("" when unknown). */
  website: string;
  touches: DemoOutreachTouch[];
  /** Outreach steps sent or logged from the funnel (newest first). */
  emails: OutreachEmailRecord[];
};

export type OutreachEmailStatus = "sent" | "skipped_unsubscribed" | "failed" | "logged";

/** One outreach step sent (email) or logged (social note), from `crm_outreach_emails`. */
export type OutreachEmailRecord = {
  id: string;
  stepId: string;
  channel: "email" | "social";
  toEmail: string | null;
  subject: string;
  status: OutreachEmailStatus;
  error: string | null;
  sentAt: string;
};

/** Steps that count as done for the funnel (failed and skipped attempts can be retried). */
export function completedOutreachSteps(emails: OutreachEmailRecord[]): { stepId: string; at: string }[] {
  return emails
    .filter((e) => e.status === "sent" || e.status === "logged")
    .map((e) => ({ stepId: e.stepId, at: e.sentAt }));
}

export function isOutreachChannel(value: unknown): value is OutreachChannel {
  return typeof value === "string" && (OUTREACH_CHANNELS as readonly string[]).includes(value);
}

export function isOutreachDirection(value: unknown): value is OutreachDirection {
  return value === "outbound" || value === "inbound";
}

/**
 * Status after logging a touch. Only ever moves forward through the early pipeline:
 *   outbound: not_contacted → contacted → followed_up
 *   inbound:  anything before replied → replied
 * Later or side states (nurturing, call booked, won, not interested…) are left alone.
 */
export function nextStatusAfterTouch(current: CrmStatus, direction: OutreachDirection): CrmStatus {
  if (direction === "inbound") {
    return CRM_STATUS_RANK[current] < CRM_STATUS_RANK.replied ? "replied" : current;
  }
  if (current === "not_contacted") return "contacted";
  if (current === "contacted") return "followed_up";
  return current;
}

/** True when a follow-up date is set and falls on or before the end of `now`'s day. */
export function isFollowUpDue(nextFollowUpAt: string | null, now: Date = new Date()): boolean {
  if (!nextFollowUpAt) return false;
  const due = new Date(nextFollowUpAt);
  if (Number.isNaN(due.getTime())) return false;
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  return due.getTime() <= endOfToday.getTime();
}
