// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { meadowsBeeFarmConfig } from "@/data/school-demos/meadows-bee-farm";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function MeadowsBeeFarmWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={meadowsBeeFarmConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
