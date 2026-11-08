import type { OrganizationFeatures } from "./types";

export type OrganizationPlan = "free" | "custom";

/** `null` means no cap. Free only allows the listed boolean flags. */
export const PLAN_FEATURE_ALLOW_LIST: Record<
  OrganizationPlan,
  {
    admin: readonly string[];
    teacher: readonly string[];
    parent: readonly string[];
  } | null
> = {
  custom: null,
  free: {
    admin: ["dashboard"],
    teacher: [],
    parent: [],
  },
};

const PORTAL_KEYS = ["admin", "teacher", "parent"] as const;

/** Nested objects that are not boolean feature flags. */
const PRESERVED_OBJECT_KEYS = new Set([
  "admin",
  "teacher",
  "parent",
  "parent_home",
  "feature_nav",
  "parent_onboarding",
  "apply_auth_entry",
]);

export function parseOrganizationPlan(value: unknown): OrganizationPlan {
  return value === "free" ? "free" : "custom";
}

/**
 * True when selecting `organizations.plan` failed because the column is not
 * in the database yet. Deployed readers retry without it and treat the plan
 * as `custom`.
 */
export function isMissingOrganizationPlanColumnError(
  error: { code?: string; message?: string } | null | undefined,
): boolean {
  if (!error) return false;
  const message = error.message ?? "";
  if (!/plan/i.test(message)) return false;
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    /does not exist/i.test(message) ||
    /schema cache/i.test(message)
  );
}

function capBooleanFlags(
  record: Record<string, unknown>,
  allowed: ReadonlySet<string>,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...record };
  for (const [key, value] of Object.entries(next)) {
    if (typeof value === "boolean" && !allowed.has(key)) {
      next[key] = false;
    }
  }
  return next;
}

/**
 * Caps usable features for the plan. `custom` returns the same object.
 * `free` forces every boolean flag that is not on the allow-list to false,
 * including keys added to defaults later. Allow-listed flags keep their value.
 */
export function applyPlanToFeatures(
  features: OrganizationFeatures,
  plan: OrganizationPlan,
): OrganizationFeatures {
  const allowList = PLAN_FEATURE_ALLOW_LIST[plan];
  if (!allowList) return features;

  const next: OrganizationFeatures = { ...features };

  for (const portal of PORTAL_KEYS) {
    const record = features[portal];
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      continue;
    }
    const capped = capBooleanFlags(
      record as Record<string, unknown>,
      new Set(allowList[portal]),
    );
    if (portal === "admin") {
      next.admin = capped as OrganizationFeatures["admin"];
    } else if (portal === "teacher") {
      next.teacher = capped as OrganizationFeatures["teacher"];
    } else {
      next.parent = capped as OrganizationFeatures["parent"];
    }
  }

  if (
    features.parent_home &&
    typeof features.parent_home === "object" &&
    !Array.isArray(features.parent_home)
  ) {
    next.parent_home = capBooleanFlags(
      features.parent_home as Record<string, unknown>,
      new Set(),
    ) as OrganizationFeatures["parent_home"];
  }

  for (const [key, value] of Object.entries(features)) {
    if (PRESERVED_OBJECT_KEYS.has(key)) continue;
    if (typeof value === "boolean") {
      (next as Record<string, unknown>)[key] = false;
    }
  }

  return next;
}
