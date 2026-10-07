"use client";

import DemoAdminAdmissionsSubmissionsPage from "@/components/demo/shared/DemoAdminAdmissionsSubmissionsPage";
import DemoAdminEnrollmentChecklistPreviewPage from "@/components/demo/shared/DemoAdminEnrollmentChecklistPreviewPage";
import DemoAdminEnrollmentFlowsPage from "@/components/demo/shared/DemoAdminEnrollmentFlowsPage";
import DemoAdminStudentsPage from "@/components/demo/shared/DemoAdminStudentsPage";
import DemoAdminTuitionPage from "@/components/demo/shared/DemoAdminTuitionPage";
import DemoParentEnrollmentTab from "@/components/demo/shared/DemoParentEnrollmentTab";
import type { FlowListSelection } from "@/components/school-admin/admissions/enrollment-flow-selection";
import {
  DEMO_MARKETING_APPLY_FORM_ID,
  DEMO_MARKETING_CHECKLIST_TEMPLATE_ID,
} from "@/data/school-demos/demo-admin-admissions-fixtures";
import type { TuitionInitialOpenAdjust } from "@/components/school-admin/tuition/TuitionDashboard";
import ParentDashboardDemo from "@/components/sections/ParentDashboardDemo";
import type { TuitionDashboardTabId } from "@/components/school-admin/tuition/tuition-dashboard-tabs";
import type { TuitionRateCatalogTabId } from "@/components/school-admin/tuition/tuition-rate-catalog-tabs";
import { CAROUSEL_DEMO_INNER_WIDTH } from "@/components/admin/marketing/carousels/carousel-product-slide";

function DemoCanvas({ children, minHeight }: { children: React.ReactNode; minHeight: number }) {
  return (
    <div
      style={{
        width: CAROUSEL_DEMO_INNER_WIDTH,
        minHeight,
        height: minHeight,
        background: "#F8F8F3",
      }}
    >
      {children}
    </div>
  );
}

export function MarketingStudentsDemoWindow({ contentHeight = 920 }: { contentHeight?: number }) {
  return (
    <DemoCanvas minHeight={contentHeight}>
      <DemoAdminStudentsPage />
    </DemoCanvas>
  );
}

export function MarketingParentDemoWindow({
  tab,
  hideNav = true,
  contentHeight = 700,
}: {
  tab: "home" | "enrollment" | "billing";
  hideNav?: boolean;
  contentHeight?: number;
}) {
  return (
    <DemoCanvas minHeight={contentHeight}>
      <ParentDashboardDemo initialTab={tab} disableTour hideNav={hideNav} />
    </DemoCanvas>
  );
}

export function MarketingAdmissionsSubmissionsDemoWindow({
  initialSelectedLeadId,
  contentHeight = 920,
}: {
  initialSelectedLeadId?: string;
  contentHeight?: number;
}) {
  return (
    <DemoCanvas minHeight={contentHeight}>
      <DemoAdminAdmissionsSubmissionsPage initialSelectedLeadId={initialSelectedLeadId} />
    </DemoCanvas>
  );
}

export function MarketingEnrollmentFlowsDemoWindow({
  initialFlowSelection,
  contentHeight = 920,
}: {
  initialFlowSelection?: FlowListSelection;
  contentHeight?: number;
}) {
  return (
    <DemoCanvas minHeight={contentHeight}>
      <DemoAdminEnrollmentFlowsPage initialFlowSelection={initialFlowSelection} />
    </DemoCanvas>
  );
}

export const MARKETING_DEMO_APPLY_FLOW_SELECTION: FlowListSelection = {
  kind: "apply",
  id: DEMO_MARKETING_APPLY_FORM_ID,
};

export const MARKETING_DEMO_CHECKLIST_FLOW_SELECTION: FlowListSelection = {
  kind: "checklist",
  id: DEMO_MARKETING_CHECKLIST_TEMPLATE_ID,
};

export function MarketingEnrollmentChecklistPreviewDemoWindow({
  contentHeight = 920,
}: {
  contentHeight?: number;
}) {
  return (
    <DemoCanvas minHeight={contentHeight}>
      <DemoAdminEnrollmentChecklistPreviewPage />
    </DemoCanvas>
  );
}

export function MarketingParentEnrollmentDemoWindow({
  contentHeight = 920,
}: {
  contentHeight?: number;
}) {
  return (
    <DemoCanvas minHeight={contentHeight}>
      <DemoParentEnrollmentTab />
    </DemoCanvas>
  );
}

export function MarketingTuitionDemoWindow({
  initialDashboardTab = "catalog",
  initialRateCatalogTab,
  initialFamilyId,
  initialOpenAdjust,
  contentHeight = 920,
}: {
  initialDashboardTab?: TuitionDashboardTabId;
  initialRateCatalogTab?: TuitionRateCatalogTabId;
  initialFamilyId?: string;
  initialOpenAdjust?: TuitionInitialOpenAdjust;
  contentHeight?: number;
}) {
  return (
    <DemoCanvas minHeight={contentHeight}>
      <DemoAdminTuitionPage
        initialDashboardTab={initialDashboardTab}
        initialRateCatalogTab={initialRateCatalogTab}
        initialFamilyId={initialFamilyId}
        initialOpenAdjust={initialOpenAdjust}
      />
    </DemoCanvas>
  );
}
