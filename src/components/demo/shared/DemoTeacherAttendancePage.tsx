"use client";

import { useMemo } from "react";
import DemoSchoolTeacherStoryProvider from "@/components/demo/shared/DemoSchoolTeacherStoryProvider";
import TeacherAttendancePage from "@/components/school-teacher/TeacherAttendancePage";
import {
  buildDemoTeacherBranding,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
} from "@/data/school-demos/demo-portal-shared";
import { buildDemoTeacherAttendanceRoster } from "@/data/school-demos/demo-teacher-portal-fixtures";
import { useShowcaseDesktopEmbed } from "@/components/demo/shared/showcase-desktop-embed";
import { buildShowcaseTeacherAttendanceRoster } from "@/data/school-demos/demo-showcase-fixtures";

export default function DemoTeacherAttendancePage() {
  const showcaseEmbed = useShowcaseDesktopEmbed();
  const branding = useMemo(() => buildDemoTeacherBranding(), []);
  const initialRoster = useMemo(
    () =>
      showcaseEmbed
        ? buildShowcaseTeacherAttendanceRoster()
        : buildDemoTeacherAttendanceRoster(),
    [showcaseEmbed],
  );

  return (
    <DemoSchoolTeacherStoryProvider className="flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none flex min-h-0 flex-1 select-none flex-col">
        <TeacherAttendancePage
          organizationId={DEMO_PORTAL_ORG_ID}
          branding={branding}
          slug={DEMO_PORTAL_SLUG}
          previewMode
          initialRoster={initialRoster}
        />
      </div>
    </DemoSchoolTeacherStoryProvider>
  );
}
