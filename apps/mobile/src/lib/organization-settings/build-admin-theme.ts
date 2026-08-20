import { Brand } from '@/constants/theme';
import {
  resolveSchoolAdminStructureColors,
  SCHOOL_ADMIN_LIGHT_NEUTRALS,
} from '@/lib/organization-settings/school-admin-neutrals';
import type { OrganizationBranding } from '@/lib/organization-settings/types';

export type MobileAdminTheme = {
  bg: string;
  surface: string;
  elevated: string;
  input: string;
  inputBorder: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentBright: string;
  accentLight: string;
  accentGlow: string;
  accentMid: string;
  accentDark: string;
  clay: string;
  clayBg: string;
  clayBorder: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textQuaternary: string;
  success: string;
  successBg: string;
  info: string;
  infoBg: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffsetY: number;
};

export function buildMobileAdminTheme(branding: OrganizationBranding): MobileAdminTheme {
  const { colors } = branding;
  const structure = resolveSchoolAdminStructureColors(colors);

  return {
    bg: structure.bg,
    surface: SCHOOL_ADMIN_LIGHT_NEUTRALS.surface,
    elevated: SCHOOL_ADMIN_LIGHT_NEUTRALS.elevated,
    input: SCHOOL_ADMIN_LIGHT_NEUTRALS.input,
    inputBorder: SCHOOL_ADMIN_LIGHT_NEUTRALS.inputBorder,
    border: structure.border,
    borderStrong: structure.borderStrong,
    accent: colors.accent,
    accentBright: colors.accentBright,
    accentLight: colors.accentLight,
    accentGlow: colors.accentGlow,
    accentMid: colors.accentMid,
    accentDark: colors.accentDark,
    clay: colors.clay,
    clayBg: colors.clayBg,
    clayBorder: colors.clayBorder,
    textPrimary: structure.textPrimary,
    textSecondary: structure.textSecondary,
    textTertiary: SCHOOL_ADMIN_LIGHT_NEUTRALS.textTertiary,
    textQuaternary: SCHOOL_ADMIN_LIGHT_NEUTRALS.textQuaternary,
    success: '#16A34A',
    successBg: 'rgba(22, 163, 74, 0.08)',
    info: '#0284C7',
    infoBg: 'rgba(2, 132, 199, 0.08)',
    warning: '#D97706',
    warningBg: 'rgba(217, 119, 6, 0.08)',
    error: '#DC2626',
    errorBg: 'rgba(220, 38, 38, 0.08)',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffsetY: 4,
  };
}

/** Static MudKitchen light theme for platform admin screens. */
export function buildPlatformAdminTheme(): MobileAdminTheme {
  return buildMobileAdminTheme({
    colors: {
      bg: SCHOOL_ADMIN_LIGHT_NEUTRALS.bg,
      border: SCHOOL_ADMIN_LIGHT_NEUTRALS.border,
      borderStrong: SCHOOL_ADMIN_LIGHT_NEUTRALS.borderStrong,
      accent: Brand.accent,
      accentBright: Brand.accent,
      accentLight: 'rgba(46, 74, 60, 0.10)',
      secondaryBtnBorder: 'rgba(46, 74, 60, 0.22)',
      accentGlow: 'rgba(46, 74, 60, 0.12)',
      accentMid: Brand.accent,
      accentDark: Brand.accentDark,
      clay: Brand.clay,
      clayBg: Brand.claySoft,
      clayBorder: Brand.border,
      textPrimary: SCHOOL_ADMIN_LIGHT_NEUTRALS.textPrimary,
      textSecondary: SCHOOL_ADMIN_LIGHT_NEUTRALS.textSecondary,
    },
    logo: { src: '', alt: '', width: 0, height: 0 },
    typography: { headingFont: '', bodyFont: '' },
  });
}

export function adminCardShadow(theme: MobileAdminTheme) {
  return {
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: theme.shadowOffsetY },
    shadowOpacity: theme.shadowOpacity,
    shadowRadius: theme.shadowRadius,
    elevation: 3,
  };
}
