"use client";

import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { gatheredOakFarmConfig } from "@/data/school-demos/gathered-oak-farm";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof WebsiteDashboardDemo>;

export default function GatheredOakFarmWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={gatheredOakFarmConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
