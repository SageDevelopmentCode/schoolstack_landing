// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { springRiverSchoolConfig } from "@/data/school-demos/spring-river-school";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function SpringRiverSchoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={springRiverSchoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
