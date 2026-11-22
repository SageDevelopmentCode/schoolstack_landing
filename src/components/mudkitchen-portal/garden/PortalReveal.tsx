"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export const PORTAL_EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Calm portal entrance: a short fade + 8px rise on mount. Skipped entirely
 * under reduced motion, so the rest state is always the content.
 */
export default function PortalReveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const reduce = useReducedMotion();
  const Comp = as === "li" ? motion.li : as === "section" ? motion.section : motion.div;

  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: PORTAL_EASE, delay }}
    >
      {children}
    </Comp>
  );
}
