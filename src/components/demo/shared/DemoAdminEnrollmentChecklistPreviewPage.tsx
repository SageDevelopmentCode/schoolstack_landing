"use client";

import { useMemo } from "react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { ApplyPortalPageLayout } from "@/components/admissions/ApplyPortalPageLayout";
import { EnrollmentChecklistPreviewContent } from "@/components/school-admin/admissions/EnrollmentChecklistPreviewContent";
import DemoSchoolParentStoryProvider from "@/components/demo/shared/DemoSchoolParentStoryProvider";
import {
  DEMO_ENROLLMENT_CHECKLIST_PREVIEW_ITEMS,
  DEMO_MARKETING_CHECKLIST_POLICIES_ITEM_ID,
  DEMO_MARKETING_CHECKLIST_PREVIEW_SIGNER_NAME,
} from "@/data/school-demos/demo-admin-admissions-fixtures";
import {
  buildDemoParentBranding,
  DEMO_PORTAL_SLUG,
  resolveDemoSchoolName,
} from "@/data/school-demos/demo-portal-shared";
import { PARENT_DEMO_STORY_THEME } from "@/components/demo/shared/parent-demo-runtime";

export default function DemoAdminEnrollmentChecklistPreviewPage() {
  const branding = useMemo(() => buildDemoParentBranding(), []);
  const schoolName = useMemo(() => resolveDemoSchoolName(), []);
  const checklist = useMemo(
    () =>
      DEMO_ENROLLMENT_CHECKLIST_PREVIEW_ITEMS.length > 0
        ? DEMO_ENROLLMENT_CHECKLIST_PREVIEW_ITEMS
        : [],
    [],
  );
  const title = "Primary Program enrollment checklist";

  return (
    <DemoSchoolParentStoryProvider className="flex h-full min-h-0 flex-col">
      <ApplyPortalPageLayout>
        <div
          className="pointer-events-none flex h-full min-h-0 select-none flex-col overflow-hidden"
          style={{ backgroundColor: branding.colors.bg }}
        >
          <EnrollmentChecklistPreviewContent
            branding={branding}
            schoolName={schoolName}
            slug={DEMO_PORTAL_SLUG}
            enrollmentPath="enrollment"
            title={title}
            items={checklist}
            allItems={checklist}
            initialItemId={DEMO_MARKETING_CHECKLIST_POLICIES_ITEM_ID}
            initialPreviewSignerName={DEMO_MARKETING_CHECKLIST_PREVIEW_SIGNER_NAME}
            headerAction={
              <AdminButton theme={PARENT_DEMO_STORY_THEME} variant="outline" size="compact" type="button">
                Close preview
              </AdminButton>
            }
          />
        </div>
      </ApplyPortalPageLayout>
    </DemoSchoolParentStoryProvider>
  );
}
