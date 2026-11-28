"use client";

import ParentDashboardDemo from "@/components/sections/ParentDashboardDemo";
import DemoParentCalendarPage from "@/components/demo/shared/DemoParentCalendarPage";
import { applyParentDemoRuntime } from "@/components/demo/shared/parent-demo-runtime";
import { luffLearningParentDemoConfig } from "@/data/school-demos/luff-learning-parent-demo";
import BlogGardenCanvas from "../BlogGardenCanvas";

export type BlogParentDemoView = "home" | "billing" | "messages" | "feed" | "forms" | "calendar";

export default function BlogParentDemo({ view, contentHeight }: { view: BlogParentDemoView; contentHeight: number }) {
  applyParentDemoRuntime(luffLearningParentDemoConfig);
  return (
    <BlogGardenCanvas contentHeight={contentHeight}>
      {view === "calendar" ? (
        // Demo events sit around spring 2026 (same anchor as the studio's calendar window).
        <DemoParentCalendarPage initialView="month" previewAnchorDate="2026-05-01" previewAgendaAsOf="2026-04-01" />
      ) : (
        <ParentDashboardDemo config={luffLearningParentDemoConfig} initialTab={view} disableTour hideNav />
      )}
    </BlogGardenCanvas>
  );
}
