// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { theWildSchoolConfig } from "@/data/school-demos/the-wild-school";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function TheWildSchoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={theWildSchoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
