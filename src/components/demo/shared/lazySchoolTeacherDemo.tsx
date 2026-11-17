"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { schoolTeacherDemoConfigs } from "@/data/school-demos/dashboard-registry";

const SchoolTeacherDashboardDemo = dynamic(
  () => import("@/components/demo/shared/SchoolTeacherDashboardDemo"),
  { ssr: false },
);

const DemoTeacherGardenPortal = dynamic(
  () => import("@/components/demo/shared/DemoTeacherGardenPortal"),
  { ssr: false },
);

/** The walkthrough's staff step: the real Garden staff portal for this school. */
export function LazySchoolTeacherGardenPortal({
  demoSlug,
  initialTab,
}: {
  demoSlug: string;
  initialTab?: ComponentProps<typeof DemoTeacherGardenPortal>["initialTab"];
}) {
  const config = schoolTeacherDemoConfigs[demoSlug];
  if (!config) return null;
  return <DemoTeacherGardenPortal config={config} initialTab={initialTab} />;
}

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
