// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { spyrjaAcademyNewBraunfelsConfig } from "@/data/school-demos/spyrja-academy-new-braunfels";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function SpyrjaAcademyNewBraunfelsWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={spyrjaAcademyNewBraunfelsConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
