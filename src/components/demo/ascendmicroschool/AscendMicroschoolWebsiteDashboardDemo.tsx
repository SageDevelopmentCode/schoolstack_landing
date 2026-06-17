"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { ascendMicroSchoolConfig } from "@/data/school-demos/ascend-micro-school";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function AscendMicroschoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={ascendMicroSchoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
