// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { rootedMeadowsConfig } from "@/data/school-demos/rooted-meadows";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function RootedMeadowsWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={rootedMeadowsConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
