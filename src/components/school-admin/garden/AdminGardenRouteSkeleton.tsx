"use client";

import { ADMIN_GARDEN_CONTAINER_CLASS } from "@/components/school-admin/dashboard/garden/shared";
import { AdminGardenPageSkeleton } from "./kit";

/**
 * Route-level loading state for Garden admin tabs (next/dynamic `loading`,
 * Suspense fallbacks). Cream page, card-shaped blocks, no theme needed.
 * Client file so server routes can render it (skill §2).
 */
export default function AdminGardenRouteSkeleton({
  label,
  layout = "main-rail",
}: {
  label: string;
  layout?: "main-rail" | "split" | "table";
}) {
  return (
    <div className="min-h-full w-full bg-[#f7f1e7]" aria-busy="true">
      <div className={ADMIN_GARDEN_CONTAINER_CLASS}>
        <AdminGardenPageSkeleton label={label} layout={layout} />
      </div>
    </div>
  );
}
