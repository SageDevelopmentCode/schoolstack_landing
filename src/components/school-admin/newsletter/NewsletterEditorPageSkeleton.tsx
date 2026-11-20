"use client";

import { GSkeleton } from "@/components/school-parent/garden/ui";

/** Garden skeleton in the builder's shape: header, outline, newsletter, rail. Render inside the Garden frame. */
export default function NewsletterEditorPageSkeleton() {
  return (
    <div className="flex min-h-full flex-col" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading newsletter editor</span>
      <div className="flex items-center justify-between gap-3 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <GSkeleton className="h-4 w-28 !rounded-full" />
          <GSkeleton className="h-7 w-56 !rounded-[10px]" />
        </div>
        <div className="flex gap-2">
          <GSkeleton className="h-9 w-24 !rounded-full" />
          <GSkeleton className="h-9 w-9 !rounded-full" />
        </div>
      </div>
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="hidden w-[264px] shrink-0 flex-col gap-2 border-r-[1.5px] border-dashed border-[var(--sf-ink)]/14 bg-[#fffdf8] p-3 lg:flex">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <GSkeleton key={i} className="h-11 !rounded-[14px]" />
          ))}
        </div>
        <div className="flex-1 px-4 py-6 sm:px-6">
          <div className="mx-auto flex max-w-[760px] flex-col gap-4">
            <GSkeleton className="h-5 w-48 !rounded-full" />
            <GSkeleton className="h-[300px] !rounded-[28px]" />
            <GSkeleton className="h-[160px] !rounded-[28px]" />
          </div>
        </div>
        <div className="hidden w-[300px] shrink-0 border-l-[1.5px] border-dashed border-[var(--sf-ink)]/14 p-4 xl:block">
          <GSkeleton className="h-[220px]" />
        </div>
      </div>
    </div>
  );
}
