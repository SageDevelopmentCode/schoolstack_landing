"use client";

import { useMemo } from "react";
import DemoSchoolTeacherStoryProvider from "@/components/demo/shared/DemoSchoolTeacherStoryProvider";
import TeacherFormsDocumentsPage from "@/components/school-teacher/forms-documents/TeacherFormsDocumentsPage";
import {
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
  DEMO_TEACHER_STAFF_ID,
} from "@/data/school-demos/demo-portal-shared";
import {
  buildDemoTeacherFormClassrooms,
  buildDemoTeacherFormResponses,
  buildDemoTeacherForms,
  DEMO_FIELD_TRIP_FORM_ID,
} from "@/data/school-demos/demo-communication-fixtures";

/**
 * `openFormId={null}` starts on the list. Marketing slides need that: the form detail panel
 * portals to document.body, so it would escape a slide frame.
 */
export default function DemoTeacherFormsDocumentsPage({ openFormId = DEMO_FIELD_TRIP_FORM_ID }: { openFormId?: string | null } = {}) {
  const forms = useMemo(() => buildDemoTeacherForms(), []);
  const responses = useMemo(() => buildDemoTeacherFormResponses(), []);
  const classrooms = useMemo(() => buildDemoTeacherFormClassrooms(), []);

  return (
    <DemoSchoolTeacherStoryProvider className="flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none flex min-h-0 flex-1 select-none flex-col">
        <TeacherFormsDocumentsPage
          organizationId={DEMO_PORTAL_ORG_ID}
          slug={DEMO_PORTAL_SLUG}
          staffMemberId={DEMO_TEACHER_STAFF_ID}
          initialForms={forms}
          initialResponsesByFormId={responses}
          classroomOptions={classrooms}
          initialFormId={openFormId ?? undefined}
          previewMode
        />
      </div>
    </DemoSchoolTeacherStoryProvider>
  );
}
