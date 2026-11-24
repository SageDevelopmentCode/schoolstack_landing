// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { brightMindsFutureLeadersConfig } from "@/data/school-demos/bright-minds-future-leaders";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function BrightMindsFutureLeadersWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={brightMindsFutureLeadersConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
