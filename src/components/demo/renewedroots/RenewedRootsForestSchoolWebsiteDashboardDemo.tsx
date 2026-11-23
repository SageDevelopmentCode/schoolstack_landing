// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { renewedRootsForestSchoolConfig } from "@/data/school-demos/renewed-roots-forest-school";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function RenewedRootsForestSchoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={renewedRootsForestSchoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
