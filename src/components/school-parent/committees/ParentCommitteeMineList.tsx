"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Bell, CalendarDays, CheckSquare, Heart } from "lucide-react";
import { formatMessagesUnreadBadge } from "@/components/messages/MessagesNavBadge";
import {
  fadeUp,
  staggerContainer,
  staggerItem,
} from "@/components/school-admin/committees/committee-motion";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { ParentCommitteeListItem } from "@/lib/committees/types";

function CommitteeUnreadCallout({
  theme,
  unreadCount,
  sectionLabels,
}: {
  theme: ParentThemeTokens;
  unreadCount: number;
  sectionLabels?: string[];
}) {
  const primaryLabel =
    unreadCount === 1 ? "1 unread update" : `${unreadCount} unread updates`;
  const sectionsHint =
    sectionLabels && sectionLabels.length > 0 ? sectionLabels.join(" · ") : null;

  return (
    <div
      className="mb-3 flex items-center gap-3 rounded-[12px] border px-3 py-2.5"
      style={{
        backgroundColor: theme.primarySoft,
        borderColor: `${theme.primary}33`,
      }}
      aria-label={`${primaryLabel}${sectionsHint ? `: ${sectionsHint}` : ""}`}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
        style={{ backgroundColor: theme.white }}
      >
        <Bell className="h-4 w-4" style={{ color: theme.primary }} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold leading-snug" style={{ color: theme.ink }}>
          {primaryLabel}
        </p>
        {sectionsHint ? (
          <p className="mt-0.5 text-[12px] leading-snug" style={{ color: theme.muted }}>
            {sectionsHint}
          </p>
        ) : null}
      </div>
      <span
        className="inline-flex h-7 min-w-[28px] shrink-0 items-center justify-center rounded-full px-2 text-[13px] font-bold leading-none text-white"
        style={{ backgroundColor: theme.primary }}
      >
        {formatMessagesUnreadBadge(unreadCount)}
      </span>
    </div>
  );
}

export default function ParentCommitteeMineList({
  committees,
  theme,
  unreadByCommitteeId = {},
  unreadSectionLabelsByCommitteeId = {},
  onOpenCommittee,
}: {
  committees: ParentCommitteeListItem[];
  theme: ParentThemeTokens;
  unreadByCommitteeId?: Record<string, number>;
  unreadSectionLabelsByCommitteeId?: Record<string, string[]>;
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
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
      variants={staggerContainer(reducedMotion)}
      initial="initial"
      animate="animate"
    >
      {committees.map((committee) => {
        const unreadCount = unreadByCommitteeId[committee.id] ?? 0;
        const sectionLabels = unreadSectionLabelsByCommitteeId[committee.id];
        return (
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
                  {unreadCount > 0 ? (
                    <CommitteeUnreadCallout
                      theme={theme}
                      unreadCount={unreadCount}
                      sectionLabels={sectionLabels}
                    />
                  ) : null}
                  <div className="flex items-start justify-between gap-3">
                    <h3
                      className="min-w-0 flex-1 line-clamp-2 text-[15px] font-bold leading-snug"
                      style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                    >
                      {committee.name}
                    </h3>
                    <ArrowRight
                      className="mt-0.5 h-5 w-5 shrink-0 transition-colors group-hover:opacity-100"
                      style={{ color: theme.primary, opacity: 0.5 }}
                    />
                  </div>
                  <div className="mt-2">
                    <ParentChip theme={theme} tone="info">
                      {committee.termLabel}
                    </ParentChip>
                  </div>
                  <p
                    className="mt-3 line-clamp-3 flex-1 text-[13px] leading-relaxed"
                    style={{ color: theme.muted }}
                  >
                    {committee.description}
                  </p>
                  <div
                    className="mt-3 flex min-h-[28px] flex-wrap items-center gap-4 text-[12px]"
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
              </ParentCard>
            </button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
