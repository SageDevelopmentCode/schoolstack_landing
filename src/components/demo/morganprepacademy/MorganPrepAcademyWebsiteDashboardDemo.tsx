// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { morganPrepAcademyConfig } from "@/data/school-demos/morgan-prep-academy";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function MorganPrepAcademyWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={morganPrepAcademyConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
