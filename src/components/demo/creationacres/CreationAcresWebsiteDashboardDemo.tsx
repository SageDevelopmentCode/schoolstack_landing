// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { creationAcresConfig } from "@/data/school-demos/creation-acres";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function CreationAcresWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={creationAcresConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
