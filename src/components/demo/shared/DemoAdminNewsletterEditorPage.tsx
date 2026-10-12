"use client";

import { useMemo, useRef } from "react";
import NewsletterEditorDemoCanvas, {
  type NewsletterEditorDemoVariant,
} from "@/components/demo/marketing/NewsletterEditorDemoCanvas";
import SchoolAdminBaseline from "@/components/school-admin/SchoolAdminBaseline";
import {
  DEMO_ADMIN_FEATURES,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
} from "@/data/school-demos/demo-portal-shared";
import {
  buildDemoMudKitchenAdminBranding,
  DEMO_MUDKITCHEN_SCHOOL_NAME,
} from "@/data/school-demos/demo-mudkitchen-admin";
import type { SchoolAdminUserProfile } from "@/lib/school-admin/access";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";

const DEMO_ADMIN_USER: SchoolAdminUserProfile = {
  displayName: "Morgan Ellis",
  email: "demo@mudkitchen.app",
};

type DemoAdminNewsletterEditorPageProps = {
  variant?: NewsletterEditorDemoVariant;
};

export default function DemoAdminNewsletterEditorPage({
  variant = "classUpdates",
}: DemoAdminNewsletterEditorPageProps) {
  const branding = useMemo(() => buildDemoMudKitchenAdminBranding(), []);
  const previewPathname = useMemo(
    () => schoolAdminPath(DEMO_PORTAL_SLUG, "my_school", "newsletters"),
    [],
  );
  const interactive = variant === "photoGallery";
  const embedRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={embedRef}
      className={`showcase-demo-embed relative mx-auto h-[920px] w-[1100px] max-w-full overflow-hidden ${
        interactive ? "pointer-events-auto" : "pointer-events-none select-none"
      }`}
    >
      <SchoolAdminBaseline
        slug={DEMO_PORTAL_SLUG}
        organizationId={DEMO_PORTAL_ORG_ID}
        schoolName={DEMO_MUDKITCHEN_SCHOOL_NAME}
        branding={branding}
        features={DEMO_ADMIN_FEATURES}
        userProfile={DEMO_ADMIN_USER}
        previewMode
        previewPathname={previewPathname}
        initialSidebarExpanded={true}
        fillParentHeight
        portalOptions={[]}
        initialMessagesUnreadCount={0}
        initialActivityUnreadCount={0}
      >
        <NewsletterEditorDemoCanvas variant={variant} modalPortalRef={embedRef} />
      </SchoolAdminBaseline>
    </div>
  );
}
