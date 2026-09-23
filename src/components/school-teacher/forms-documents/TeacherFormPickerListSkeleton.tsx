"use client";

import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type TeacherFormPickerListSkeletonProps = {
  theme: ParentThemeTokens;
  rows?: number;
  label?: string;
};

function SkeletonBlock({
  theme,
  className,
}: {
  theme: ParentThemeTokens;
  className: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-md ${className}`}
      style={{ backgroundColor: theme.line }}
      aria-hidden
    />
  );
}

export default function TeacherFormPickerListSkeleton({
  theme,
  rows = 6,
  label = "Loading options",
}: TeacherFormPickerListSkeletonProps) {
  return (
    <div
      className="flex flex-col gap-2"
      aria-busy="true"
      aria-label={label}
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-3 rounded-[10px] border px-3 py-2.5"
          style={{ borderColor: theme.line, backgroundColor: theme.white }}
        >
          <SkeletonBlock theme={theme} className="mt-0.5 h-5 w-5 shrink-0 rounded" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <SkeletonBlock theme={theme} className="h-4 w-40" />
            <SkeletonBlock theme={theme} className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}
