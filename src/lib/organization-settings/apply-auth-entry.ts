import { POST_SUBMIT_ACTION_TEMPLATES } from "@/lib/admissions/post-submit-templates";
import { DEFAULT_APPLY_AUTH_ENTRY_OPTIONS } from "./catalog";
import type {
  ApplyAuthEntryConfig,
  ApplyAuthEntryOption,
  ApplyAuthEntryType,
  OrganizationFeatures,
} from "./types";

export const PRE_APPLICATION_CAMPUS_TOUR_ACTION_ID =
  "pre_application:schedule_campus_tour";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function defaultLabelForType(type: ApplyAuthEntryType): string {
  if (type === "apply") {
    return "Start your application";
  }
  return POST_SUBMIT_ACTION_TEMPLATES.schedule_campus_tour.label;
}

function defaultDescriptionForType(type: ApplyAuthEntryType): string {
  if (type === "apply") {
    return "New here? Start your application.";
  }
  return POST_SUBMIT_ACTION_TEMPLATES.schedule_campus_tour.defaultInstructions;
}

function normalizeOption(
  raw: Record<string, unknown>,
  index: number,
): ApplyAuthEntryOption | null {
  const type = raw.type === "schedule_campus_tour" ? "schedule_campus_tour" : "apply";
  const enabled = raw.enabled === true;
  const id =
    typeof raw.id === "string" && raw.id.trim()
      ? raw.id.trim()
      : type === "schedule_campus_tour"
        ? "schedule_campus_tour"
        : `apply_${index + 1}`;

  const label =
    typeof raw.label === "string" && raw.label.trim()
      ? raw.label.trim()
      : defaultLabelForType(type);
  const description =
    typeof raw.description === "string" && raw.description.trim()
      ? raw.description.trim()
      : defaultDescriptionForType(type);

  return { id, type, enabled, label, description };
}

export function mergeApplyAuthEntry(
  stored: ApplyAuthEntryConfig | Record<string, unknown> | null | undefined,
): ApplyAuthEntryConfig {
  if (!stored || !isPlainObject(stored)) {
    return { options: structuredClone(DEFAULT_APPLY_AUTH_ENTRY_OPTIONS) };
  }

  const rawOptions = stored.options;
  if (!Array.isArray(rawOptions)) {
    return { options: structuredClone(DEFAULT_APPLY_AUTH_ENTRY_OPTIONS) };
  }

  const normalized = rawOptions
    .map((item, index) =>
      isPlainObject(item) ? normalizeOption(item, index) : null,
    )
    .filter((item): item is ApplyAuthEntryOption => item !== null);

  const defaults = structuredClone(DEFAULT_APPLY_AUTH_ENTRY_OPTIONS);
  const byType = new Map<ApplyAuthEntryType, ApplyAuthEntryOption>();

  for (const option of defaults) {
    byType.set(option.type, option);
  }

  for (const option of normalized) {
    const existing = byType.get(option.type);
    if (existing) {
      byType.set(option.type, {
        ...existing,
        ...option,
        type: option.type,
      });
    }
  }

  return { options: Array.from(byType.values()) };
}

export function getApplyAuthEntryOptions(
  features: OrganizationFeatures,
): ApplyAuthEntryOption[] {
  return mergeApplyAuthEntry(features.apply_auth_entry).options;
}

export function getEnabledTourAuthEntryOption(
  features: OrganizationFeatures,
): ApplyAuthEntryOption | null {
  const option = getApplyAuthEntryOptions(features).find(
    (entry) => entry.type === "schedule_campus_tour" && entry.enabled,
  );
  return option ?? null;
}
