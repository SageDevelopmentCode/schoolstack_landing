"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { gFade } from "./motion";
import { GKicker } from "./ui";

/**
 * Page header for every parent Garden page, in portal proportions:
 * kicker → sf-display h1 (the page's only h1) → muted subtitle, with actions
 * on the right (they wrap under the title on phones).
 *
 * Wrap the accent word of the title in
 * `<span className="text-[var(--sf-clay)]">…</span>` when there is one
 * (the Home greeting colours the parent's name).
 */
export default function ParentGardenPageHeader({
  kicker,
  title,
  subtitle,
  actions,
  className = "",
}: {
  kicker?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion() === true;
  return (
    <motion.header {...gFade(0, reduce)} className={className}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {kicker ? <GKicker className="mb-2">{kicker}</GKicker> : null}
          <h1 className="sf-display m-0 text-[2rem] leading-[1] text-[var(--sf-ink)] sm:text-[2.6rem]">{title}</h1>
          {subtitle ? <p className="m-0 mt-2 text-[15px] font-semibold text-[var(--sf-soft)]">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </motion.header>
  );
}
