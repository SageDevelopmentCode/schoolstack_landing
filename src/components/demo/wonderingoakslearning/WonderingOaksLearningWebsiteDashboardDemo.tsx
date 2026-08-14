// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { wonderingOaksLearningConfig } from "@/data/school-demos/wondering-oaks-learning";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function WonderingOaksLearningWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={wonderingOaksLearningConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
