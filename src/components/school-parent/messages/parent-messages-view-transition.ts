/** Shared fade/slide for parent messages view switches (matches billing/home easing). */
export const parentMessagesViewTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
};
