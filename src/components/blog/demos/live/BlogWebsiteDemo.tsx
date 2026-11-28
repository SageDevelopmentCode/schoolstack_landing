"use client";

import WebsiteDashboardDemo from "@/components/sections/WebsiteDashboardDemo";
import { defaultWebsiteDemoConfig } from "@/data/school-demos/default";
import BlogGardenCanvas from "../BlogGardenCanvas";

export default function BlogWebsiteDemo({ toForm, contentHeight }: { toForm: boolean; contentHeight: number }) {
  return (
    <BlogGardenCanvas contentHeight={contentHeight}>
      <WebsiteDashboardDemo config={defaultWebsiteDemoConfig} disableTour scrollRequest={toForm ? { target: "form", nonce: 1 } : null} />
    </BlogGardenCanvas>
  );
}
