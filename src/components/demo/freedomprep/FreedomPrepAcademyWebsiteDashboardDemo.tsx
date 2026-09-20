// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { freedomPrepAcademyConfig } from "@/data/school-demos/freedom-prep-academy";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function FreedomPrepAcademyWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={freedomPrepAcademyConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
