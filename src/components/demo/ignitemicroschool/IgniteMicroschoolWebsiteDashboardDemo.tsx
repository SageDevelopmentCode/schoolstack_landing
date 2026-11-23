// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { igniteMicroschoolConfig } from "@/data/school-demos/ignite-microschool";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function IgniteMicroschoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={igniteMicroschoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
