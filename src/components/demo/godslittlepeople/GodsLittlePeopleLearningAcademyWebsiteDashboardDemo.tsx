// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { godsLittlePeopleLearningAcademyConfig } from "@/data/school-demos/gods-little-people-learning-academy";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function GodsLittlePeopleLearningAcademyWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={godsLittlePeopleLearningAcademyConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
