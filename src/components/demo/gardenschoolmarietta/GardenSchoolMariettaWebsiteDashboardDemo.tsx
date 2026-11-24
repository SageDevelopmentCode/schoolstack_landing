// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { gardenSchoolMariettaConfig } from "@/data/school-demos/garden-school-marietta";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function GardenSchoolMariettaWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={gardenSchoolMariettaConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
