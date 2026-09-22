"use client";

import { useMemo } from "react";
import DemoSchoolAdminStoryProvider from "@/components/demo/shared/DemoSchoolAdminStoryProvider";
import ClassroomsPage from "@/components/school-admin/classrooms/ClassroomsPage";
import {
  buildDemoAdminBranding,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
} from "@/data/school-demos/demo-portal-shared";
import {
  buildDemoClassroomPrograms,
  buildDemoClassrooms,
  buildDemoStaffMembers,
} from "@/data/school-demos/demo-admin-myschool-fixtures";

export default function DemoAdminClassroomsPage() {
  const classrooms = useMemo(() => buildDemoClassrooms(), []);
  const programs = useMemo(() => buildDemoClassroomPrograms(), []);
  const staff = useMemo(() => buildDemoStaffMembers(), []);
  const branding = useMemo(() => buildDemoAdminBranding(), []);

  return (
    <DemoSchoolAdminStoryProvider className="h-full">
      <div className="pointer-events-none h-full select-none">
        <ClassroomsPage
          organizationId={DEMO_PORTAL_ORG_ID}
          branding={branding}
          slug={DEMO_PORTAL_SLUG}
          initialClassrooms={classrooms}
          initialPrograms={programs}
          initialStaff={staff}
          initialSelectedClassroomId="classroom-oak"
          previewMode
        />
      </div>
    </DemoSchoolAdminStoryProvider>
  );
}
