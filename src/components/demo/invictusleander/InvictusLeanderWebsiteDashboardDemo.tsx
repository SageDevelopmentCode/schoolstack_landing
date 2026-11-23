// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { invictusLeanderConfig } from "@/data/school-demos/invictus-leander";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function InvictusLeanderWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={invictusLeanderConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
