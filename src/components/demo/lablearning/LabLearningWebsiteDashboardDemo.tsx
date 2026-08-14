// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { labLearningConfig } from "@/data/school-demos/lab-learning";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function LabLearningWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={labLearningConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
