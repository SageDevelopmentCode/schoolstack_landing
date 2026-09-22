// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { rootsAndWingsMicroschoolConfig } from "@/data/school-demos/roots-and-wings-microschool";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function RootsAndWingsMicroschoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={rootsAndWingsMicroschoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
