// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { desertSunRanchAcademyConfig } from "@/data/school-demos/desert-sun-ranch-academy";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function DesertSunRanchAcademyWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={desertSunRanchAcademyConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
