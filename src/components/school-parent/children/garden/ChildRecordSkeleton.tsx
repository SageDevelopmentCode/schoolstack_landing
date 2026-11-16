"use client";

import { GKicker, GSkeleton } from "@/components/school-parent/garden/ui";

/** Placeholder for the School record card while a child's profile loads. */
export default function ChildRecordSkeleton() {
  return (
    <section
      data-testid="parent-children-record-skeleton"
      aria-busy="true"
      aria-label="Loading school record"
      className="rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-5 shadow-[0_3px_0_0_rgba(43,36,29,0.08)] sm:p-6"
    >
      <GKicker>School record</GKicker>
      <GSkeleton className="mt-2 h-7 w-56 !rounded-full" />
      <div className="mt-5 flex gap-2 overflow-hidden">
        {[120, 170, 100, 90, 150].map((w) => (
          <GSkeleton key={w} className="h-9 shrink-0 !rounded-full" style={{ width: w }} />
        ))}
      </div>
      <GSkeleton className="mt-5 h-64 !rounded-[18px]" />
    </section>
  );
}
