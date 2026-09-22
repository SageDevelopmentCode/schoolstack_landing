"use client";

import ParentSkeletonBlock from "@/components/school-parent/ui/ParentSkeletonBlock";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentAttendanceHistoryListSkeletonProps = {
  theme: ParentThemeTokens;
  rowCount?: number;
};

function SkeletonRow({ theme }: { theme: ParentThemeTokens }) {
  return (
    <div
      className="flex items-center justify-between gap-3 border-t py-2 first:border-t-0"
      style={{ borderColor: theme.line }}
    >
      <div className="min-w-0 flex-1 space-y-1.5">
        <ParentSkeletonBlock theme={theme} className="h-3 w-24" />
        <ParentSkeletonBlock theme={theme} className="h-2.5 w-32" />
      </div>
      <ParentSkeletonBlock theme={theme} className="h-5 w-16 shrink-0 rounded-full" />
    </div>
  );
}

export default function ParentAttendanceHistoryListSkeleton({
  theme,
  rowCount = 9,
}: ParentAttendanceHistoryListSkeletonProps) {
  return (
    <div
      className="space-y-0"
      aria-busy="true"
      aria-label="Loading attendance history"
      data-testid="parent-attendance-history-loading"
    >
      {Array.from({ length: rowCount }, (_, index) => (
        <SkeletonRow key={index} theme={theme} />
      ))}
    </div>
  );
}
