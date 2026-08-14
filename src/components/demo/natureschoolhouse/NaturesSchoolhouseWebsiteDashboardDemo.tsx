// @ts-nocheck
import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { naturesSchoolhouseConfig } from "@/data/school-demos/natures-schoolhouse";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof WebsiteDashboardDemo>;

export default function NaturesSchoolhouseWebsiteDashboardDemo({
  disableTour = true,
  ...props
}: Props) {
  return (
    <WebsiteDashboardDemo
      config={naturesSchoolhouseConfig}
      disableTour={disableTour}
      {...props}
    />
  );
}
