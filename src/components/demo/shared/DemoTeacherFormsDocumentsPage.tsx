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
 *
 * `interactive` (the teacher demo shell): rows open the detail drawer from fixtures and the
 * open form never goes into the page URL. Slides keep the default, a static non-clickable view.
 */
export default function DemoTeacherFormsDocumentsPage({
  openFormId = DEMO_FIELD_TRIP_FORM_ID,
  interactive = false,
}: { openFormId?: string | null; interactive?: boolean } = {}) {
  const forms = useMemo(() => buildDemoTeacherForms(), []);
  const responses = useMemo(() => buildDemoTeacherFormResponses(), []);
  const classrooms = useMemo(() => buildDemoTeacherFormClassrooms(), []);

  return (
    <DemoSchoolTeacherStoryProvider className="flex min-h-0 flex-1 flex-col">
      <div className={`flex min-h-0 flex-1 flex-col ${interactive ? "" : "pointer-events-none select-none"}`}>
        <TeacherFormsDocumentsPage
          organizationId={DEMO_PORTAL_ORG_ID}
          slug={DEMO_PORTAL_SLUG}
          staffMemberId={DEMO_TEACHER_STAFF_ID}
          initialForms={forms}
          initialResponsesByFormId={responses}
          classroomOptions={classrooms}
          initialFormId={openFormId ?? undefined}
          previewMode
          syncUrl={!interactive}
        />
      </div>
    </DemoSchoolTeacherStoryProvider>
  );
}
