// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { wonderhereLakelandConfig } from "@/data/school-demos/wonderhere-lakeland";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function WonderHereWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={wonderhereLakelandConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
