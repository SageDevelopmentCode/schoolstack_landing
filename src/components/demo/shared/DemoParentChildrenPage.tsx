"use client";

import { useMemo } from "react";
import DemoSchoolParentStoryProvider from "@/components/demo/shared/DemoSchoolParentStoryProvider";
import ParentChildrenPage from "@/components/school-parent/ParentChildrenPage";
import {
  buildDemoParentBranding,
  DEMO_PARENT_USER_PROFILE,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
  resolveDemoParentSchoolName,
} from "@/data/school-demos/demo-portal-shared";
import {
  buildDemoParentChildProfiles,
  buildDemoParentChildren,
} from "@/data/school-demos/demo-parent-portal-fixtures";

export default function DemoParentChildrenPage() {
  const branding = useMemo(() => buildDemoParentBranding(), []);
  const schoolName = resolveDemoParentSchoolName();
  const familyChildren = useMemo(() => buildDemoParentChildren(), []);
  const childProfiles = useMemo(() => buildDemoParentChildProfiles(), []);

  return (
    <DemoSchoolParentStoryProvider className="flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none flex min-h-0 flex-1 select-none flex-col">
        <ParentChildrenPage
          branding={branding}
          schoolName={schoolName}
          schoolSlug={DEMO_PORTAL_SLUG}
          organizationId={DEMO_PORTAL_ORG_ID}
          familyChildren={familyChildren}
          userProfile={DEMO_PARENT_USER_PROFILE}
          childProfiles={childProfiles}
          previewBasePath="#"
          previewMode
        />
      </div>
    </DemoSchoolParentStoryProvider>
  );
}
