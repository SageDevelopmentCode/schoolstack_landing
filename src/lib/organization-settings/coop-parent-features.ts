import type { ParentFeatures } from "./types";

export const COOP_ONLY_PARENT_FEATURE_KEYS = [
  "curriculum",
  "supply_list",
  "teaching_schedule",
] as const satisfies ReadonlyArray<keyof ParentFeatures>;

export type CoopOnlyParentFeatureKey =
  (typeof COOP_ONLY_PARENT_FEATURE_KEYS)[number];

const COOP_AUTO_ENABLED_KEYS = new Set<CoopOnlyParentFeatureKey>([
  "supply_list",
  "teaching_schedule",
]);

export const COOP_ONLY_PARENT_FEATURE_BADGE = "Co-op program only";

export const COOP_AUTO_ENABLED_TOGGLE_TOOLTIP =
  "Included automatically for co-op programs (e.g. Kindergarten Co-op). Configure co-op mode under Admissions → Program-scoped parent portals.";

export function isCoopOnlyParentFeature(
  key: string,
): key is CoopOnlyParentFeatureKey {
  return (COOP_ONLY_PARENT_FEATURE_KEYS as readonly string[]).includes(key);
}

export function isCoopAutoEnabledParentFeature(key: string): boolean {
  return isCoopOnlyParentFeature(key) && COOP_AUTO_ENABLED_KEYS.has(key);
}

export function getCoopParentFeatureAdminHint(
  key: CoopOnlyParentFeatureKey,
): string {
  switch (key) {
    case "curriculum":
      return "Co-op program portal only — not shown on the main parent portal. Also requires co-op mode on an isolated program.";
    case "supply_list":
      return "Co-op program portal only — auto-enabled with co-op mode on an isolated program.";
    case "teaching_schedule":
      return "Co-op program portal only — auto-enabled with co-op mode on an isolated program.";
  }
}

export function resolveCoopAutoEnabledOrgParentFlags(
  parentFeatures: Partial<ParentFeatures>,
  hasCoopModePrograms: boolean,
): Partial<ParentFeatures> {
  if (!hasCoopModePrograms) {
    return parentFeatures;
  }

  const next = { ...parentFeatures };
  for (const key of COOP_AUTO_ENABLED_KEYS) {
    next[key] = true;
  }
  return next;
}
