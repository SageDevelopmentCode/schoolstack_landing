import type { Transition } from "framer-motion";

export const MY_HOURS_EASE = [0.16, 1, 0.3, 1] as const;

export function myHoursTransitionDuration(reducedMotion: boolean): number {
  return reducedMotion ? 0 : 0.22;
}

export function myHoursViewTransition(reducedMotion: boolean) {
  const duration = myHoursTransitionDuration(reducedMotion);
  return {
    initial: { opacity: 0, y: reducedMotion ? 0 : 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reducedMotion ? 0 : -4 },
    transition: { duration, ease: MY_HOURS_EASE } satisfies Transition,
  };
}

export function myHoursFadeUpTransition(reducedMotion: boolean) {
  const duration = myHoursTransitionDuration(reducedMotion);
  return {
    initial: { opacity: 0, y: reducedMotion ? 0 : 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reducedMotion ? 0 : -6 },
    transition: { duration, ease: MY_HOURS_EASE } satisfies Transition,
  };
}

export function myHoursRowTransition(reducedMotion: boolean) {
  const duration = reducedMotion ? 0 : 0.18;
  return {
    initial: { opacity: 0, y: reducedMotion ? 0 : 4 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reducedMotion ? 0 : -2 },
    transition: { duration, ease: MY_HOURS_EASE } satisfies Transition,
  };
}
