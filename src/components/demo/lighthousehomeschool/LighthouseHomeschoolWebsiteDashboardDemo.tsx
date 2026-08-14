// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { lighthouseHomeschoolConfig } from "@/data/school-demos/lighthouse-homeschool";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function LighthouseHomeschoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={lighthouseHomeschoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
