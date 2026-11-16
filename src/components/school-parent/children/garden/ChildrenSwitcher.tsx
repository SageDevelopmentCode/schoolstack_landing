"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  childFirstName,
  childLearnerSubtitleLine,
} from "@/components/school-parent/children/parent-children-utils";
import { ChildThumb, G_FOCUS, SPRINGY } from "@/components/school-parent/garden/ui";
import { gFade } from "@/components/school-parent/garden/motion";
import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";

/**
 * Child picker for families with more than one learner: polaroid thumb +
 * first name + meta line. The accent ring glides to the active child.
 * Scrolls sideways inside itself on phones (never widens the page).
 */
export default function ChildrenSwitcher({
  learners,
  selectedApplicationId,
  onSelect,
}: {
  learners: FamilyChildOverview[];
  selectedApplicationId: string;
  onSelect: (applicationId: string) => void;
}) {
  const reduce = useReducedMotion() === true;
  const ringId = useId();
  if (learners.length <= 1) return null;

  return (
    <motion.nav
      {...gFade(0, reduce)}
      aria-label="Select learner"
      data-testid="parent-children-learner-strip"
      className="-mx-1 flex w-auto max-w-full gap-3 overflow-x-auto px-1 pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {learners.map((child, index) => {
        const active = child.applicationId === selectedApplicationId;
        return (
          <button
            key={child.applicationId}
            type="button"
            onClick={() => onSelect(child.applicationId)}
            aria-current={active ? "true" : undefined}
            data-testid={`parent-children-learner-${child.applicationId}`}
            className={`relative flex min-h-[64px] w-[230px] shrink-0 items-center gap-3 rounded-[20px] border-[1.5px] px-3 py-2.5 text-left ${SPRINGY} ${G_FOCUS} ${
              active
                ? "border-transparent bg-white"
                : "border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/25 hover:bg-white"
            }`}
          >
            {active ? (
              <motion.span
                layoutId={`children-switcher-${ringId}`}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[20px] border-2 border-[var(--sf-clay)] shadow-[0_3px_0_0_var(--sf-ink)]"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            <ChildThumb child={child} index={index} size="sm" tilt={index % 2 === 0 ? -3 : 3} />
            <span className="relative min-w-0 flex-1">
              <span className="block truncate text-[15px] font-extrabold leading-tight text-[var(--sf-ink)]">
                {childFirstName(child.studentName)}
              </span>
              <span className="mt-0.5 block truncate text-xs font-semibold text-[var(--sf-soft)]">
                {childLearnerSubtitleLine(child)}
              </span>
            </span>
            {active ? (
              <span className="sr-only">(currently showing)</span>
            ) : null}
          </button>
        );
      })}
    </motion.nav>
  );
}
