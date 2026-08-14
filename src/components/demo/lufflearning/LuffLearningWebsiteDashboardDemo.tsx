// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { luffLearningConfig } from "@/data/school-demos/luff-learning";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function LuffLearningWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={luffLearningConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
