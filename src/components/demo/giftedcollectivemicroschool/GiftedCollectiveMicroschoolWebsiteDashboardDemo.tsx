// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { giftedCollectiveMicroschoolConfig } from "@/data/school-demos/gifted-collective-microschool";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function GiftedCollectiveMicroschoolWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={giftedCollectiveMicroschoolConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
