"use client";

import DemoAdminAdmissionsSubmissionsPage from "@/components/demo/shared/DemoAdminAdmissionsSubmissionsPage";
import DemoAdminDashboardPage from "@/components/demo/shared/DemoAdminDashboardPage";
import DemoAdminScheduleToursPage from "@/components/demo/shared/DemoAdminScheduleToursPage";
import type { DemoSubmissionLead } from "@/components/demo/shared/demo-submissions-mapper";
import DemoAdminEnrollmentChecklistPreviewPage from "@/components/demo/shared/DemoAdminEnrollmentChecklistPreviewPage";
import DemoAdminEnrollmentFlowsPage from "@/components/demo/shared/DemoAdminEnrollmentFlowsPage";
import DemoAdminStudentsPage from "@/components/demo/shared/DemoAdminStudentsPage";
import DemoAdminTuitionPage from "@/components/demo/shared/DemoAdminTuitionPage";
import DemoParentApplyDashboardPage from "@/components/demo/shared/DemoParentApplyDashboardPage";
import DemoParentEnrollmentTab from "@/components/demo/shared/DemoParentEnrollmentTab";
import DemoSchoolParentStoryProvider from "@/components/demo/shared/DemoSchoolParentStoryProvider";
import type { DemoParentModalId } from "@/components/demo/shared/demo-parent-types";
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

function DemoCanvas({
  children,
  minHeight,
  innerPadding = 0,
}: {
  children: React.ReactNode;
  minHeight: number;
  innerPadding?: number;
}) {
  return (
    <div
      style={{
        width: CAROUSEL_DEMO_INNER_WIDTH,
        minHeight,
        height: minHeight,
        boxSizing: "border-box",
        padding: innerPadding,
        overflow: innerPadding > 0 ? "hidden" : undefined,
        background: "#F8F8F3",
      }}
    >
      {children}
    </div>
  );
}

export function MarketingAdminHomeDemoWindow({
  contentHeight = 920,
  innerPadding = 0,
}: {
  contentHeight?: number;
  innerPadding?: number;
}) {
  return (
    <DemoCanvas minHeight={contentHeight} innerPadding={innerPadding}>
      <DemoAdminDashboardPage />
    </DemoCanvas>
  );
}

export function MarketingScheduleToursDemoWindow({ contentHeight = 920 }: { contentHeight?: number }) {
  return (
    <DemoCanvas minHeight={contentHeight}>
      <DemoAdminScheduleToursPage />
    </DemoCanvas>
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
  leads,
  initialSelectedLeadId,
  initialDetailTab,
  contentHeight = 920,
  compactForMarketing = true,
  animateNewSubmission = false,
  newSubmissionLeadId,
  revealNewSubmissionImmediately = false,
  highlightLeadId = null,
}: {
  leads?: DemoSubmissionLead[];
  initialSelectedLeadId?: string;
  initialDetailTab?: "overview" | "application" | "history" | "payments";
  contentHeight?: number;
  /** When true (default for carousel), hides metrics/filters so list + drawer fit the frame. */
  compactForMarketing?: boolean;
  animateNewSubmission?: boolean;
  newSubmissionLeadId?: string;
  revealNewSubmissionImmediately?: boolean;
  highlightLeadId?: string | null;
}) {
  return (
    <DemoCanvas minHeight={contentHeight}>
      <DemoAdminAdmissionsSubmissionsPage
        leads={leads}
        initialSelectedLeadId={initialSelectedLeadId}
        initialDetailTab={initialDetailTab}
        compactForMarketing={compactForMarketing}
        animateNewSubmission={animateNewSubmission}
        newSubmissionLeadId={newSubmissionLeadId}
        revealNewSubmissionImmediately={revealNewSubmissionImmediately}
        highlightLeadId={highlightLeadId}
      />
    </DemoCanvas>
  );
}

export function MarketingParentApplyDemoWindow({
  contentHeight = 920,
  celebrateSubmission = true,
  story = "submitted",
}: {
  contentHeight?: number;
  celebrateSubmission?: boolean;
  story?: "submitted" | "enrolling";
}) {
  return (
    <DemoCanvas minHeight={contentHeight}>
      <DemoParentApplyDashboardPage
        celebrateSubmission={story === "enrolling" ? false : celebrateSubmission}
        story={story}
      />
    </DemoCanvas>
  );
}

export function MarketingEnrollmentFlowsDemoWindow({
  initialFlowSelection,
  wrapOutlineLabels = false,
  contentHeight = 920,
}: {
  initialFlowSelection?: FlowListSelection;
  wrapOutlineLabels?: boolean;
  contentHeight?: number;
}) {
  return (
    <DemoCanvas minHeight={contentHeight}>
      <DemoAdminEnrollmentFlowsPage
        initialFlowSelection={initialFlowSelection}
        wrapOutlineLabels={wrapOutlineLabels}
      />
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
  initialActiveItem,
  contentHeight = 920,
}: {
  initialActiveItem?: DemoParentModalId;
  contentHeight?: number;
}) {
  return (
    <DemoCanvas minHeight={contentHeight}>
      <DemoSchoolParentStoryProvider className="flex h-full min-h-0 flex-col">
        <DemoParentEnrollmentTab initialActiveItem={initialActiveItem} fillHeight />
      </DemoSchoolParentStoryProvider>
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
