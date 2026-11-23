// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { beaconOfHopeAcademyConfig } from "@/data/school-demos/beacon-of-hope-academy";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function BeaconOfHopeAcademyWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={beaconOfHopeAcademyConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
