"use client";

import { readFirstTouch } from "@/lib/marketing/attribution";
import type { FreeToolPlanId, LeadMagnet } from "@/lib/marketing/lead-magnets";
import { PUBLIC_FORM_HONEYPOT_FIELD } from "@/lib/public-forms/honeypot";

/** localStorage flag: once someone has given us their email, stop showing the lead popup. */
export const LEAD_CAPTURED_KEY = "mk-lead-captured";
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
  try {
    const res = await fetch("/api/marketing-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...fields,
        sourcePath: window.location.pathname,
        attribution: readFirstTouch(),
        [PUBLIC_FORM_HONEYPOT_FIELD]: companyWebsite ?? "",
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      return { ok: false, error: data.error ?? "Something went wrong. Please try again." };
    }
    markLeadCaptured();
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong. Please check your connection and try again." };
  }
}
