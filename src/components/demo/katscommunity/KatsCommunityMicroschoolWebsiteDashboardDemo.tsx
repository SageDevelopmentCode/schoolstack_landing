// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { katsCommunityMicroschoolConfig } from "@/data/school-demos/kats-community-microschool";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function KatsCommunityMicroschoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={katsCommunityMicroschoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
