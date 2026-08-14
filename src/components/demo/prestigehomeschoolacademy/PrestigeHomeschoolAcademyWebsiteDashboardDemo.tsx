// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { prestigeHomeschoolAcademyConfig } from "@/data/school-demos/prestige-homeschool-academy";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function PrestigeHomeschoolAcademyWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={prestigeHomeschoolAcademyConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
