"use client";

import { useMemo } from "react";
import DemoSchoolParentStoryProvider from "@/components/demo/shared/DemoSchoolParentStoryProvider";
import ParentBillingPageShell from "@/components/school-parent/billing/ParentBillingPageShell";
import {
  buildDemoParentBranding,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
} from "@/data/school-demos/demo-portal-shared";
import {
  buildDemoParentBillingInitialData,
  buildDemoParentBillingPageMeta,
  DEMO_PARENT_FAMILY_ID,
} from "@/data/school-demos/demo-parent-portal-fixtures";

export default function DemoParentBillingPage() {
  const branding = useMemo(() => buildDemoParentBranding(), []);
  const initialPreviewData = useMemo(
    () => buildDemoParentBillingInitialData(DEMO_PORTAL_ORG_ID),
    [],
  );
  const initialPreviewMeta = useMemo(() => buildDemoParentBillingPageMeta(), []);

  return (
    <DemoSchoolParentStoryProvider className="flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none flex min-h-0 flex-1 select-none flex-col">
        <ParentBillingPageShell
          organizationId={DEMO_PORTAL_ORG_ID}
          familyId={DEMO_PARENT_FAMILY_ID}
          branding={branding}
          slug={DEMO_PORTAL_SLUG}
          previewMode
          initialPreviewData={initialPreviewData}
          initialPreviewMeta={initialPreviewMeta}
        />
      </div>
    </DemoSchoolParentStoryProvider>
  );
}
