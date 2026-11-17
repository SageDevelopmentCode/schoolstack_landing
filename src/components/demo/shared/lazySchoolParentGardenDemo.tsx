"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { schoolParentDemoConfigs } from "@/data/school-demos/dashboard-registry";

const DemoParentEnrollmentChecklist = dynamic(
  () => import("@/components/demo/shared/DemoParentEnrollmentChecklist"),
  { ssr: false },
);

const DemoParentGardenPortal = dynamic(
  () => import("@/components/demo/shared/DemoParentGardenPortal"),
  { ssr: false },
);

/** Walkthrough step 5: the real Garden enrollment checklist for a shared demo school. */
export function LazyDemoParentEnrollmentChecklist({
  demoSlug,
  ...props
}: Omit<ComponentProps<typeof DemoParentEnrollmentChecklist>, "config"> & {
  demoSlug: string;
}) {
  const config = schoolParentDemoConfigs[demoSlug];
  if (!config) return null;
  return <DemoParentEnrollmentChecklist config={config} {...props} />;
}

/** Walkthrough Home / step 6: the real Garden parent portal for a shared demo school. */
export function LazyDemoParentGardenPortal({
  demoSlug,
  ...props
}: Omit<ComponentProps<typeof DemoParentGardenPortal>, "config"> & {
  demoSlug: string;
}) {
  const config = schoolParentDemoConfigs[demoSlug];
  if (!config) return null;
  return <DemoParentGardenPortal config={config} {...props} />;
}
