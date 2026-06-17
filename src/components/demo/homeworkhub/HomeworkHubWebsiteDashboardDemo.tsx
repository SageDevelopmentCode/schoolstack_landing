"use client";

import type { ComponentProps } from "react";
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { homeworkHubConfig } from "@/data/school-demos/homework-hub";

type Props = Omit<ComponentProps<typeof WebsiteDashboardDemo>, "config">;

export default function HomeworkHubWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={homeworkHubConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
