"use client";

import DemoAdminGardenDashboard from "@/components/demo/shared/DemoAdminGardenDashboard";
import DemoAdminGardenAdmissions from "@/components/demo/shared/DemoAdminGardenAdmissions";
import DemoAdminGardenMarketing from "@/components/demo/shared/marketing-garden/DemoAdminGardenMarketing";
import { applyAdminDemoRuntime } from "@/components/demo/shared/admin-demo-runtime";
import { luffLearningAdminDemoConfig } from "@/data/school-demos/luff-learning-admin-demo";
import BlogGardenCanvas from "../BlogGardenCanvas";

export type BlogAdminDemoView = "dashboard" | "admissions" | "marketing";

export default function BlogAdminDemo({ view, contentHeight }: { view: BlogAdminDemoView; contentHeight: number }) {
  applyAdminDemoRuntime(luffLearningAdminDemoConfig);
  return (
    <BlogGardenCanvas contentHeight={contentHeight}>
      {view === "dashboard" ? (
        <DemoAdminGardenDashboard config={luffLearningAdminDemoConfig} />
      ) : view === "admissions" ? (
        <DemoAdminGardenAdmissions config={luffLearningAdminDemoConfig} />
      ) : (
        <DemoAdminGardenMarketing config={luffLearningAdminDemoConfig} />
      )}
    </BlogGardenCanvas>
  );
}
