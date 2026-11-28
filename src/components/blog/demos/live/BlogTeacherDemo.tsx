"use client";

import TeacherDashboardDemo from "@/components/sections/TeacherDashboardDemo";
import DemoTeacherHoursPage from "@/components/demo/shared/DemoTeacherHoursPage";
import DemoTeacherFormsDocumentsPage from "@/components/demo/shared/DemoTeacherFormsDocumentsPage";
import { applyTeacherDemoRuntime } from "@/components/demo/shared/teacher-demo-runtime";
import { luffLearningTeacherDemoConfig } from "@/data/school-demos/luff-learning-teacher-demo";
import BlogGardenCanvas from "../BlogGardenCanvas";

export type BlogTeacherDemoView = "attendance" | "hours" | "forms";

export default function BlogTeacherDemo({ view, contentHeight }: { view: BlogTeacherDemoView; contentHeight: number }) {
  applyTeacherDemoRuntime(luffLearningTeacherDemoConfig);
  return (
    <BlogGardenCanvas contentHeight={contentHeight}>
      {view === "attendance" ? (
        <TeacherDashboardDemo config={luffLearningTeacherDemoConfig} initialTab="attendance" disableTour hideNav />
      ) : view === "hours" ? (
        <div style={{ display: "flex", flex: 1, minHeight: 0, flexDirection: "column", overflow: "hidden" }}>
          <DemoTeacherHoursPage />
        </div>
      ) : (
        <DemoTeacherFormsDocumentsPage openFormId={null} />
      )}
    </BlogGardenCanvas>
  );
}
