// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { bmfMicroschoolsConfig } from "@/data/school-demos/bmf-microschools";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function BmfMicroschoolsWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={bmfMicroschoolsConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
