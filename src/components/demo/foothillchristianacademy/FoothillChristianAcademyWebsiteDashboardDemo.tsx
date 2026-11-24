// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { foothillChristianAcademyConfig } from "@/data/school-demos/foothill-christian-academy";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function FoothillChristianAcademyWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={foothillChristianAcademyConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
