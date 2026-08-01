import type { Transition, Variants } from "framer-motion";

export const COMMITTEE_EASE = [0.25, 0.1, 0.25, 1] as const;

export const COMMITTEE_DURATION = 0.18;

export const committeeTransition: Transition = {
  duration: COMMITTEE_DURATION,
  ease: COMMITTEE_EASE,
};

export function motionProps(reducedMotion: boolean) {
  return {
    skipTransform: reducedMotion,
    transition: reducedMotion ? { duration: 0 } : committeeTransition,
  };
}

export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export function modalPanel(reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
  };
}

export function fadeUp(reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
  };
}

export function staggerContainer(reducedMotion: boolean): Variants {
  return {
    initial: {},
    animate: {
      transition: reducedMotion
        ? {}
        : { staggerChildren: 0.04, delayChildren: 0.02 },
    },
  };
}

export function staggerItem(reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    };
  }
  return {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
  };
}

export function viewSwap(reducedMotion: boolean, direction = 1): Variants {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return {
    initial: { opacity: 0, x: direction * 12 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: direction * -12 },
  };
}
