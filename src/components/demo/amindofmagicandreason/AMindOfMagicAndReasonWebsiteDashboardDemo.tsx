// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { aMindOfMagicAndReasonConfig } from "@/data/school-demos/a-mind-of-magic-and-reason";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function AMindOfMagicAndReasonWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={aMindOfMagicAndReasonConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
