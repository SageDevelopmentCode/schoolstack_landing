// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { adelphiaClassicalChristianAcademyConfig } from "@/data/school-demos/adelphia-classical-christian-academy";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function AdelphiaClassicalChristianAcademyWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={adelphiaClassicalChristianAcademyConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
