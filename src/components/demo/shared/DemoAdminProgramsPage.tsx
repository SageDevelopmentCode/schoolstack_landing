"use client";

import { useMemo } from "react";
import DemoSchoolAdminStoryProvider from "@/components/demo/shared/DemoSchoolAdminStoryProvider";
import ProgramsPage from "@/components/school-admin/admissions/ProgramsPage";
import {
  buildDemoAdminBranding,
  DEMO_ADMIN_FEATURES,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
} from "@/data/school-demos/demo-portal-shared";
import {
  buildDemoPrograms,
  DEMO_PROGRAM_PARENT_PORTAL_CONFIG,
} from "@/data/school-demos/demo-admin-programs-fixtures";

export default function DemoAdminProgramsPage() {
  const programs = useMemo(() => buildDemoPrograms(), []);
  const branding = useMemo(() => buildDemoAdminBranding(), []);

  return (
    <DemoSchoolAdminStoryProvider className="h-full">
      <div className="pointer-events-none h-full select-none">
        <ProgramsPage
          organizationId={DEMO_PORTAL_ORG_ID}
          branding={branding}
          orgFeatures={DEMO_ADMIN_FEATURES}
          slug={DEMO_PORTAL_SLUG}
          programParentPortalConfig={DEMO_PROGRAM_PARENT_PORTAL_CONFIG}
          initialPrograms={programs}
          initialSelectedProgramId="program-primary"
          previewMode
        />
      </div>
    </DemoSchoolAdminStoryProvider>
  );
}
