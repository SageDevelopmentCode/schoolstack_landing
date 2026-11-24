// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { coysCampsAndClassesConfig } from "@/data/school-demos/coys-camps-and-classes";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function CoysCampsAndClassesWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={coysCampsAndClassesConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
