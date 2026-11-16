"use client";

import { GSkeleton } from "@/components/school-parent/garden/ui";

/** Garden loading state for the Enrollment Flows builders (outline + canvas). */
export function GardenCanvasSkeleton({ label }: { label: string }) {
  return (
    <div className="flex min-h-0 flex-1 gap-5 p-4 sm:p-6" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="hidden w-[280px] shrink-0 flex-col gap-2 md:flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <GSkeleton key={i} className="h-12 !rounded-[14px]" />
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <GSkeleton className="h-8 w-56 !rounded-[12px]" />
        <GSkeleton className="h-[140px]" />
        <GSkeleton className="h-[140px]" />
        <GSkeleton className="h-[90px]" />
      </div>
    </div>
  );
}
