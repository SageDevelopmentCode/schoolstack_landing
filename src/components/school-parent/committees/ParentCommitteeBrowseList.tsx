"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import {
  fadeUp,
  staggerContainer,
  staggerItem,
} from "@/components/school-admin/committees/committee-motion";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { ParentCommitteeBrowseItem } from "@/lib/committees/types";
import ParentCommitteeRequestStatus from "./ParentCommitteeRequestStatus";

export default function ParentCommitteeBrowseList({
  committees,
  theme,
  onOpenCommittee,
}: {
  committees: ParentCommitteeBrowseItem[];
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
            No committees available
          </h3>
          <p className="max-w-xs text-[13px]" style={{ color: theme.muted }}>
            When the school opens volunteer committees, they will appear here for you to explore.
          </p>
        </ParentCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={committees.map((c) => c.id).join("-")}
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
      variants={staggerContainer(reducedMotion)}
      initial="initial"
      animate="animate"
    >
      {committees.map((committee) => (
        <motion.div key={committee.id} variants={staggerItem(reducedMotion)} className="h-full">
          <button
            type="button"
            onClick={() => onOpenCommittee(committee.id)}
            className="group h-full w-full cursor-pointer text-left"
          >
            <ParentCard
              theme={theme}
              className="flex h-full flex-col transition-shadow hover:shadow-md"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3
                        className="line-clamp-2 text-[15px] font-bold leading-snug"
                        style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                      >
                        {committee.name}
                      </h3>
                      <ParentChip theme={theme} tone="info">
                        {committee.termLabel}
                      </ParentChip>
                    </div>
                  </div>
                  <ArrowRight
                    className="mt-1 h-5 w-5 shrink-0 transition-colors group-hover:opacity-100"
                    style={{ color: theme.primary, opacity: 0.5 }}
                  />
                </div>
                <p
                  className="line-clamp-3 flex-1 text-[13px] leading-relaxed"
                  style={{ color: theme.muted }}
                >
                  {committee.description}
                </p>
                <div className="mt-3 flex min-h-[28px] flex-wrap items-center gap-2">
                  {committee.isMember && (
                    <ParentChip theme={theme} tone="success">
                      Member
                    </ParentChip>
                  )}
                  {committee.requestStatus && !committee.isMember && (
                    <ParentCommitteeRequestStatus
                      status={committee.requestStatus}
                      theme={theme}
                    />
                  )}
                  {committee.dutyRoles.length > 0 && (
                    <span className="text-[12px]" style={{ color: theme.muted }}>
                      {committee.dutyRoles.length} role
                      {committee.dutyRoles.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </ParentCard>
          </button>
        </motion.div>
      ))}
    </motion.div>
  );
}
