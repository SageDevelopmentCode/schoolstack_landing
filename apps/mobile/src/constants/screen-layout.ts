import { Spacing } from '@/constants/theme';

/** Horizontal gutter for mobile screen scroll content (matches web px-4). */
export const SCREEN_HORIZONTAL_PADDING = Spacing.three;

/** Common scroll container padding for tab screens. */
export const screenScrollContentPadding = {
  paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
  paddingTop: Spacing.four,
  paddingBottom: Spacing.six,
} as const;
