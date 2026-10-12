// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { wildcatMicroschoolConfig } from "@/data/school-demos/wildcat-microschool";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function WildcatMicroschoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={wildcatMicroschoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
