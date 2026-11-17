import type { ClassroomSignupResponse } from "./types";

/** At most one reminder per signup in this window. */
export const SIGNUP_REMINDER_COOLDOWN_MS = 60 * 60 * 1000;
export const SIGNUP_REMINDER_MAX_MESSAGE_LENGTH = 1000;

/** Audience families that haven't confirmed a response yet (deduped, order kept). */
export function familiesToRemind(
  audienceFamilyIds: string[],
  responses: Pick<ClassroomSignupResponse, "familyId" | "status">[],
): string[] {
  const responded = new Set(responses.filter((r) => r.status === "confirmed").map((r) => r.familyId));
  return [...new Set(audienceFamilyIds)].filter((id) => !responded.has(id));
}

/** Milliseconds until another reminder may go out (0 = now). */
export function reminderCooldownRemainingMs(lastSentAt: string | null, now: Date): number {
  if (!lastSentAt) return 0;
  const sent = new Date(lastSentAt).getTime();
  if (Number.isNaN(sent)) return 0;
  return Math.max(0, sent + SIGNUP_REMINDER_COOLDOWN_MS - now.getTime());
}

export function validateReminderMessage(
  message: unknown,
): { ok: true; message: string } | { ok: false; error: string } {
  const text = typeof message === "string" ? message.trim() : "";
  if (!text) return { ok: false, error: "Write a short message for families." };
  if (text.length > SIGNUP_REMINDER_MAX_MESSAGE_LENGTH) {
    return { ok: false, error: `Keep the message under ${SIGNUP_REMINDER_MAX_MESSAGE_LENGTH} characters.` };
  }
  return { ok: true, message: text };
}

/** "in 42 minutes" / "in 1 minute" for the cooldown note. */
export function formatReminderRetryAfter(ms: number): string {
  const minutes = Math.max(1, Math.ceil(ms / 60000));
  return `in ${minutes} minute${minutes === 1 ? "" : "s"}`;
}
