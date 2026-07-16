"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { trueNorthConfig } from "@/data/school-demos/true-north";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function TrueNorthWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={trueNorthConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
