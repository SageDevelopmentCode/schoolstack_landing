"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { schoolAdminDemoConfigs } from "@/data/school-demos/dashboard-registry";

const SchoolAdminDashboardDemo = dynamic(
  () => import("@/components/demo/shared/SchoolAdminDashboardDemo"),
  { ssr: false },
);

export type LazySchoolAdminDashboardDemoProps = Omit<
  ComponentProps<typeof SchoolAdminDashboardDemo>,
  "config"
> & {
  demoSlug: string;
};

export function LazySchoolAdminDashboardDemo({
  demoSlug,
  ...props
}: LazySchoolAdminDashboardDemoProps) {
  const config = schoolAdminDemoConfigs[demoSlug];
  if (!config) return null;
  return <SchoolAdminDashboardDemo config={config} {...props} />;
}

let sharedAdminPromise: Promise<unknown> | null = null;

export function prefetchSchoolAdminDemo() {
  if (!sharedAdminPromise) {
    sharedAdminPromise = import(
      "@/components/demo/shared/SchoolAdminDashboardDemo"
    ).catch((error) => {
      sharedAdminPromise = null;
      console.error("Failed to prefetch shared admin demo:", error);
      throw error;
    });
  }
  return sharedAdminPromise;
}
