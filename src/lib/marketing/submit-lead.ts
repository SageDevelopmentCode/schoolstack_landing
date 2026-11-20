"use client";

import { readFirstTouch } from "@/lib/marketing/attribution";
import type { FreeToolPlanId, LeadMagnet } from "@/lib/marketing/lead-magnets";
import {
  isUsablePartialBookingDraft,
  parsePartialBookingDraft,
  type PartialBookingDraft,
} from "@/lib/marketing/partial-booking-draft";
import { PUBLIC_FORM_HONEYPOT_FIELD } from "@/lib/public-forms/honeypot";

/** localStorage flag: once someone has given us their email, stop showing the lead popup. */
export const LEAD_CAPTURED_KEY = "mk-lead-captured";
/** sessionStorage: HMAC continuation for updating the same partial_booking row. */
export const PARTIAL_BOOKING_DRAFT_KEY = "mk-partial-booking-draft";
/** Window event fired by the booking flow whenever its step changes (detail: step number). */
export const BOOKING_STEP_EVENT = "mk-booking-step";

export function markLeadCaptured() {
  try {
    window.localStorage.setItem(LEAD_CAPTURED_KEY, new Date().toISOString());
  } catch {
    // Storage blocked: the popup may show again, which is acceptable.
  }
}

export function hasCapturedLead(): boolean {
  try {
    return Boolean(window.localStorage.getItem(LEAD_CAPTURED_KEY));
  } catch {
    return false;
  }
}

function readPartialBookingDraft(): PartialBookingDraft | null {
  try {
    const raw = window.sessionStorage.getItem(PARTIAL_BOOKING_DRAFT_KEY);
    if (!raw) return null;
    return parsePartialBookingDraft(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writePartialBookingDraft(draft: PartialBookingDraft) {
  try {
    window.sessionStorage.setItem(PARTIAL_BOOKING_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage blocked: updates may create duplicate leads instead of de-duping.
  }
}

export function clearPartialBookingDraft() {
  try {
    window.sessionStorage.removeItem(PARTIAL_BOOKING_DRAFT_KEY);
  } catch {
    // Ignore.
  }
}

export type SubmitLeadInput = {
  magnet: Extract<LeadMagnet, "custom_demo" | "partial_booking" | "tool_plan">;
  email: string;
  name?: string;
  schoolName?: string;
  websiteUrl?: string;
  role?: string;
  message?: string;
  placement?: string;
  toolId?: FreeToolPlanId;
  planLines?: string[];
  companyWebsite?: string;
};

export type SubmitLeadResult = { ok: true } | { ok: false; error: string };

export async function submitLead(input: SubmitLeadInput): Promise<SubmitLeadResult> {
  const { companyWebsite, ...fields } = input;
  let partialDraft: PartialBookingDraft | null =
    fields.magnet === "partial_booking" ? readPartialBookingDraft() : null;
  if (
    partialDraft &&
    !isUsablePartialBookingDraft(partialDraft, fields.email)
  ) {
    clearPartialBookingDraft();
    partialDraft = null;
  }
  try {
    const res = await fetch("/api/marketing-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...fields,
        ...(partialDraft
          ? { partialLeadId: partialDraft.leadId, partialLeadToken: partialDraft.token }
          : {}),
        sourcePath: window.location.pathname,
        attribution: readFirstTouch(),
        [PUBLIC_FORM_HONEYPOT_FIELD]: companyWebsite ?? "",
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      partialLeadId?: string;
      partialLeadToken?: string;
    };
    if (!res.ok) {
      return { ok: false, error: data.error ?? "Something went wrong. Please try again." };
    }
    if (
      fields.magnet === "partial_booking" &&
      typeof data.partialLeadId === "string" &&
      typeof data.partialLeadToken === "string"
    ) {
      writePartialBookingDraft({
        leadId: data.partialLeadId,
        token: data.partialLeadToken,
        email: fields.email.trim().toLowerCase(),
        savedAt: new Date().toISOString(),
      });
    }
    markLeadCaptured();
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong. Please check your connection and try again." };
  }
}