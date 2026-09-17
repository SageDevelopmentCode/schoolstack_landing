"use client";

import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { littleSprigsTampaConfig } from "@/data/school-demos/little-sprigs-tampa";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof WebsiteDashboardDemo>;

export default function LittleSprigsTampaWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={littleSprigsTampaConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
