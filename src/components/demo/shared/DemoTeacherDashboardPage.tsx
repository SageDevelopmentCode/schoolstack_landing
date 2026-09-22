"use client";

import { useMemo } from "react";
import DemoSchoolTeacherStoryProvider from "@/components/demo/shared/DemoSchoolTeacherStoryProvider";
import TeacherDashboardPage from "@/components/school-teacher/TeacherDashboardPage";
import {
  buildDemoTeacherBranding,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
  DEMO_TEACHER_FEATURES,
  DEMO_TEACHER_USER_PROFILE,
  resolveDemoSchoolName,
} from "@/data/school-demos/demo-portal-shared";
import { buildDemoTeacherDashboardSummary } from "@/data/school-demos/demo-teacher-portal-fixtures";

export default function DemoTeacherDashboardPage() {
  const branding = useMemo(() => buildDemoTeacherBranding(), []);
  const schoolName = resolveDemoSchoolName();
  const summary = useMemo(
    () => buildDemoTeacherDashboardSummary(schoolName),
    [schoolName],
  );

  return (
    <DemoSchoolTeacherStoryProvider className="flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none flex min-h-0 flex-1 select-none flex-col">
        <TeacherDashboardPage
          organizationId={DEMO_PORTAL_ORG_ID}
          slug={DEMO_PORTAL_SLUG}
          schoolName={schoolName}
          branding={branding}
          features={DEMO_TEACHER_FEATURES}
          userProfile={DEMO_TEACHER_USER_PROFILE}
          roleTitle="Lead Teacher"
          portalRole="teacher"
          initialSummary={summary}
          previewMode
          teacherBasePath="#"
        />
      </div>
    </DemoSchoolTeacherStoryProvider>
  );
}
