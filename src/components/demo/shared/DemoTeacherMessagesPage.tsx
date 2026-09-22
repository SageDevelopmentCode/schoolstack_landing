"use client";

import { useMemo } from "react";
import DemoSchoolTeacherStoryProvider from "@/components/demo/shared/DemoSchoolTeacherStoryProvider";
import TeacherMessagesPage from "@/components/school-teacher/TeacherMessagesPage";
import {
  buildDemoTeacherBranding,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
  DEMO_TEACHER_STAFF_ID,
  resolveDemoSchoolName,
} from "@/data/school-demos/demo-portal-shared";
import {
  buildDemoTeacherMessageThreadDetails,
  buildDemoTeacherMessagesInbox,
} from "@/data/school-demos/demo-teacher-portal-fixtures";

export default function DemoTeacherMessagesPage() {
  const branding = useMemo(() => buildDemoTeacherBranding(), []);
  const inbox = useMemo(() => buildDemoTeacherMessagesInbox(), []);
  const previewThreadMessages = useMemo(
    () => buildDemoTeacherMessageThreadDetails(),
    [],
  );

  return (
    <DemoSchoolTeacherStoryProvider className="flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none flex min-h-0 flex-1 select-none flex-col">
        <TeacherMessagesPage
          organizationId={DEMO_PORTAL_ORG_ID}
          organizationSlug={DEMO_PORTAL_SLUG}
          schoolName={resolveDemoSchoolName()}
          branding={branding}
          staffMemberId={DEMO_TEACHER_STAFF_ID}
          initialInbox={inbox}
          previewThreadMessages={previewThreadMessages}
          previewMode
        />
      </div>
    </DemoSchoolTeacherStoryProvider>
  );
}
