// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { prestigeWisdomAcademyConfig } from "@/data/school-demos/prestige-wisdom-academy";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function PrestigeWisdomAcademyWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={prestigeWisdomAcademyConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
