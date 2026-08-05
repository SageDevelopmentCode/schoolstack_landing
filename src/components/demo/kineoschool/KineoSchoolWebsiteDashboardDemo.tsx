"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { kineoSchoolConfig } from "@/data/school-demos/kineo-school";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function KineoSchoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={kineoSchoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
