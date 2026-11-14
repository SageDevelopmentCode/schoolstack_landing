"use client";

import { GSkeleton } from "@/components/school-parent/garden/ui";

type ParentAttendanceHistoryListSkeletonProps = {
  rowCount?: number;
  label?: string;
};

/** Garden placeholder rows shaped like the history list. */
export default function ParentAttendanceHistoryListSkeleton({
  rowCount = 9,
  label = "Loading attendance history",
}: ParentAttendanceHistoryListSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      data-testid="parent-attendance-history-loading"
    >
      {Array.from({ length: rowCount }, (_, index) => (
        <div
          key={index}
          className="flex min-h-[56px] items-center gap-3 border-t border-dashed border-[var(--sf-ink)]/12 px-2.5 py-2.5 first:border-t-0"
        >
          <GSkeleton className="h-7 w-7 shrink-0 !rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <GSkeleton className="h-3.5 w-28 !rounded-full" />
            <GSkeleton className="h-3 w-40 !rounded-full" />
          </div>
          <GSkeleton className="hidden h-5 w-16 shrink-0 !rounded-full sm:block" />
        </div>
      ))}
    </div>
  );
}
