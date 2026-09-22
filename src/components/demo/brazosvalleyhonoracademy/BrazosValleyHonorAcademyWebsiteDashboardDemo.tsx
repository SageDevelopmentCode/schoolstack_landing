// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { brazosValleyHonorAcademyConfig } from "@/data/school-demos/brazos-valley-honor-academy";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function BrazosValleyHonorAcademyWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={brazosValleyHonorAcademyConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
