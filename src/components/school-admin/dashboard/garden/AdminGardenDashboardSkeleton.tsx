"use client";

import { GSkeleton } from "@/components/school-parent/garden/ui";
import { ADMIN_GARDEN_CONTAINER_CLASS } from "./shared";

/** Suspense fallback for the Garden admin dashboard (cream page, card-shaped blocks). */
export default function AdminGardenDashboardSkeleton() {
  return (
    <div className="min-h-full w-full bg-[#f7f1e7]" aria-busy="true" aria-label="Loading dashboard">
      <div className={ADMIN_GARDEN_CONTAINER_CLASS}>
        <GSkeleton className="h-4 w-48 !rounded-full" />
        <GSkeleton className="h-12 w-2/3 !rounded-[16px]" />
        <GSkeleton className="h-11 w-80 max-w-full !rounded-full" />
        <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
          <GSkeleton className="h-[300px]" />
          <GSkeleton className="h-[300px]" />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <GSkeleton className="h-[120px] !rounded-[22px]" />
          <GSkeleton className="h-[120px] !rounded-[22px]" />
          <GSkeleton className="h-[120px] !rounded-[22px]" />
          <GSkeleton className="h-[120px] !rounded-[22px]" />
        </div>
        <GSkeleton className="h-[360px]" />
      </div>
    </div>
  );
}
