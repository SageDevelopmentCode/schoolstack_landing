import { useMemo } from 'react';
import { Easing } from 'react-native-reanimated';

import { useParentTheme } from '@/contexts/parent-theme-context';

/**
 * Garden tokens for the parent portal on mobile. Hexes match web
 * `src/components/garden/garden.css`. Actions use the SCHOOL accent via
 * `useGardenAccent()` — never hard-code Garden clay or a school colour.
 */
export const Garden = {
  cream: '#F7F1E7',
  paper: '#FFFAF4',
  notebook: '#FFFDF8',
  white: '#FFFFFF',
  ink: '#2B241D',
  soft: '#6D6257',
  butter: '#FFE58A',
  mint: '#DDEBD5',
  sky: '#E3EDFB',
  lav: '#ECE2F3',
  peach: '#F8DDCF',
  forest: '#2E4A3C',
  forestDeep: '#1F3329',
  ink06: 'rgba(43,36,29,0.06)',
  ink10: 'rgba(43,36,29,0.10)',
  ink12: 'rgba(43,36,29,0.12)',
  ink15: 'rgba(43,36,29,0.15)',
  ink25: 'rgba(43,36,29,0.25)',
  ink60: 'rgba(43,36,29,0.60)',
  ink65: 'rgba(43,36,29,0.65)',
} as const;

export const GardenFonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  body: 'Nunito_400Regular',
  bodySemi: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  bodyExtra: 'Nunito_800ExtraBold',
  hand: 'GochiHand_400Regular',
} as const;

/** Butter, sky, lav, mint, peach — cycle with `NOTE_TINTS[i % NOTE_TINTS.length]`. */
export const NOTE_TINTS = [Garden.butter, Garden.sky, Garden.lav, Garden.mint, Garden.peach] as const;
/** Initials fallbacks. */
export const PANEL_TINTS = [Garden.sky, Garden.mint, Garden.lav, Garden.butter, Garden.peach] as const;

export type GChipTone = 'success' | 'warning' | 'alert' | 'info' | 'neutral';

export const CHIP_TONES: Record<GChipTone, { bg: string; fg: string }> = {
  success: { bg: Garden.mint, fg: Garden.forest },
  warning: { bg: Garden.butter, fg: '#6B4F00' },
  alert: { bg: Garden.peach, fg: '#7E4533' },
  info: { bg: Garden.sky, fg: '#24507A' },
  neutral: { bg: Garden.ink06, fg: 'rgba(43,36,29,0.75)' },
};

export const PORTAL_EASE = Easing.bezier(0.16, 1, 0.3, 1);
export const PORTAL_DURATION = 300;

/** Hard "toy" shadow. Android cannot draw hard shadows; components add an ink underlay there. */
export const CARD_SHADOW = {
  shadowColor: Garden.ink,
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 0,
  elevation: 0,
} as const;

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.slice(0, 6);
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/** Mix `color` into the Garden paper at `amount` (0..1), like CSS color-mix. */
export function mixIntoPaper(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  const paper = hexToRgb(Garden.paper)!;
  if (!rgb) return Garden.paper;
  const mixed = rgb.map((channel, i) => Math.round(channel * amount + paper[i] * (1 - amount)));
  return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
}

export function withAlpha(color: string, alpha: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

export type GardenAccent = {
  /** School accent (web `--sf-clay`). */
  clay: string;
  /** Darker school accent (web `--sf-clay-deep`) — use for small text on pastels. */
  clayDeep: string;
  /** 16% accent tint (web `--sf-peach` in the parent frame). */
  peach: string;
  /** 8% accent wash. */
  wash: string;
};

/** The school's accent mapped onto Garden action tokens (mirrors `ParentGardenFrame`). */
export function useGardenAccent(): GardenAccent {
  const theme = useParentTheme();
  return useMemo(
    () => ({
      clay: theme.primary,
      clayDeep: theme.primaryDark,
      peach: mixIntoPaper(theme.primary, 0.16),
      wash: mixIntoPaper(theme.primary, 0.08),
    }),
    [theme.primary, theme.primaryDark],
  );
}
