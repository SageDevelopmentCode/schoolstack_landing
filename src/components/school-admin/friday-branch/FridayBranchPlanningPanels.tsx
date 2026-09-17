"use client";

import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { getScheduleGaps } from "@/lib/school-admin/friday-branch/friday-branch-mock";
import type { FridayBranchBlock } from "@/lib/school-admin/friday-branch/friday-branch-types";

type FridayBranchPlanningPanelsProps = {
  theme: ParentThemeTokens;
  block: FridayBranchBlock;
  onReviewGaps: () => void;
};

export default function FridayBranchPlanningPanels({
  theme,
  block,
  onReviewGaps,
}: FridayBranchPlanningPanelsProps) {
  const gaps = getScheduleGaps(block);

  return (
    <div className="mt-4 grid gap-[15px] lg:grid-cols-[1.25fr_0.75fr]">
      <AdminCard theme={theme} padding="none" className="p-[19px]">
        <AdminSectionKicker theme={theme}>Program notes</AdminSectionKicker>
        <h3
          className="mt-1.5 font-heading text-[19px] font-semibold"
          style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
        >
          What families will see
        </h3>
        <div className="border-t pt-[11px] text-xs" style={{ borderColor: "#E9EFEA" }}>
          <b className="block" style={{ color: theme.ink }}>Block dates and class choices</b>
          <span style={{ color: "#748288" }}>
            Families see the current Friday Branch block and available classes in their portal.
          </span>
        </div>
        <div className="border-t py-[11px] text-xs" style={{ borderColor: "#E9EFEA" }}>
          <b className="block" style={{ color: theme.ink }}>Age group guidance</b>
          <span style={{ color: "#748288" }}>
            Clear age ranges help families choose the right learning experiences.
          </span>
        </div>
        <AdminButton theme={theme} variant="soft" type="button" className="mt-3" disabled>
          Preview family view
        </AdminButton>
      </AdminCard>

      <AdminCard theme={theme} padding="none" className="p-[19px]">
        <AdminSectionKicker theme={theme}>Planning checklist</AdminSectionKicker>
        <h3
          className="mt-1.5 font-heading text-[19px] font-semibold"
          style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
        >
          Finish {block.label}
        </h3>
        {gaps.length === 0 ? (
          <div className="border-t pt-[11px] text-xs" style={{ borderColor: "#E9EFEA", color: "#748288" }}>
            <b className="block" style={{ color: theme.ink }}>✓ Schedule details complete</b>
            <span>All classes have locations and age groups assigned.</span>
          </div>
        ) : (
          gaps.map((gap) => (
            <div key={gap.classId} className="border-t py-[11px] text-xs" style={{ borderColor: "#E9EFEA" }}>
              {gap.missingLocation ? (
                <>
                  <b className="block" style={{ color: theme.ink }}>🟡 Set {gap.className} location</b>
                  <span style={{ color: "#748288" }}>Choose indoor, meadow, or off-site location.</span>
                </>
              ) : null}
              {gap.missingAge ? (
                <>
                  <b className="mt-2 block" style={{ color: theme.ink }}>🟡 Assign {gap.className} age group</b>
                  <span style={{ color: "#748288" }}>Set the learner range before publishing.</span>
                </>
              ) : null}
            </div>
          ))
        )}
        {gaps.length > 0 ? (
          <AdminButton theme={theme} variant="soft" type="button" className="mt-3" onClick={onReviewGaps}>
            Review open details →
          </AdminButton>
        ) : null}
      </AdminCard>
    </div>
  );
}
