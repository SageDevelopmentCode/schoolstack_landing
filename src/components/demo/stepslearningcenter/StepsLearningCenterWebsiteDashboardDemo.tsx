// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { stepsLearningCenterConfig } from "@/data/school-demos/steps-learning-center";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function StepsLearningCenterWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={stepsLearningCenterConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
