import type { BrandingColors } from '@/lib/organization-settings/types';

export type SchoolAdminStructureColorKey =
  | 'bg'
  | 'border'
  | 'borderStrong'
  | 'textPrimary'
  | 'textSecondary';

export const SCHOOL_ADMIN_LIGHT_NEUTRALS = {
  bg: '#FFFFFF',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  surface: '#FFFFFF',
  elevated: '#FFFFFF',
  input: '#FFFFFF',
  inputBorder: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textQuaternary: '#CBD5E1',
} as const;

const SCHOOL_ADMIN_REPLACEABLE_BG = new Set([
  '#faf8f4',
  '#f8fafc',
  '#f9fafb',
  '#fffbf7',
]);

export const SCHOOL_ADMIN_LEGACY_NEUTRALS: Record<SchoolAdminStructureColorKey, string> = {
  bg: '#FAF8F4',
  border: '#E8E0D4',
  borderStrong: '#D4C9BA',
  textPrimary: '#2B2A26',
  textSecondary: '#6B6560',
};

const STRUCTURE_KEYS: SchoolAdminStructureColorKey[] = [
  'bg',
  'border',
  'borderStrong',
  'textPrimary',
  'textSecondary',
];

function normalizeColor(value: string): string {
  return value.trim().toLowerCase();
}

function isLegacyNeutral(key: SchoolAdminStructureColorKey, value: string): boolean {
  return normalizeColor(value) === normalizeColor(SCHOOL_ADMIN_LEGACY_NEUTRALS[key]);
}

function shouldUseLightNeutralBg(value: string): boolean {
  return SCHOOL_ADMIN_REPLACEABLE_BG.has(normalizeColor(value));
}

export function resolveSchoolAdminStructureColors(
  colors: BrandingColors,
): Pick<BrandingColors, SchoolAdminStructureColorKey> {
  return {
    bg:
      isLegacyNeutral('bg', colors.bg) || shouldUseLightNeutralBg(colors.bg)
        ? SCHOOL_ADMIN_LIGHT_NEUTRALS.bg
        : colors.bg,
    border: isLegacyNeutral('border', colors.border)
      ? SCHOOL_ADMIN_LIGHT_NEUTRALS.border
      : colors.border,
    borderStrong: isLegacyNeutral('borderStrong', colors.borderStrong)
      ? SCHOOL_ADMIN_LIGHT_NEUTRALS.borderStrong
      : colors.borderStrong,
    textPrimary: isLegacyNeutral('textPrimary', colors.textPrimary)
      ? SCHOOL_ADMIN_LIGHT_NEUTRALS.textPrimary
      : colors.textPrimary,
    textSecondary: isLegacyNeutral('textSecondary', colors.textSecondary)
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

  if (shouldUseLightNeutralBg(colors.bg)) {
    migrated.bg = SCHOOL_ADMIN_LIGHT_NEUTRALS.bg;
  }

  return migrated;
}
