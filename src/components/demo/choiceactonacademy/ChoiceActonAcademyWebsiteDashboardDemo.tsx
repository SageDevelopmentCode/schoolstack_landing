// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { choiceActonAcademyConfig } from "@/data/school-demos/choice-acton-academy";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function ChoiceActonAcademyWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={choiceActonAcademyConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
