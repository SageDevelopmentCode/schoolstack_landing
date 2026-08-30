"use client";

import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentSkeletonBlock from "@/components/school-parent/ui/ParentSkeletonBlock";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentChildrenOverviewSkeletonProps = {
  theme: ParentThemeTokens;
};

function OverviewCardSkeleton({ theme }: { theme: ParentThemeTokens }) {
  return (
    <ParentCard theme={theme} className="!p-5">
      <ParentSkeletonBlock theme={theme} className="h-3 w-28" />
      <ParentSkeletonBlock theme={theme} className="mt-3 h-5 w-40" />
      <div className="mt-4 space-y-3">
        <ParentSkeletonBlock theme={theme} className="h-3 w-full" />
        <ParentSkeletonBlock theme={theme} className="h-3 w-4/5" />
      </div>
    </ParentCard>
  );
}

export default function ParentChildrenOverviewSkeleton({
  theme,
}: ParentChildrenOverviewSkeletonProps) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      data-testid="parent-children-overview-skeleton"
    >
      <OverviewCardSkeleton theme={theme} />
      <OverviewCardSkeleton theme={theme} />
    </div>
  );
}
