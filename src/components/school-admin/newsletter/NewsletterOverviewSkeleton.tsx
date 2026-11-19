"use client";

import { AdminGardenPageSkeleton } from "@/components/school-admin/garden/kit";

/** Garden skeleton for the newsletters list. Render inside the Garden frame. */
export default function NewsletterOverviewSkeleton() {
  return <AdminGardenPageSkeleton label="Loading newsletters" layout="table" />;
}
