"use client";

import { useMemo } from "react";
import DemoSchoolTeacherStoryProvider from "@/components/demo/shared/DemoSchoolTeacherStoryProvider";
import TeacherCalendarPage from "@/components/school-teacher/TeacherCalendarPage";
import {
  buildDemoTeacherBranding,
  DEMO_PORTAL_ORG_ID,
} from "@/data/school-demos/demo-portal-shared";
import { buildDemoTeacherCalendarData } from "@/data/school-demos/demo-teacher-portal-fixtures";

export default function DemoTeacherCalendarPage() {
  const branding = useMemo(() => buildDemoTeacherBranding(), []);
  const calendarData = useMemo(() => buildDemoTeacherCalendarData(), []);

  return (
    <DemoSchoolTeacherStoryProvider className="flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none flex min-h-0 flex-1 select-none flex-col">
        <TeacherCalendarPage
          branding={branding}
          initialData={calendarData}
          organizationId={DEMO_PORTAL_ORG_ID}
          previewMode
        />
      </div>
    </DemoSchoolTeacherStoryProvider>
  );
}
