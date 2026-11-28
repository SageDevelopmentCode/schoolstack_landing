"use client";

import DemoParentEnrollmentChecklist from "@/components/demo/shared/DemoParentEnrollmentChecklist";
import DemoParentApplyDashboardPage from "@/components/demo/shared/DemoParentApplyDashboardPage";
import { applyParentDemoRuntime } from "@/components/demo/shared/parent-demo-runtime";
import { luffLearningParentDemoConfig } from "@/data/school-demos/luff-learning-parent-demo";
import BlogGardenCanvas from "../BlogGardenCanvas";

export type BlogEnrollmentDemoView = "checklist" | "apply-submitted";

export default function BlogEnrollmentDemo({ view, contentHeight }: { view: BlogEnrollmentDemoView; contentHeight: number }) {
  applyParentDemoRuntime(luffLearningParentDemoConfig);
  return (
    <BlogGardenCanvas contentHeight={contentHeight}>
      {view === "checklist" ? (
        <DemoParentEnrollmentChecklist config={luffLearningParentDemoConfig} />
      ) : (
        <DemoParentApplyDashboardPage story="submitted" celebrateSubmission={false} suppressHelpFab />
      )}
    </BlogGardenCanvas>
  );
}
