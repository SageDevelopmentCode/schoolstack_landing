// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { madronaSchoolConfig } from "@/data/school-demos/madrona-school";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function MadronaSchoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={madronaSchoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
