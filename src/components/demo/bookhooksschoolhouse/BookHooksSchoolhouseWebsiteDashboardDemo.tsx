// @ts-nocheck
"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { bookHooksSchoolhouseConfig } from "@/data/school-demos/book-hooks-schoolhouse";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function BookHooksSchoolhouseWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={bookHooksSchoolhouseConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
