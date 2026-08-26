// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { kinderAcademyPrepSchoolConfig } from "@/data/school-demos/kinder-academy-prep-school";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function KinderAcademyPrepSchoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={kinderAcademyPrepSchoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
