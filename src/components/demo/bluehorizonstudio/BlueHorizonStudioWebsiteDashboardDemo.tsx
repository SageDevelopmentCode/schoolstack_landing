// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { blueHorizonStudioConfig } from "@/data/school-demos/blue-horizon-studio";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function BlueHorizonStudioWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={blueHorizonStudioConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
