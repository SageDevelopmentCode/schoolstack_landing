"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { theWoodlandsMicroschoolConfig } from "@/data/school-demos/the-woodlands-microschool";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function TheWoodlandsMicroschoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={theWoodlandsMicroschoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
