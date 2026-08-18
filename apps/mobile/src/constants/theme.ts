import '@/global.css';

import { Platform } from 'react-native';

/** MudKitchen brand palette — mirrors web globals.css */
export const Brand = {
  bg: '#F7F1E7',
  surface: '#FFFAF4',
  text: '#2B241D',
  textMuted: '#6D6257',
  accent: '#2E4A3C',
  accentDark: '#2E4A3C',
  clay: '#A05C45',
  claySoft: '#E8D5C8',
  badgeGreen: '#E2EDD9',
  badgeGreenText: '#4A6B52',
  border: '#E8DFD3',
  input: '#FFFAF4',
  inputBorder: '#D9CEC0',
  white: '#FFFFFF',
} as const;

export const Colors = {
  light: {
    text: Brand.text,
    textSecondary: Brand.textMuted,
    background: Brand.bg,
    backgroundElement: Brand.surface,
    backgroundSelected: Brand.claySoft,
    accent: Brand.accent,
    clay: Brand.clay,
    surface: Brand.surface,
    border: Brand.border,
  },
  dark: {
    text: Brand.text,
    textSecondary: Brand.textMuted,
    background: Brand.bg,
    backgroundElement: Brand.surface,
    backgroundSelected: Brand.claySoft,
    accent: Brand.accent,
    clay: Brand.clay,
    surface: Brand.surface,
    border: Brand.border,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = {
  display: 'Lora_500Medium',
  displayItalic: 'Lora_500Medium_Italic',
  body: 'Poppins_400Regular',
  bodyMedium: 'Poppins_500Medium',
  bodySemiBold: 'Poppins_600SemiBold',
  mono: Platform.select({
    ios: 'ui-monospace',
    default: 'monospace',
  }) as string,
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 9999,
} as const;

export const MaxContentWidth = 800;
