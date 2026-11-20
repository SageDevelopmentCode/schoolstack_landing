import {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';

import { isMobileE2e } from '@/lib/e2e';

/**
 * Calm motion for every mobile portal: no overshoot, short travel, soft ease-out.
 * Use these instead of hand-rolled durations, springs or Reanimated presets
 * (see the "Calm motion" rules in parent-mobile-garden-design).
 */

/** Gentle ease-out (CSS `ease`). Movement is spread out instead of front-loaded. */
export const CALM_EASE = Easing.bezier(0.25, 0.1, 0.25, 1);

export const MOTION = { fast: 140, base: 220, slow: 280 } as const;

/** Max distance (pt) anything slides when it enters. */
export const ENTER_TRAVEL = 8;

/** Press feedback (scale / toy-button travel). Timing, not springs, so nothing wobbles. */
export const PRESS_IN = { duration: 110, easing: Easing.out(Easing.quad) } as const;
export const PRESS_OUT = { duration: 170, easing: CALM_EASE } as const;
export const PRESSED_SCALE = 0.985;

/** Indicator pills (tab bar, segmented control) gliding to a new position. */
export const GLIDE = { duration: 240, easing: CALM_EASE } as const;

/** Settling back after a released drag: keeps the fling velocity, never bounces past 0. */
export const SNAP_BACK_SPRING = {
  damping: 28,
  stiffness: 260,
  mass: 1,
  overshootClamping: true,
} as const;

type EnterOptions = { delay?: number; duration?: number };

/** Fade in while settling down into place (8pt). Cards, sections, list headers. */
export function calmEnter({ delay = 0, duration = MOTION.slow }: EnterOptions = {}) {
  if (isMobileE2e) return undefined;
  return FadeInDown.duration(duration)
    .delay(delay)
    .easing(CALM_EASE)
    .withInitialValues({ opacity: 0, transform: [{ translateY: -ENTER_TRAVEL }] });
}

/** Fade in while rising into place (8pt). Bottom-anchored things: toasts, action bars. */
export function calmRise({ delay = 0, duration = MOTION.base }: EnterOptions = {}) {
  if (isMobileE2e) return undefined;
  return FadeInUp.duration(duration)
    .delay(delay)
    .easing(CALM_EASE)
    .withInitialValues({ opacity: 0, transform: [{ translateY: ENTER_TRAVEL }] });
}

/** Plain fade in (no travel). Tab / panel swaps, inline status lines. */
export function calmFadeIn({ delay = 0, duration = MOTION.base }: EnterOptions = {}) {
  if (isMobileE2e) return undefined;
  return FadeIn.duration(duration).delay(delay).easing(CALM_EASE);
}

/** Plain fade out. Exits never slide. */
export function calmExit(duration: number = MOTION.fast) {
  if (isMobileE2e) return undefined;
  return FadeOut.duration(duration);
}

/** Eased reflow when siblings appear or leave. */
export const calmLayout = isMobileE2e
  ? undefined
  : LinearTransition.duration(MOTION.base).easing(CALM_EASE);

/** Stagger for a list of entering cards, capped so long lists don't cascade. */
export function staggerDelay(index: number): number {
  return 30 + Math.min(Math.max(index, 0), 5) * 35;
}

export const TAB_ENTER_DURATION = 220;

export const TAB_PANEL_ENTER_DURATION = 180;
export const TAB_PANEL_EXIT_DURATION = 140;

export const tabPanelEntering = isMobileE2e
  ? undefined
  : FadeIn.duration(TAB_PANEL_ENTER_DURATION).easing(CALM_EASE);

export const tabPanelExiting = isMobileE2e
  ? undefined
  : FadeOut.duration(TAB_PANEL_EXIT_DURATION);

export function detailStackAnimation(): 'slide_from_right' | 'none' {
  return isMobileE2e ? 'none' : 'slide_from_right';
}
