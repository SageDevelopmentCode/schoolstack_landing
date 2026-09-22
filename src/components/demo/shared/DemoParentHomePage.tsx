"use client";

import { useMemo } from "react";
import DemoSchoolParentStoryProvider from "@/components/demo/shared/DemoSchoolParentStoryProvider";
import ParentHomePage from "@/components/school-parent/ParentHomePage";
import { buildParentQuickActions } from "@/lib/organization-settings/parent-home";
import {
  buildDemoParentBranding,
  DEMO_PARENT_FEATURES,
  DEMO_PARENT_USER_PROFILE,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
  resolveDemoParentSchoolName,
} from "@/data/school-demos/demo-portal-shared";
import {
  buildDemoParentChildren,
  buildDemoParentEvents,
  DEMO_PARENT_FAMILY_ID,
} from "@/data/school-demos/demo-parent-portal-fixtures";

export default function DemoParentHomePage() {
  const branding = useMemo(() => buildDemoParentBranding(), []);
  const schoolName = resolveDemoParentSchoolName();
  const familyChildren = useMemo(() => buildDemoParentChildren(), []);
  const upcomingEvents = useMemo(
    () => buildDemoParentEvents(DEMO_PORTAL_ORG_ID),
    [],
  );
  const quickActions = useMemo(
    () => buildParentQuickActions(DEMO_PORTAL_SLUG, DEMO_PARENT_FEATURES, "#"),
    [],
  );

  return (
    <DemoSchoolParentStoryProvider className="flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none flex min-h-0 flex-1 select-none flex-col">
        <ParentHomePage
          branding={branding}
          schoolSlug={DEMO_PORTAL_SLUG}
          organizationId={DEMO_PORTAL_ORG_ID}
          familyId={DEMO_PARENT_FAMILY_ID}
          userProfile={DEMO_PARENT_USER_PROFILE}
          familyChildren={familyChildren}
          quickActions={quickActions}
          upcomingEvents={upcomingEvents}
          onboardingItems={[]}
          previewMode
          previewBasePath="#"
          schoolName={schoolName}
          features={DEMO_PARENT_FEATURES}
          parentNavBasePath="#"
          bulletinEnabled={false}
        />
      </div>
    </DemoSchoolParentStoryProvider>
  );
}
