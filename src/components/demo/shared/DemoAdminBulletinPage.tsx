"use client";

import { useMemo } from "react";
import DemoSchoolAdminStoryProvider from "@/components/demo/shared/DemoSchoolAdminStoryProvider";
import BulletinPage from "@/components/school-admin/bulletin/BulletinPage";
import {
  buildDemoAdminBranding,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
  resolveDemoSchoolName,
} from "@/data/school-demos/demo-portal-shared";
import {
  buildDemoAdminBulletinPosts,
  DEMO_BULLETIN_DRAFT_ID,
} from "@/data/school-demos/demo-communication-fixtures";

export default function DemoAdminBulletinPage() {
  const branding = useMemo(() => buildDemoAdminBranding(), []);
  const posts = useMemo(() => buildDemoAdminBulletinPosts(), []);

  return (
    <DemoSchoolAdminStoryProvider className="flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none flex min-h-0 flex-1 select-none flex-col">
        <BulletinPage
          organizationId={DEMO_PORTAL_ORG_ID}
          branding={branding}
          slug={DEMO_PORTAL_SLUG}
          schoolName={resolveDemoSchoolName()}
          previewMode
          initialPosts={posts}
          initialEditorPostId={DEMO_BULLETIN_DRAFT_ID}
        />
      </div>
    </DemoSchoolAdminStoryProvider>
  );
}
