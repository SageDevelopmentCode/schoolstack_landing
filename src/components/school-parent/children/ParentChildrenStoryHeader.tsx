"use client";

import { motion } from "framer-motion";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import {
  childFirstName,
  familyChildrenSubtitle,
  formatChildrenPageDate,
} from "@/components/school-parent/children/parent-children-utils";
import { parentChildrenViewTransition } from "@/components/school-parent/children/parent-children-view-transition";
import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentChildrenStoryHeaderProps = {
  theme: ParentThemeTokens;
  learners: FamilyChildOverview[];
  selectedChild: FamilyChildOverview | null;
  onViewRecord: () => void;
};

export default function ParentChildrenStoryHeader({
  theme,
  learners,
  selectedChild,
  onViewRecord,
}: ParentChildrenStoryHeaderProps) {
  const dateLabel = formatChildrenPageDate();
  const subtitle = familyChildrenSubtitle(learners);
  const title = selectedChild
    ? `${childFirstName(selectedChild.studentName)}'s profile`
    : "Follow their day.";

  return (
    <header
      className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      data-testid="parent-children-story-header"
    >
      <motion.div key={selectedChild?.applicationId ?? "default"} className="min-w-0" {...parentChildrenViewTransition}>
        <ParentSectionKicker theme={theme}>
          My children · {dateLabel}
        </ParentSectionKicker>
        <ParentDisplayHeading theme={theme} as="h1" size="section" className="!text-[clamp(1.75rem,4vw,2.15rem)]">
          {title}
        </ParentDisplayHeading>
        {subtitle ? (
          <p className="mt-1 text-[13px]" style={{ color: theme.muted }}>
            {subtitle}
          </p>
        ) : null}
      </motion.div>

      {selectedChild ? (
        <ParentButton
          theme={theme}
          variant="outline"
          onClick={onViewRecord}
          className="w-full shrink-0 sm:w-auto"
        >
          View school record
        </ParentButton>
      ) : null}
    </header>
  );
}
