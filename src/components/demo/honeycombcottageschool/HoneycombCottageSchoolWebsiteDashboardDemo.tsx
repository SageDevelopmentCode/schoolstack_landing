// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { honeycombCottageSchoolConfig } from "@/data/school-demos/honeycomb-cottage-school";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function HoneycombCottageSchoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={honeycombCottageSchoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
