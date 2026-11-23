// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { desertDragonSchoolConfig } from "@/data/school-demos/desert-dragon-school";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function DesertDragonSchoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={desertDragonSchoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
