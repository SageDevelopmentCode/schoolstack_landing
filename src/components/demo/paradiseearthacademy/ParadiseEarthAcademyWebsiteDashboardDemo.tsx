"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { paradiseEarthAcademyConfig } from "@/data/school-demos/paradise-earth-academy";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function ParadiseEarthAcademyWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={paradiseEarthAcademyConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
