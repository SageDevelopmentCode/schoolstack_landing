"use client";

import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentSkeletonBlock from "@/components/school-parent/ui/ParentSkeletonBlock";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentChildrenRecordSkeletonProps = {
  theme: ParentThemeTokens;
};

export default function ParentChildrenRecordSkeleton({
  theme,
}: ParentChildrenRecordSkeletonProps) {
  return (
    <section data-testid="parent-children-record-skeleton">
      <ParentCard theme={theme} className="!p-0">
        <div
          className="flex flex-col gap-0 border-b px-5 py-5 sm:px-6"
          style={{ borderColor: theme.line }}
        >
          <ParentSkeletonBlock theme={theme} className="h-3 w-24" />
          <div className="mt-4 flex items-center gap-4">
            <ParentSkeletonBlock theme={theme} className="h-[88px] w-[88px] shrink-0 rounded-[18px]" />
            <div className="min-w-0 flex-1 space-y-2">
              <ParentSkeletonBlock theme={theme} className="h-6 w-44" />
              <div className="flex flex-wrap gap-2">
                <ParentSkeletonBlock theme={theme} className="h-5 w-16 rounded-full" />
                <ParentSkeletonBlock theme={theme} className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 sm:px-6">
          <ParentSkeletonBlock theme={theme} className="h-10 w-72 max-w-full rounded-lg" />
        </div>

        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <div
            className="rounded-2xl border px-5 py-6 sm:px-6"
            style={{ borderColor: theme.line, backgroundColor: theme.white }}
          >
            <ParentSkeletonBlock theme={theme} className="h-5 w-40" />
            <ParentSkeletonBlock theme={theme} className="mt-2 h-3 w-full max-w-md" />
            <div className="mt-6 space-y-4">
              <ParentSkeletonBlock theme={theme} className="h-10 w-full" />
              <ParentSkeletonBlock theme={theme} className="h-10 w-full" />
              <ParentSkeletonBlock theme={theme} className="h-10 w-4/5" />
              <ParentSkeletonBlock theme={theme} className="h-10 w-full" />
            </div>
          </div>
        </div>
      </ParentCard>
    </section>
  );
}
