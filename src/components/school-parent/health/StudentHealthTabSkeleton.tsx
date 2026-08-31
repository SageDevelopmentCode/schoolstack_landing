"use client";

import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentSkeletonBlock from "@/components/school-parent/ui/ParentSkeletonBlock";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type StudentHealthTabSkeletonProps = {
  theme: ParentThemeTokens;
};

function SectionItemSkeleton({ theme }: { theme: ParentThemeTokens }) {
  return (
    <div
      className="rounded-2xl border px-4 py-3.5 sm:px-5"
      style={{ borderColor: theme.line, backgroundColor: theme.white }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <ParentSkeletonBlock theme={theme} className="h-4 w-28" />
            <ParentSkeletonBlock theme={theme} className="h-5 w-14 rounded-full" />
          </div>
          <ParentSkeletonBlock theme={theme} className="h-3 w-full max-w-xs" />
          <ParentSkeletonBlock theme={theme} className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

function SectionSkeleton({
  theme,
  title,
}: {
  theme: ParentThemeTokens;
  title: string;
}) {
  return (
    <section className="space-y-3">
      <ParentSectionKicker theme={theme}>{title}</ParentSectionKicker>
      <SectionItemSkeleton theme={theme} />
      <SectionItemSkeleton theme={theme} />
    </section>
  );
}

export default function StudentHealthTabSkeleton({ theme }: StudentHealthTabSkeletonProps) {
  return (
    <div className="space-y-5" data-testid="student-health-tab-skeleton" aria-busy="true">
      <SectionSkeleton theme={theme} title="Food allergies (standing)" />
      <SectionSkeleton theme={theme} title="Medication at school" />
      <SectionSkeleton theme={theme} title="Recent updates" />
    </div>
  );
}
