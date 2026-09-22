"use client";

import { useMemo } from "react";
import DemoSchoolTeacherStoryProvider from "@/components/demo/shared/DemoSchoolTeacherStoryProvider";
import TeacherMyStudentsPage from "@/components/school-teacher/TeacherMyStudentsPage";
import {
  buildDemoTeacherBranding,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
  DEMO_TEACHER_STAFF_ID,
} from "@/data/school-demos/demo-portal-shared";
import {
  buildDemoTeacherClassrooms,
  buildDemoTeacherStudents,
} from "@/data/school-demos/demo-teacher-portal-fixtures";

type DemoTeacherMyStudentsPageProps = {
  initialSelectedStudentId?: string;
};

export default function DemoTeacherMyStudentsPage({
  initialSelectedStudentId,
}: DemoTeacherMyStudentsPageProps = {}) {
  const branding = useMemo(() => buildDemoTeacherBranding(), []);
  const students = useMemo(() => buildDemoTeacherStudents(), []);
  const classrooms = useMemo(() => buildDemoTeacherClassrooms(), []);

  return (
    <DemoSchoolTeacherStoryProvider className="flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none flex min-h-0 flex-1 select-none flex-col">
        <TeacherMyStudentsPage
          organizationId={DEMO_PORTAL_ORG_ID}
          branding={branding}
          slug={DEMO_PORTAL_SLUG}
          staffMemberId={DEMO_TEACHER_STAFF_ID}
          initialStudents={students}
          initialClassrooms={classrooms}
          previewMode
          initialSelectedStudentId={initialSelectedStudentId}
        />
      </div>
    </DemoSchoolTeacherStoryProvider>
  );
}
