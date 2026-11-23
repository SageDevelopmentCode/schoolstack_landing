// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { peninsularPrepConfig } from "@/data/school-demos/peninsular-prep";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function PeninsularPrepWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={peninsularPrepConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
