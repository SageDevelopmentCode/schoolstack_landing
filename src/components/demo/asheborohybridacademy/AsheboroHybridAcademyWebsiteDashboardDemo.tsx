"use client";

import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { asheboroHybridAcademyConfig } from "@/data/school-demos/asheboro-hybrid-academy";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof WebsiteDashboardDemo>;

export default function AsheboroHybridAcademyWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={asheboroHybridAcademyConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
