// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { southOcHybridHomeschoolConfig } from "@/data/school-demos/south-oc-hybrid-homeschool";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function SouthOcHybridHomeschoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={southOcHybridHomeschoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
