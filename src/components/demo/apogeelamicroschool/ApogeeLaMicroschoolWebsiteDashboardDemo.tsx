// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { apogeeLaMicroschoolConfig } from "@/data/school-demos/apogee-la-microschool";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function ApogeeLaMicroschoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={apogeeLaMicroschoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
