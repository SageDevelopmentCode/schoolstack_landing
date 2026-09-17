"use client";

import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  MOCK_FRIDAY_BRANCH_LEARNERS,
  countBlockClasses,
} from "@/lib/school-admin/friday-branch/friday-branch-mock";
import type { FridayBranchBlock } from "@/lib/school-admin/friday-branch/friday-branch-types";

type FridayBranchMetricsProps = {
  theme: ParentThemeTokens;
  blocks: FridayBranchBlock[];
  selectedBlock: FridayBranchBlock | null;
};

export default function FridayBranchMetrics({
  theme,
  blocks,
  selectedBlock,
}: FridayBranchMetricsProps) {
  const slotsInBlock = selectedBlock?.slots.length ?? 0;
  const classesInBlock = selectedBlock ? countBlockClasses(selectedBlock) : 0;

  return (
    <div className="grid grid-cols-2 gap-[13px] lg:grid-cols-4">
      <AdminMetricCard
        theme={theme}
        value={String(blocks.length)}
        label="Program blocks this year"
        accent="forest"
      />
      <AdminMetricCard
        theme={theme}
        value={String(slotsInBlock)}
        label={`Time slots in ${selectedBlock?.label ?? "block"}`}
        accent="sky"
      />
      <AdminMetricCard
        theme={theme}
        value={String(classesInBlock)}
        label="Classes scheduled"
        accent="gold"
      />
      <AdminMetricCard
        theme={theme}
        value={String(MOCK_FRIDAY_BRANCH_LEARNERS)}
        label="Learners in Friday Branch (preview)"
        accent="berry"
      />
    </div>
  );
}
