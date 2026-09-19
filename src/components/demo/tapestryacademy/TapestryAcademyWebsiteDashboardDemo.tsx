"use client";

import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { tapestryAcademyConfig } from "@/data/school-demos/tapestry-academy";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof WebsiteDashboardDemo>;

export default function TapestryAcademyWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={tapestryAcademyConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
