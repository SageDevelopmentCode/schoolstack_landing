"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;
const exitEase = [0.4, 0, 1, 1] as const;

export const marketingWizardSlide = {
  initial: { opacity: 0, x: 48 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease },
  },
  exit: {
    opacity: 0,
    x: -48,
    transition: { duration: 0.28, ease: exitEase },
  },
};

export const marketingWizardFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35, ease } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: exitEase } },
};

type MarketingWizardStepMotionProps = {
  stepKey: string;
  children: ReactNode;
  className?: string;
};

export function MarketingWizardStepMotion({ stepKey, children, className }: MarketingWizardStepMotionProps) {
  const reduceMotion = useReducedMotion();
  const variants = reduceMotion ? marketingWizardFade : marketingWizardSlide;

  return (
    <AnimatePresence mode="wait">
      <motion.div key={stepKey} className={className} {...variants}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
