"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { hiltonHorizonsAcademyConfig } from "@/data/school-demos/hilton-horizons-academy";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function HiltonHorizonWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={hiltonHorizonsAcademyConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
