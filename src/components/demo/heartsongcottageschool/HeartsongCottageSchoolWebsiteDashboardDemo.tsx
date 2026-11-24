// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { heartsongCottageSchoolConfig } from "@/data/school-demos/heartsong-cottage-school";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function HeartsongCottageSchoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={heartsongCottageSchoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
