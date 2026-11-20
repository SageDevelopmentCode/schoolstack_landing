import { PARTIAL_BOOKING_DEDUPE_MS } from "@/lib/marketing/partial-booking-dedupe";

export type PartialBookingDraft = {
  leadId: string;
  token: string;
  email: string;
  savedAt: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isUsablePartialBookingDraft(
  draft: PartialBookingDraft,
  submitEmail: string,
  nowMs = Date.now(),
): boolean {
  if (
    typeof draft.leadId !== "string" ||
    typeof draft.token !== "string" ||
    typeof draft.email !== "string" ||
    typeof draft.savedAt !== "string"
  ) {
    return false;
  }
  if (normalizeEmail(draft.email) !== normalizeEmail(submitEmail)) {
    return false;
  }
  const savedMs = Date.parse(draft.savedAt);
  if (Number.isNaN(savedMs)) {
    return false;
  }
  return nowMs - savedMs <= PARTIAL_BOOKING_DEDUPE_MS;
}

/** Accepts legacy sessionStorage payloads that omitted email/savedAt. */
export function parsePartialBookingDraft(raw: unknown): PartialBookingDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const draft = raw as PartialBookingDraft;
  if (typeof draft.leadId === "string" && typeof draft.token === "string") {
    return draft;
  }
  return null;
}