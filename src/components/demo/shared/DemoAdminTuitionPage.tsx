"use client";

import { useMemo } from "react";
import DemoSchoolAdminStoryProvider from "@/components/demo/shared/DemoSchoolAdminStoryProvider";
import TuitionDashboard, {
  type TuitionInitialOpenAdjust,
} from "@/components/school-admin/tuition/TuitionDashboard";
import { buildDemoTuitionAdjustPreviewSnapshot } from "@/lib/tuition/tuition-adjust-preview";
import type { TuitionDashboardTabId } from "@/components/school-admin/tuition/tuition-dashboard-tabs";
import type { TuitionRateCatalogTabId } from "@/components/school-admin/tuition/tuition-rate-catalog-tabs";
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
  initialDashboardTab?: TuitionDashboardTabId;
  initialRateCatalogTab?: TuitionRateCatalogTabId;
  initialOpenAdjust?: TuitionInitialOpenAdjust;
};

export default function DemoAdminTuitionPage({
  initialFamilyId = "family-rivera",
  initialDashboardTab,
  initialRateCatalogTab,
  initialOpenAdjust,
}: DemoAdminTuitionPageProps) {
  const branding = useMemo(() => buildDemoAdminBranding(), []);
  const dashboardData = useMemo(() => buildDemoTuitionDashboardData(), []);
  const setupStatus = useMemo(() => buildDemoTuitionSetupStatus(), []);
  const families = useMemo(() => buildDemoTuitionFamilies(), []);
  const adjustPreviewSnapshot = useMemo(
    () => (initialOpenAdjust ? buildDemoTuitionAdjustPreviewSnapshot() : undefined),
    [initialOpenAdjust],
  );

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
          initialDashboardTab={initialDashboardTab}
          initialRateCatalogTab={initialRateCatalogTab}
          initialOpenAdjust={initialOpenAdjust}
          adjustPreviewSnapshot={adjustPreviewSnapshot}
          previewMode
        />
      </div>
    </DemoSchoolAdminStoryProvider>
  );
}
