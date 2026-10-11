"use client";

import { useMemo } from "react";
import DemoSchoolAdminStoryProvider from "@/components/demo/shared/DemoSchoolAdminStoryProvider";
import ApplicationFormsPage from "@/components/school-admin/admissions/ApplicationFormsPage";
import type { FlowListSelection } from "@/components/school-admin/admissions/enrollment-flow-selection";
import {
  buildDemoEnrollmentFlowsListData,
  buildDemoPreviewChecklistItemsByTemplateId,
} from "@/data/school-demos/demo-admin-admissions-fixtures";
import {
  buildDemoAdminBranding,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
  resolveDemoSchoolName,
} from "@/data/school-demos/demo-portal-shared";

type DemoAdminEnrollmentFlowsPageProps = {
  initialFlowSelection?: FlowListSelection;
  wrapOutlineLabels?: boolean;
};

export default function DemoAdminEnrollmentFlowsPage({
  initialFlowSelection,
  wrapOutlineLabels = false,
}: DemoAdminEnrollmentFlowsPageProps) {
  const branding = useMemo(() => buildDemoAdminBranding(), []);
  const schoolName = useMemo(() => resolveDemoSchoolName(), []);
  const listData = useMemo(() => buildDemoEnrollmentFlowsListData(), []);
  const previewChecklistItemsByTemplateId = useMemo(
    () => buildDemoPreviewChecklistItemsByTemplateId(),
    [],
  );

  return (
    <DemoSchoolAdminStoryProvider className="h-full">
      <div
        className={`pointer-events-none h-full select-none ${
          wrapOutlineLabels
            ? "[&_.truncate]:overflow-visible [&_.truncate]:whitespace-normal [&_.truncate]:text-clip"
            : ""
        }`}
      >
        <ApplicationFormsPage
          organizationId={DEMO_PORTAL_ORG_ID}
          branding={branding}
          schoolName={schoolName}
          slug={DEMO_PORTAL_SLUG}
          initialListData={listData}
          listDeferred={false}
          previewMode
          initialFlowSelection={initialFlowSelection}
          previewChecklistItemsByTemplateId={previewChecklistItemsByTemplateId}
        />
      </div>
    </DemoSchoolAdminStoryProvider>
  );
}
