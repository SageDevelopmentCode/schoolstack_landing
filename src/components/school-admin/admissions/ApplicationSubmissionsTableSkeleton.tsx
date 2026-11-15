"use client";

import { SubmissionsTableSkeletonRows } from "./ApplicationSubmissionsPageShell";

/** Suspense fallback inside the Garden submissions card. */
export default function ApplicationSubmissionsTableSkeleton() {
  return <SubmissionsTableSkeletonRows columns={7} />;
}
