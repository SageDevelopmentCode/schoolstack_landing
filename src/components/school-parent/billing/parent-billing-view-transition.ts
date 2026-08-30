/** Shared fade/slide for billing tab switches (matches home page easing). */
export const parentBillingViewTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
};
