// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { austinMicroSchoolConfig } from "@/data/school-demos/austin-micro-school";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function AustinMicroSchoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={austinMicroSchoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
