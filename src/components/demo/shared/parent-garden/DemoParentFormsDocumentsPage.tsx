"use client";

import { useMemo } from "react";
import DemoSchoolParentStoryProvider from "@/components/demo/shared/DemoSchoolParentStoryProvider";
import ParentFormsDocumentsPage from "@/components/school-parent/forms-documents/ParentFormsDocumentsPage";
import { DEMO_PORTAL_ORG_ID, DEMO_PORTAL_SLUG } from "@/data/school-demos/demo-portal-shared";
import { buildDemoParentFormsBundle } from "@/data/school-demos/demo-parent-forms-fixtures";

/*
 * Parent demo › Forms & Documents: the live Garden page, read-only, fed by
 * fixtures. Forms open in the Garden dialog from the list item (no fetch), and
 * `syncFormToUrl={false}` keeps the marketing page URL untouched.
 */
export default function DemoParentFormsDocumentsPage() {
  const bundle = useMemo(() => buildDemoParentFormsBundle(), []);
  return (
    <DemoSchoolParentStoryProvider className="flex min-h-0 flex-1 flex-col">
      <ParentFormsDocumentsPage
        organizationId={DEMO_PORTAL_ORG_ID}
        slug={DEMO_PORTAL_SLUG}
        initialBundle={bundle}
        readOnly
        syncFormToUrl={false}
      />
    </DemoSchoolParentStoryProvider>
  );
}
