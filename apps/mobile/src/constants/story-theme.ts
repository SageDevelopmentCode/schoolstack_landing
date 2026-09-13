/** School Day Story design tokens for mobile pre-auth surfaces. Mirrors web parent-theme.ts neutrals. */
export const Story = {
  paper: '#F8F8F3',
  ink: '#283943',
  muted: '#65777F',
  line: '#E4E8E1',
  cream: '#FFFDF7',
  white: '#FFFFFF',
  primary: '#315E4F',
  primaryDark: '#264A3F',
  primarySoft: '#E8F1E9',
  kicker: '#759077',
  kickerLight: '#BDDEC4',
  sage: '#CFE4D6',
  alert: '#B5594A',
  alertBg: '#FBEDEB',
} as const;

export const StoryRadius = {
  card: 22,
  cardCompact: 16,
  button: 12,
  input: 12,
} as const;

export const StoryFonts = {
  display: 'Fraunces_600SemiBold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemiBold: 'DMSans_600SemiBold',
} as const;

/** Inner padding for Story cards on mobile parent home surfaces. */
export const StoryCardPadding = 16;

export function storyCardShadow() {
  return {
    shadowColor: '#32483D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 2,
  };
}
