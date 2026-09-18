// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { actonAcademyPlacerConfig } from "@/data/school-demos/acton-academy-placer";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function ActonAcademyPlacerWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={actonAcademyPlacerConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
