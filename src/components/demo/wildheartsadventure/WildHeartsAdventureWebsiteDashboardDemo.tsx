// @ts-nocheck
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { wildHeartsAdventureConfig } from "@/data/school-demos/wild-hearts-adventure";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof WebsiteDashboardDemo>;

export default function WildHeartsAdventureWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={wildHeartsAdventureConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
