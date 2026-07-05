import { DEFAULT_BRANDING, DEFAULT_FEATURES } from "./catalog";
import type { OrganizationBranding, OrganizationFeatures } from "./types";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge<T extends Record<string, unknown>>(
  defaults: T,
  stored: Record<string, unknown> | null | undefined,
): T {
  if (!stored) return structuredClone(defaults);

  const result = structuredClone(defaults) as Record<string, unknown>;

  for (const key of Object.keys(stored)) {
    const storedVal = stored[key];
    const defaultVal = defaults[key];

    if (isPlainObject(storedVal) && isPlainObject(defaultVal)) {
      result[key] = deepMerge(
        defaultVal as Record<string, unknown>,
        storedVal,
      );
    } else if (storedVal !== undefined) {
      result[key] = storedVal;
    }
  }

  return result as T;
}

export function mergeBranding(
  stored: Record<string, unknown> | null | undefined,
): OrganizationBranding {
  const merged = deepMerge(
    DEFAULT_BRANDING as unknown as Record<string, unknown>,
    stored,
  ) as unknown as OrganizationBranding;

  if (!merged.logo.src?.trim()) {
    merged.logo.src = "";
  }

  return merged;
}

export function mergeFeatures(
  stored: Record<string, unknown> | null | undefined,
): OrganizationFeatures {
  const merged = deepMerge(
    DEFAULT_FEATURES as unknown as Record<string, unknown>,
    stored,
  ) as unknown as OrganizationFeatures;

  for (const [key, value] of Object.entries(stored ?? {})) {
    if (
      key !== "admin" &&
      key !== "teacher" &&
      key !== "parent" &&
      key !== "feature_nav" &&
      typeof value === "boolean"
    ) {
      merged[key] = value;
    }
  }

  if (isPlainObject(stored?.feature_nav)) {
    merged.feature_nav = deepMerge(
      {} as Record<string, unknown>,
      stored.feature_nav as Record<string, unknown>,
    ) as OrganizationFeatures["feature_nav"];
  }

  return merged;
}

export function getDefaultSettings() {
  return {
    branding: structuredClone(DEFAULT_BRANDING),
    features: structuredClone(DEFAULT_FEATURES),
  };
}
