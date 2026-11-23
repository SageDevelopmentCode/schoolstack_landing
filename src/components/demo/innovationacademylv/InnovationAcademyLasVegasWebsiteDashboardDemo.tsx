// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { innovationAcademyLasVegasConfig } from "@/data/school-demos/innovation-academy-las-vegas";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function InnovationAcademyLasVegasWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={innovationAcademyLasVegasConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
