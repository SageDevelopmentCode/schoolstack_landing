"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { schoolParentDemoConfigs } from "@/data/school-demos/dashboard-registry";

const SchoolParentDashboardDemo = dynamic(
  () => import("@/components/demo/shared/SchoolParentDashboardDemo"),
  { ssr: false },
);

export type LazySchoolParentDashboardDemoProps = Omit<
  ComponentProps<typeof SchoolParentDashboardDemo>,
  "config"
> & {
  demoSlug: string;
};

export function LazySchoolParentDashboardDemo({
  demoSlug,
  ...props
}: LazySchoolParentDashboardDemoProps) {
  const config = schoolParentDemoConfigs[demoSlug];
  if (!config) return null;
  return <SchoolParentDashboardDemo config={config} {...props} />;
}
