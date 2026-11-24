// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { innerFireAcademyConfig } from "@/data/school-demos/inner-fire-academy";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function InnerFireAcademyWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={innerFireAcademyConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
