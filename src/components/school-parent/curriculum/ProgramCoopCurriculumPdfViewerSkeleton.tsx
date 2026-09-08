"use client";

import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentSkeletonBlock from "@/components/school-parent/ui/ParentSkeletonBlock";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ProgramCoopCurriculumPdfViewerSkeletonProps = {
  theme: ParentThemeTokens;
};

export default function ProgramCoopCurriculumPdfViewerSkeleton({
  theme,
}: ProgramCoopCurriculumPdfViewerSkeletonProps) {
  return (
    <div
      className="flex h-full min-h-0 flex-1 flex-col"
      data-testid="curriculum-pdf-viewer-skeleton"
      aria-busy="true"
      aria-label="Loading curriculum PDF"
    >
      <ParentCard
        theme={theme}
        className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] p-0"
      >
        <div
          className="flex shrink-0 items-center justify-between gap-2 border-b px-2 py-1.5"
          style={{ borderColor: theme.line, backgroundColor: theme.cream }}
        >
          <div className="flex items-center gap-1">
            <ParentSkeletonBlock theme={theme} className="h-7 w-7 rounded-md" />
            <ParentSkeletonBlock theme={theme} className="h-7 w-7 rounded-md" />
            <ParentSkeletonBlock theme={theme} className="h-3 w-20" />
            <ParentSkeletonBlock theme={theme} className="h-7 w-7 rounded-md" />
          </div>
          <div className="flex items-center gap-1">
            <ParentSkeletonBlock theme={theme} className="h-7 w-7 rounded-md" />
            <ParentSkeletonBlock theme={theme} className="h-3 w-8" />
            <ParentSkeletonBlock theme={theme} className="h-7 w-7 rounded-md" />
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
          <div className="flex min-h-full justify-center p-3">
            <ParentSkeletonBlock
              theme={theme}
              className="aspect-[8.5/11] w-full max-w-[520px] rounded-sm shadow-sm"
            />
          </div>
        </div>
      </ParentCard>
    </div>
  );
}
