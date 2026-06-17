"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { micahsMissionSchoolConfig } from "@/data/school-demos/micahs-mission-school";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function MicahMissionWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={micahsMissionSchoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
