import {
  migrateLegacyNeutralBranding,
} from '@/lib/organization-settings/school-admin-neutrals';
import type { OrganizationBranding } from '@/lib/organization-settings/types';
import { resolveOrganizationAssetUrl } from '@/lib/resolve-asset-url';

export const DEFAULT_BRANDING_COLORS = {
  bg: '#FFFFFF',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  accent: '#827096',
  accentBright: '#6E5D7F',
  accentLight: 'rgba(130, 112, 150, 0.10)',
  secondaryBtnBorder: 'rgba(130, 112, 150, 0.22)',
  accentGlow: 'rgba(130, 112, 150, 0.12)',
  accentMid: '#6E5D7F',
  accentDark: '#5A4D68',
  clay: '#b3b462',
  clayBg: 'rgba(179, 180, 98, 0.12)',
  clayBorder: 'rgba(179, 180, 98, 0.30)',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
} as const;

export const DEFAULT_BRANDING: OrganizationBranding = {
  colors: { ...DEFAULT_BRANDING_COLORS },
  logo: {
    src: '',
    alt: '',
    width: 0,
    height: 0,
  },
  typography: {
    headingFont: '',
    bodyFont: '',
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge<T extends Record<string, unknown>>(
  defaults: T,
  stored: Record<string, unknown> | null | undefined,
): T {
  if (!stored) return { ...defaults };

  const result = { ...defaults } as Record<string, unknown>;

  for (const key of Object.keys(stored)) {
    const storedVal = stored[key];
    const defaultVal = defaults[key];

    if (isPlainObject(storedVal) && isPlainObject(defaultVal)) {
      result[key] = deepMerge(defaultVal, storedVal);
    } else if (storedVal !== undefined) {
      result[key] = storedVal;
    }
  }

  return result as T;
}

function parseLogo(raw: unknown): OrganizationBranding['logo'] {
  if (!isPlainObject(raw)) {
    return { ...DEFAULT_BRANDING.logo };
  }

  return {
    src: resolveOrganizationAssetUrl(typeof raw.src === 'string' ? raw.src : ''),
    alt: typeof raw.alt === 'string' ? raw.alt : '',
    width: typeof raw.width === 'number' ? raw.width : 0,
    height: typeof raw.height === 'number' ? raw.height : 0,
  };
}

export function mergeBranding(
  stored: Record<string, unknown> | null | undefined,
): OrganizationBranding {
  const merged = deepMerge(
    DEFAULT_BRANDING as unknown as Record<string, unknown>,
    stored,
  ) as unknown as OrganizationBranding;

  if (isPlainObject(stored?.logo)) {
    merged.logo = parseLogo(stored.logo);
  } else if (!merged.logo.src?.trim()) {
    merged.logo = { ...DEFAULT_BRANDING.logo };
  }

  merged.colors = migrateLegacyNeutralBranding(merged.colors);

  return merged;
}

export function mergeBrandingFromRaw(raw: unknown): OrganizationBranding {
  if (!isPlainObject(raw)) {
    return structuredClone(DEFAULT_BRANDING);
  }
  return mergeBranding(raw);
}
