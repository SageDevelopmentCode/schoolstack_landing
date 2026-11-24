// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { esteamAcademyRoundRockConfig } from "@/data/school-demos/esteam-academy-round-rock";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function EsteamAcademyRoundRockWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={esteamAcademyRoundRockConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
