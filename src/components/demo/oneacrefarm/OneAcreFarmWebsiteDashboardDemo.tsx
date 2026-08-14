// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { oneAcreFarmConfig } from "@/data/school-demos/one-acre-farm";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function OneAcreFarmWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={oneAcreFarmConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
