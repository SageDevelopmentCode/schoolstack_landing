import type { Transition, Variants } from "framer-motion";

export const adminModalTransition: Transition = {
  type: "spring",
  damping: 28,
  stiffness: 320,
};

export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export function modalPanelVariants(reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }

  return {
    initial: { opacity: 0, y: 16, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 12, scale: 0.98 },
  };
}

export const TAB_PANEL_DURATION = 0.18;

export function tabPanelTransition(reducedMotion: boolean): Transition {
  return reducedMotion ? { duration: 0 } : { duration: TAB_PANEL_DURATION };
}

export function tabPanelVariants(reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }

  return {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
  };
}
