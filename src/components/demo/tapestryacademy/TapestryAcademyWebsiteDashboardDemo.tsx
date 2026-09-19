"use client";

import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { tapestryAcademyConfig } from "@/data/school-demos/tapestry-academy";

export default function TapestryAcademyWebsiteDashboardDemo() {
  return (
    <WebsiteDashboardDemo config={tapestryAcademyConfig} disableTour={true} />
  );
}
