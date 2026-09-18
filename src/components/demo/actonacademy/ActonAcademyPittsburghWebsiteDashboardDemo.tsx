// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { actonAcademyPittsburghConfig } from "@/data/school-demos/acton-academy-pittsburgh";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function ActonAcademyPittsburghWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={actonAcademyPittsburghConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
