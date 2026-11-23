// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { downToEarthHomeschoolConfig } from "@/data/school-demos/down-to-earth-homeschool";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function DownToEarthHomeschoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={downToEarthHomeschoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
