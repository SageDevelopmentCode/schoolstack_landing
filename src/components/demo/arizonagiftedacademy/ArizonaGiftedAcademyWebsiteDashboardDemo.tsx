"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { arizonaGiftedAcademyConfig } from "@/data/school-demos/arizona-gifted-academy";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function ArizonaGiftedAcademyWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={arizonaGiftedAcademyConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
