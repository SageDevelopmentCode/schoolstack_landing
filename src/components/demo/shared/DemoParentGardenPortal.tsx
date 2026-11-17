"use client";

import { useCallback, useMemo, useState } from "react";
import SchoolParentBaseline from "@/components/school-parent/SchoolParentBaseline";
import ParentBillingPageShell from "@/components/school-parent/billing/ParentBillingPageShell";
import ParentHomePage from "@/components/school-parent/ParentHomePage";
import { applyParentDemoRuntime } from "@/components/demo/shared/parent-demo-runtime";
import type { DemoParentChildId } from "@/components/demo/shared/demo-parent-types";
import type { SchoolParentDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import {
  buildDemoParentBillingInitialData,
  buildDemoParentBillingPageMeta,
  buildDemoParentChildren,
  buildDemoParentEvents,
  DEMO_PARENT_FAMILY_ID,
} from "@/data/school-demos/demo-parent-portal-fixtures";
import {
  buildDemoParentBranding,
  DEMO_PARENT_FEATURES,
  DEMO_PARENT_USER_PROFILE,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
  resolveDemoParentSchoolName,
} from "@/data/school-demos/demo-portal-shared";
import { buildParentQuickActions } from "@/lib/organization-settings/parent-home";
import {
  isParentBillingPath,
  isParentHomePath,
} from "@/lib/organization-settings/parent-routes";

export type DemoParentGardenPortalTab = "home" | "billing";

/** Virtual parent portal base path; the embedded header never touches the real URL. */
const DEMO_PARENT_BASE_PATH = `/school/${DEMO_PORTAL_SLUG}/parent`;
const DEMO_TAB_PATHS: Record<DemoParentGardenPortalTab, string> = {
  home: `${DEMO_PARENT_BASE_PATH}/portal`,
  billing: `${DEMO_PARENT_BASE_PATH}/billing`,
};

/**
 * Only the nav items the demo has (Home, Billing) take clicks; the logo link,
 * other tabs, More, the bell and the account menu stay inert, so the embed
 * never leaves the walkthrough or fetches.
 */
const DEMO_HEADER_CLICK_GATE =
  "[&_header]:pointer-events-none [&_header_[data-nav-key=portal]]:pointer-events-auto [&_header_[data-nav-key=billing]]:pointer-events-auto";

const DEMO_MESSAGES_UNREAD = 2;
const DEMO_ACTIVITY_UNREAD = 3;

function tabForPath(pathname: string): DemoParentGardenPortalTab | null {
  if (isParentBillingPath(pathname)) return "billing";
  if (isParentHomePath(pathname)) return "home";
  return null;
}

/**
 * Walkthrough parent steps (Home, "Parent pays tuition"): the REAL Garden
 * parent portal frame (`SchoolParentBaseline` header + nav, previewMode,
 * embedded virtual pathname) around the real Garden pages, fed by demo
 * fixtures. Mirrors `ProgramParentPortalPreviewFrame`. Nav links switch the
 * body only for tabs the demo has (Home, Billing); others are ignored. Page
 * bodies stay non-interactive.
 */
export default function DemoParentGardenPortal({
  config,
  initialTab = "billing",
  billingChildIds,
}: {
  config: SchoolParentDemoConfig;
  initialTab?: DemoParentGardenPortalTab;
  billingChildIds?: readonly DemoParentChildId[];
}) {
  applyParentDemoRuntime(config);
  const branding = useMemo(() => buildDemoParentBranding(), []);
  const schoolName = resolveDemoParentSchoolName();
  const [pathname, setPathname] = useState(DEMO_TAB_PATHS[initialTab]);
  const activeTab = tabForPath(pathname) ?? initialTab;

  const onNavigate = useCallback((href: string) => {
    if (tabForPath(href)) setPathname(href);
  }, []);
  const embeddedPreview = useMemo(
    () => ({ pathname, onNavigate }),
    [onNavigate, pathname],
  );

  const billingKey = billingChildIds?.join(",") ?? "all";
  const billingData = useMemo(
    () =>
      buildDemoParentBillingInitialData({
        organizationId: DEMO_PORTAL_ORG_ID,
        childIds: billingChildIds,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by the ids' contents, not the array identity
    [billingKey],
  );
  const billingMeta = useMemo(
    () =>
      buildDemoParentBillingPageMeta(
        billingChildIds ? { childIds: billingChildIds } : undefined,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by the ids' contents, not the array identity
    [billingKey],
  );

  const familyChildren = useMemo(() => buildDemoParentChildren(), []);
  const upcomingEvents = useMemo(() => buildDemoParentEvents(DEMO_PORTAL_ORG_ID), []);
  const quickActions = useMemo(
    () => buildParentQuickActions(DEMO_PORTAL_SLUG, DEMO_PARENT_FEATURES, "#"),
    [],
  );

  return (
    <div className={`flex h-full min-h-0 flex-col overflow-hidden ${DEMO_HEADER_CLICK_GATE}`}>
      <SchoolParentBaseline
        slug={DEMO_PORTAL_SLUG}
        organizationId={DEMO_PORTAL_ORG_ID}
        schoolName={schoolName}
        branding={branding}
        features={DEMO_PARENT_FEATURES}
        userProfile={DEMO_PARENT_USER_PROFILE}
        parentNavBasePath={DEMO_PARENT_BASE_PATH}
        previewMode
        previewParentBasePath={DEMO_PARENT_BASE_PATH}
        initialMessagesUnreadCount={DEMO_MESSAGES_UNREAD}
        initialActivityUnreadCount={DEMO_ACTIVITY_UNREAD}
        embeddedPreview={embeddedPreview}
      >
        <div className="pointer-events-none flex min-h-0 flex-1 select-none flex-col">
          {activeTab === "billing" ? (
            <ParentBillingPageShell
              organizationId={DEMO_PORTAL_ORG_ID}
              familyId={DEMO_PARENT_FAMILY_ID}
              branding={branding}
              slug={DEMO_PORTAL_SLUG}
              previewMode
              initialPreviewData={billingData}
              initialPreviewMeta={billingMeta}
            />
          ) : (
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
            />
          )}
        </div>
      </SchoolParentBaseline>
    </div>
  );
}
