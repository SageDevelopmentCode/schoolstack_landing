"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { schoolTeacherDemoConfigs } from "@/data/school-demos/dashboard-registry";

const SchoolTeacherDashboardDemo = dynamic(
  () => import("@/components/demo/shared/SchoolTeacherDashboardDemo"),
  { ssr: false },
);

export type LazySchoolTeacherDashboardDemoProps = Omit<
  ComponentProps<typeof SchoolTeacherDashboardDemo>,
  "config"
> & {
  demoSlug: string;
};

export function LazySchoolTeacherDashboardDemo({
  demoSlug,
  ...props
}: LazySchoolTeacherDashboardDemoProps) {
  const config = schoolTeacherDemoConfigs[demoSlug];
  if (!config) return null;
  return <SchoolTeacherDashboardDemo config={config} {...props} />;
}
