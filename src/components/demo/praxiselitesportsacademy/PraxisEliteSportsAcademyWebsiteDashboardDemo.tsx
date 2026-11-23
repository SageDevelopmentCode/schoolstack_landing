// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { praxisEliteSportsAcademyConfig } from "@/data/school-demos/praxis-elite-sports-academy";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function PraxisEliteSportsAcademyWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={praxisEliteSportsAcademyConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
