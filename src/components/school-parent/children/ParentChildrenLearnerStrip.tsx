"use client";

import { motion } from "framer-motion";
import StudentPhoto from "@/components/students/StudentPhoto";
import {
  childFirstName,
  childLearnerSubtitleLine,
} from "@/components/school-parent/children/parent-children-utils";
import { parentChildrenFadeUp } from "@/components/school-parent/children/parent-children-view-transition";
import { childAccentBg } from "@/lib/organization-settings/parent-theme";
import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ParentChildrenLearnerStripProps = {
  theme: ParentThemeTokens;
  adminCompat: AdminThemeTokens;
  learners: FamilyChildOverview[];
  selectedApplicationId: string;
  onSelect: (applicationId: string) => void;
};

export default function ParentChildrenLearnerStrip({
  theme,
  adminCompat,
  learners,
  selectedApplicationId,
  onSelect,
}: ParentChildrenLearnerStripProps) {
  if (learners.length <= 1) return null;

  return (
    <nav
      className="flex w-full max-w-full gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Select learner"
      data-testid="parent-children-learner-strip"
    >
      {learners.map((child, index) => {
        const active = child.applicationId === selectedApplicationId;
        const firstName = childFirstName(child.studentName);
        const accentBg = childAccentBg(index);

        return (
          <motion.button
            key={child.applicationId}
            type="button"
            custom={index}
            initial="hidden"
            animate="visible"
            variants={parentChildrenFadeUp}
            onClick={() => onSelect(child.applicationId)}
            className="inline-flex min-h-[44px] min-w-[155px] shrink-0 items-center gap-2.5 rounded-[14px] border px-3 py-2 text-left transition-all duration-200"
            style={{
              backgroundColor: active ? theme.primarySoft : theme.white,
              borderColor: active ? "#95B9A0" : theme.line,
              boxShadow: active ? theme.shadowPill : undefined,
            }}
            aria-current={active ? "true" : undefined}
            data-testid={`parent-children-learner-${child.applicationId}`}
          >
            <div
              className="shrink-0 overflow-hidden rounded-xl"
              style={{ backgroundColor: accentBg }}
            >
              <StudentPhoto
                name={child.studentName}
                photoUrl={child.profilePhotoUrl}
                size="md"
                shape="square"
                theme={adminCompat}
              />
            </div>
            <div className="min-w-0 flex-1">
              <span
                className="block truncate text-[12px] font-bold"
                style={{ color: theme.ink }}
              >
                {firstName}
              </span>
              <span className="block truncate text-[10px]" style={{ color: theme.muted }}>
                {childLearnerSubtitleLine(child)}
              </span>
            </div>
          </motion.button>
        );
      })}
    </nav>
  );
}
