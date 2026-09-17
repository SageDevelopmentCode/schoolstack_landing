// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { naplesMicroschoolsConfig } from "@/data/school-demos/naples-microschools";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function NaplesMicroschoolsWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={naplesMicroschoolsConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
