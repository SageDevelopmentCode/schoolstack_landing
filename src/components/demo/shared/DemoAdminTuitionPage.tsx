"use client";

import { useMemo } from "react";
import DemoSchoolAdminStoryProvider from "@/components/demo/shared/DemoSchoolAdminStoryProvider";
import TuitionDashboard from "@/components/school-admin/tuition/TuitionDashboard";
import {
  buildDemoAdminBranding,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
} from "@/data/school-demos/demo-portal-shared";
import {
  buildDemoTuitionDashboardData,
  buildDemoTuitionFamilies,
  buildDemoTuitionSetupStatus,
} from "@/data/school-demos/demo-admin-tuition-fixtures";

type DemoAdminTuitionPageProps = {
  initialFamilyId?: string;
};

export default function DemoAdminTuitionPage({
  initialFamilyId = "family-rivera",
}: DemoAdminTuitionPageProps) {
  const branding = useMemo(() => buildDemoAdminBranding(), []);
  const dashboardData = useMemo(() => buildDemoTuitionDashboardData(), []);
  const setupStatus = useMemo(() => buildDemoTuitionSetupStatus(), []);
  const families = useMemo(() => buildDemoTuitionFamilies(), []);

  return (
    <DemoSchoolAdminStoryProvider className="h-full">
      <div className="pointer-events-none h-full select-none">
        <TuitionDashboard
          organizationId={DEMO_PORTAL_ORG_ID}
          branding={branding}
          slug={DEMO_PORTAL_SLUG}
          setupStatus={setupStatus}
          initialDashboardData={dashboardData}
          initialFamilies={families}
          initialFamilyId={initialFamilyId}
          previewMode
          onOpenSetupWizard={() => {}}
        />
      </div>
    </DemoSchoolAdminStoryProvider>
  );
}
