import type { BrandingColors } from "./types";

export type SchoolAdminStructureColorKey =
  | "bg"
  | "border"
  | "borderStrong"
  | "textPrimary"
  | "textSecondary";

export const SCHOOL_ADMIN_LIGHT_NEUTRALS = {
  bg: "#F8FAFC",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  surface: "#FFFFFF",
  elevated: "#F9FAFB",
  input: "#FFFFFF",
  inputBorder: "#E2E8F0",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textTertiary: "#94A3B8",
  textQuaternary: "#CBD5E1",
  shadowCard: "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
  shadowMedium: "0 4px 16px rgba(15,23,42,0.08)",
} as const;

/** Warm Rooted Meadows defaults — schools still on these get upgraded to light neutrals. */
export const SCHOOL_ADMIN_LEGACY_NEUTRALS: Record<SchoolAdminStructureColorKey, string> =
  {
    bg: "#FAF8F4",
    border: "#E8E0D4",
    borderStrong: "#D4C9BA",
    textPrimary: "#2B2A26",
    textSecondary: "#6B6560",
  };

const STRUCTURE_KEYS: SchoolAdminStructureColorKey[] = [
  "bg",
  "border",
  "borderStrong",
  "textPrimary",
  "textSecondary",
];

function normalizeColor(value: string): string {
  return value.trim().toLowerCase();
}

function isLegacyNeutral(
  key: SchoolAdminStructureColorKey,
  value: string,
): boolean {
  return normalizeColor(value) === normalizeColor(SCHOOL_ADMIN_LEGACY_NEUTRALS[key]);
}

export function resolveSchoolAdminStructureColors(
  colors: BrandingColors,
): Pick<BrandingColors, SchoolAdminStructureColorKey> {
  return {
    bg: isLegacyNeutral("bg", colors.bg)
      ? SCHOOL_ADMIN_LIGHT_NEUTRALS.bg
      : colors.bg,
    border: isLegacyNeutral("border", colors.border)
      ? SCHOOL_ADMIN_LIGHT_NEUTRALS.border
      : colors.border,
    borderStrong: isLegacyNeutral("borderStrong", colors.borderStrong)
      ? SCHOOL_ADMIN_LIGHT_NEUTRALS.borderStrong
      : colors.borderStrong,
    textPrimary: isLegacyNeutral("textPrimary", colors.textPrimary)
      ? SCHOOL_ADMIN_LIGHT_NEUTRALS.textPrimary
      : colors.textPrimary,
    textSecondary: isLegacyNeutral("textSecondary", colors.textSecondary)
      ? SCHOOL_ADMIN_LIGHT_NEUTRALS.textSecondary
      : colors.textSecondary,
  };
}

export function migrateLegacyNeutralBranding(colors: BrandingColors): BrandingColors {
  const migrated = { ...colors };

  for (const key of STRUCTURE_KEYS) {
    if (isLegacyNeutral(key, colors[key])) {
      migrated[key] = SCHOOL_ADMIN_LIGHT_NEUTRALS[key];
    }
  }

  return migrated;
}
