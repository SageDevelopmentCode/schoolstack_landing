"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { zoeLearningHouseConfig } from "@/data/school-demos/zoe-learning-house";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function ZoeLearningHouseWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={zoeLearningHouseConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
