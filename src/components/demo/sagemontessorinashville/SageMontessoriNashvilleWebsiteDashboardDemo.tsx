// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { sageMontessoriNashvilleConfig } from "@/data/school-demos/sage-montessori-nashville";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function SageMontessoriNashvilleWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={sageMontessoriNashvilleConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
