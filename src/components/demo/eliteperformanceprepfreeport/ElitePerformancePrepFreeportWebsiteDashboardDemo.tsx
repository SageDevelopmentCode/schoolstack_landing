// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { elitePerformancePrepFreeportConfig } from "@/data/school-demos/elite-performance-prep-freeport";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function ElitePerformancePrepFreeportWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={elitePerformancePrepFreeportConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
