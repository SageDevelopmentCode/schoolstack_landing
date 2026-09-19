// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { piedmontForestSchoolConfig } from "@/data/school-demos/piedmont-forest-school";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function PiedmontForestSchoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={piedmontForestSchoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
