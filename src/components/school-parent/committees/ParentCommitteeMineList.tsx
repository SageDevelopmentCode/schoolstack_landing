"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarDays, CheckSquare, Heart } from "lucide-react";
import {
  fadeUp,
  staggerContainer,
  staggerItem,
} from "@/components/school-admin/committees/committee-motion";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { ParentCommitteeListItem } from "@/lib/committees/types";

export default function ParentCommitteeMineList({
  committees,
  theme,
  onOpenCommittee,
}: {
  committees: ParentCommitteeListItem[];
  theme: ParentThemeTokens;
  onOpenCommittee: (id: string) => void;
}) {
  const reducedMotion = useReducedMotion() ?? false;

  if (committees.length === 0) {
    return (
      <motion.div variants={fadeUp(reducedMotion)} initial="initial" animate="animate">
        <ParentCard theme={theme} className="flex flex-col items-center justify-center py-12 text-center">
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.primarySoft }}
          >
            <Heart className="h-7 w-7" style={{ color: theme.primary }} />
          </div>
          <h3
            className="mb-2 text-[17px] font-bold"
            style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
          >
            No committees yet
          </h3>
          <p className="max-w-xs text-[13px]" style={{ color: theme.muted }}>
            After the school approves your join request, your committee workspace will appear here.
          </p>
        </ParentCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={committees.map((c) => c.id).join("-")}
      className="flex flex-col gap-4"
      variants={staggerContainer(reducedMotion)}
      initial="initial"
      animate="animate"
    >
      {committees.map((committee) => (
        <motion.div key={committee.id} variants={staggerItem(reducedMotion)}>
          <button
            type="button"
            onClick={() => onOpenCommittee(committee.id)}
            className="group w-full cursor-pointer text-left"
          >
            <ParentCard theme={theme} className="transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className="text-[16px] font-bold"
                      style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                    >
                      {committee.name}
                    </h3>
                    <ParentChip theme={theme} tone="info">
                      {committee.termLabel}
                    </ParentChip>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[13px]" style={{ color: theme.muted }}>
                    {committee.description}
                  </p>
                  <div
                    className="mt-3 flex flex-wrap items-center gap-4 text-[12px]"
                    style={{ color: theme.muted }}
                  >
                    {committee.openTaskCount > 0 && (
                      <span className="flex items-center gap-1">
                        <CheckSquare className="h-3.5 w-3.5" />
                        {committee.openTaskCount} open task
                        {committee.openTaskCount !== 1 ? "s" : ""}
                      </span>
                    )}
                    {committee.nextEventTitle && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Next: {committee.nextEventTitle}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight
                  className="mt-1 h-5 w-5 shrink-0 transition-colors group-hover:opacity-100"
                  style={{ color: theme.primary, opacity: 0.5 }}
                />
              </div>
            </ParentCard>
          </button>
        </motion.div>
      ))}
    </motion.div>
  );
}
