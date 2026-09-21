"use client";

import { useMemo } from "react";
import DemoSchoolAdminStoryProvider from "@/components/demo/shared/DemoSchoolAdminStoryProvider";
import StudentsPage from "@/components/school-admin/students/StudentsPage";
import {
  buildDemoAdminBranding,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
} from "@/data/school-demos/demo-portal-shared";
import {
  buildDemoStudentsPageMeta,
  buildDemoStudentsTableData,
} from "@/data/school-demos/demo-admin-myschool-fixtures";

export default function DemoAdminStudentsPage() {
  const meta = useMemo(() => buildDemoStudentsPageMeta(), []);
  const tableData = useMemo(() => buildDemoStudentsTableData(), []);
  const branding = useMemo(() => buildDemoAdminBranding(), []);

  return (
    <DemoSchoolAdminStoryProvider className="h-full">
      <div className="pointer-events-none h-full select-none">
        <StudentsPage
          organizationId={DEMO_PORTAL_ORG_ID}
          branding={branding}
          slug={DEMO_PORTAL_SLUG}
          initialMeta={meta}
          initialTableData={tableData}
          previewMode
        />
      </div>
    </DemoSchoolAdminStoryProvider>
  );
}
