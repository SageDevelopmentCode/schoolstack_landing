"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { athenaMicroacademyConfig } from "@/data/school-demos/athena-microacademy";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function AthenaWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={athenaMicroacademyConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
