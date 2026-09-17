"use client";

import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { formatFridayDateLong, getScheduleGaps } from "@/lib/school-admin/friday-branch/friday-branch-mock";
import type { FridayBranchBlock } from "@/lib/school-admin/friday-branch/friday-branch-types";

type FridayBranchFocusStripProps = {
  theme: ParentThemeTokens;
  block: FridayBranchBlock;
  onReviewGaps: () => void;
};

export default function FridayBranchFocusStrip({
  theme,
  block,
  onReviewGaps,
}: FridayBranchFocusStripProps) {
  const gaps = getScheduleGaps(block);
  if (gaps.length === 0) return null;

  const startLabel = block.startDate ? formatFridayDateLong(block.startDate) : "this block";
  const gapSummary =
    gaps.length === 1
      ? `One class still needs ${gaps[0].missingLocation && gaps[0].missingAge ? "a location and age group" : gaps[0].missingLocation ? "a location" : "an age group"}.`
      : `${gaps.length} classes still need location or age group details.`;

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
      style={{
        backgroundColor: "#EAF4EB",
        borderColor: "#C7DFCB",
        color: "#42694F",
      }}
    >
      <span className="text-xs leading-relaxed sm:text-sm">
        <b>Program focus:</b> {block.label} begins {startLabel.split(", ").slice(1).join(", ") || startLabel}. {gapSummary}
      </span>
      <AdminButton theme={theme} variant="soft" type="button" onClick={onReviewGaps}>
        Review open details →
      </AdminButton>
    </div>
  );
}
