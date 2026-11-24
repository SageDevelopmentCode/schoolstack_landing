// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { coastalSageMontessoriConfig } from "@/data/school-demos/coastal-sage-montessori";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function CoastalSageMontessoriWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={coastalSageMontessoriConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
