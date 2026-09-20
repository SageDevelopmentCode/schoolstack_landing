// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { familyLyceumConfig } from "@/data/school-demos/family-lyceum";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function FamilyLyceumWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={familyLyceumConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
