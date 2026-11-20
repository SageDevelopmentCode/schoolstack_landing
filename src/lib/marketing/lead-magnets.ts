/** Shared (client + server) definitions for the marketing lead magnets. */

export const LEAD_MAGNETS = [
  "custom_demo",
  "partial_booking",
  "tool_plan",
  "template",
  "popup",
] as const;
export type LeadMagnet = (typeof LEAD_MAGNETS)[number];

export function isLeadMagnet(value: unknown): value is LeadMagnet {
  return typeof value === "string" && (LEAD_MAGNETS as readonly string[]).includes(value);
}

export const LEAD_MAGNET_LABELS: Record<LeadMagnet, string> = {
  custom_demo: "Custom demo request",
  partial_booking: "Unfinished demo booking",
  tool_plan: "Free tool plan emailed",
  template: "Template download",
  popup: "Popup",
};

export const LEAD_STATUSES = ["new", "building", "delivered", "booked", "dead"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  building: "Building",
  delivered: "Delivered",
  booked: "Booked",
  dead: "Closed",
};

/** Free tools that can email the visitor their results. */
export const FREE_TOOL_PLAN_IDS = ["enrollment-calculator", "tuition-planner", "ops-check"] as const;
export type FreeToolPlanId = (typeof FREE_TOOL_PLAN_IDS)[number];

export const FREE_TOOL_PLAN_NAMES: Record<FreeToolPlanId, string> = {
  "enrollment-calculator": "How many students do you need?",
  "tuition-planner": "Tuition scenario planner",
  "ops-check": "Microschool ops check",
};

export const FREE_TOOL_PLAN_PATHS: Record<FreeToolPlanId, string> = {
  "enrollment-calculator": "/how-many-students",
  "tuition-planner": "/tuition-planner",
  "ops-check": "/microschool-ops-check",
};

export function isFreeToolPlanId(value: unknown): value is FreeToolPlanId {
  return typeof value === "string" && (FREE_TOOL_PLAN_IDS as readonly string[]).includes(value);
}

/** Roles shared with the booking form (`demo_requests.role`). */
export const LEAD_ROLES = ["starting", "running", "private", "program", "other"] as const;

export const PLAN_EMAIL_MAX_LINES = 150;
export const PLAN_EMAIL_MAX_LINE_LENGTH = 400;

const URL_PATTERN = /\b(?:https?:\/\/|www\.)\S+/gi;
const BARE_DOMAIN_PATTERN = /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|io|co|ly|me|info|biz|xyz|app|link|site|online|ru|cn)\b\S*/gi;

/**
 * Plan text is built in the browser and emailed to whatever address the visitor typed, so
 * the server treats it as untrusted. It caps the size and removes anything that looks like
 * a link. That way the endpoint can't be used to send spam with links from our domain.
 */
export function sanitizePlanLines(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, PLAN_EMAIL_MAX_LINES)
    .filter((line): line is string => typeof line === "string")
    .map((line) =>
      line
        .replace(URL_PATTERN, "[link removed]")
        .replace(BARE_DOMAIN_PATTERN, "[link removed]")
        .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "")
        .slice(0, PLAN_EMAIL_MAX_LINE_LENGTH)
        .trimEnd(),
    );
}

/** Normalize a school website the visitor typed ("school.com" → "https://school.com"). */
export function normalizeWebsiteUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (!url.hostname.includes(".")) return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}
