// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { monarchHillsEducationConfig } from "@/data/school-demos/monarch-hills-education";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function MonarchHillsWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={monarchHillsEducationConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
