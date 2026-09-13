import type { OrganizationBranding } from '@/lib/organization-settings/types';

/** School Day Story design tokens for the parent portal. */
export type MobileParentTheme = {
  paper: string;
  ink: string;
  muted: string;
  line: string;
  cream: string;
  white: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySoft: string;
  sage: string;
  sky: string;
  sun: string;
  coral: string;
  berry: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  alert: string;
  alertBg: string;
  info: string;
  infoBg: string;
  kicker: string;
  kickerLight: string;
};

const STORY_NEUTRALS = {
  paper: '#F8F8F3',
  ink: '#283943',
  muted: '#65777F',
  line: '#E4E8E1',
  cream: '#FFFDF7',
  white: '#FFFFFF',
  kicker: '#759077',
  kickerLight: '#BDDEC4',
} as const;

const STORY_SEMANTIC = {
  sage: '#CFE4D6',
  sky: '#8EBDCB',
  sun: '#EFC56E',
  coral: '#DF8A72',
  berry: '#A9667C',
} as const;

const CHILD_ACCENT_BG = [
  '#DCEBD4',
  '#DCEBF2',
  '#F8E0E7',
  '#F3EAD6',
  '#E8E4F0',
] as const;

export function buildParentThemeTokens(branding: OrganizationBranding): MobileParentTheme {
  const { colors } = branding;

  return {
    ...STORY_NEUTRALS,
    primary: colors.accent,
    primaryDark: colors.accentDark,
    primaryLight: colors.accentLight,
    primarySoft: colors.accentGlow || `${colors.accent}1f`,
    ...STORY_SEMANTIC,
    success: '#34825A',
    successBg: '#EBF8EF',
    warning: '#986F14',
    warningBg: '#FFF4D9',
    alert: '#B5594A',
    alertBg: '#FBEDEB',
    info: '#39788C',
    infoBg: '#E9F4F7',
  };
}

export function childAccentBg(index: number): string {
  return CHILD_ACCENT_BG[index % CHILD_ACCENT_BG.length];
}
