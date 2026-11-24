// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { ahbCommunitySchoolConfig } from "@/data/school-demos/ahb-community-school";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function AhbCommunitySchoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={ahbCommunitySchoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
