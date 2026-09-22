"use client";

import { Suspense, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useSearchParams } from "next/navigation";
import SchoolParentHeader from "@/components/school-parent/SchoolParentHeader";
import { ParentPortalContextProvider } from "@/components/school-parent/ParentPortalContextProvider";
import ParentToaster from "@/components/school-parent/ParentToaster";
import { ParentThemeProvider, useParentTheme } from "@/components/school-parent/ParentThemeContext";
import PortalHelpFab from "@/components/school/shared/PortalHelpFab";
import NavigationLoadingProvider from "@/components/school/shared/NavigationLoadingProvider";
import { MessagesRefreshProvider } from "@/lib/messages/messages-refresh-context";
import { fraunces, dmSans } from "@/lib/fonts";
import type { FamilyUserProfile } from "@/lib/admissions/parent-portal-access";
import type { SchoolPortalOption } from "@/lib/auth/portal-switcher-types";
import type { ParentPortalContextOption } from "@/lib/organization-settings/resolve-program-parent-features";
import {
  isParentBillingPath,
  isParentCommitteeWorkspaceOpen,
  isParentCurriculumPath,
  isParentHomePath,
  isParentMessagesPath,
  parentDocumentationPath,
} from "@/lib/organization-settings/parent-routes";
import { parentThemeCssVars } from "@/lib/organization-settings/parent-theme";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";
import type { ParentNotificationContext } from "@/lib/parent-portal/parent-notification-context";

const ParentActivityNotificationsPanel = dynamic(
  () => import("@/components/school-parent/ParentActivityNotificationsPanel"),
  { ssr: false },
);

export type SchoolParentEmbeddedPreview = {
  pathname: string;
  onNavigate: (href: string) => void;
};

type SchoolParentBaselineProps = {
  slug: string;
  organizationId: string;
  schoolName: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  userProfile: FamilyUserProfile;
  portalOptions?: SchoolPortalOption[];
  parentPortalContexts?: ParentPortalContextOption[];
  parentNavBasePath?: string;
  coopModeEnabled?: boolean;
  coopProgramLabel?: string;
  children: ReactNode;
  previewMode?: boolean;
  previewBasePath?: string;
  previewParentBasePath?: string;
  previewFamilyId?: string;
  initialActivityUnreadCount?: number;
  notificationContext?: ParentNotificationContext;
  embeddedPreview?: SchoolParentEmbeddedPreview;
};

function isParentHelpPage(pathname: string, slug: string): boolean {
  return (
    pathname.startsWith(`/school/${slug}/parent/`) ||
    (pathname.includes(`/admin/preview/${slug}/`) &&
      pathname.includes("/parent/"))
  );
}

function SchoolParentBaselineInner({
  slug,
  organizationId,
  schoolName,
  branding,
  features,
  userProfile,
  portalOptions = [],
  parentPortalContexts = [],
  parentNavBasePath,
  coopModeEnabled = false,
  coopProgramLabel,
  children,
  previewMode = false,
  previewBasePath,
  previewParentBasePath,
  previewFamilyId,
  initialActivityUnreadCount,
  notificationContext,
  embeddedPreview,
  searchParams,
}: SchoolParentBaselineProps & {
  searchParams: ReturnType<typeof useSearchParams>;
}) {
  const routerPathname = usePathname();
  const pathname = embeddedPreview?.pathname ?? routerPathname;
  const { theme, adminCompat: C } = useParentTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activityUnreadCount, setActivityUnreadCount] = useState(
    initialActivityUnreadCount ?? 0,
  );
  const lastUnreadFetchRef = useRef(0);
  const FOCUS_REFETCH_MS = 60_000;
  const resolvedNavBasePath =
    parentNavBasePath ??
    previewParentBasePath ??
    `/school/${slug}/parent`;
  const resolvedApplyBasePath =
    previewBasePath ?? `/school/${slug}/apply`;
  const resolvedNotificationContext =
    notificationContext ??
    ({
      mode: "main",
      slug,
      parentNavBasePath: resolvedNavBasePath,
      applyBasePath: resolvedApplyBasePath,
    } satisfies ParentNotificationContext);
  const skipInitialUnreadFetch =
    !previewMode && initialActivityUnreadCount != null;
  const isMessagesPage = isParentMessagesPath(pathname);
  const isFixedLayoutPage =
    isMessagesPage ||
    isParentBillingPath(pathname) ||
    isParentCurriculumPath(pathname);
  const messagesEnabled = Boolean(features.parent?.messages);
  const showHelpButton =
    isParentHelpPage(pathname, slug) &&
    !isMessagesPage &&
    !isParentHomePath(pathname) &&
    !isParentCommitteeWorkspaceOpen(pathname, searchParams);
  const documentationHref = parentDocumentationPath(slug, {
    previewBasePath,
    parentNavBasePath,
  });

  const fetchActivityUnreadCount = useCallback(async () => {
    if (previewMode) return;
    try {
      const params = new URLSearchParams({
        organizationId,
        slug,
        mode: resolvedNotificationContext.mode,
        parentNavBasePath: resolvedNotificationContext.parentNavBasePath,
        applyBasePath: resolvedNotificationContext.applyBasePath,
      });
      if (resolvedNotificationContext.mode === "program") {
        params.set("programId", resolvedNotificationContext.programId);
        params.set("programSlug", resolvedNotificationContext.programSlug);
        params.set(
          "coopModeEnabled",
          resolvedNotificationContext.coopModeEnabled ? "true" : "false",
        );
      }
      const response = await fetch(
        `/api/parent-portal/activity-notifications/unread-count?${params.toString()}`,
      );
      if (!response.ok) return;
      const payload = (await response.json()) as { unreadCount?: number };
      setActivityUnreadCount(payload.unreadCount ?? 0);
      lastUnreadFetchRef.current = Date.now();
    } catch {
      // ignore transient fetch errors. intentionally silent
    }
  }, [
    organizationId,
    previewMode,
    resolvedNotificationContext,
    slug,
  ]);

  useEffect(() => {
    if (previewMode || skipInitialUnreadFetch) return;
    queueMicrotask(() => {
      void fetchActivityUnreadCount();
    });
  }, [fetchActivityUnreadCount, previewMode, skipInitialUnreadFetch]);

  useEffect(() => {
    if (previewMode) return;
    const handleFocus = () => {
      if (Date.now() - lastUnreadFetchRef.current < FOCUS_REFETCH_MS) return;
      void fetchActivityUnreadCount();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchActivityUnreadCount, previewMode]);

  const openNotifications = useCallback(() => {
    setNotificationsOpen(true);
  }, []);

  const shell = (
    <ParentPortalContextProvider
      slug={slug}
      contexts={parentPortalContexts}
      previewParentBasePath={previewParentBasePath}
      onPreviewNavigate={embeddedPreview?.onNavigate}
      pathnameOverride={embeddedPreview?.pathname}
    >
      <div
        className={
          previewMode
            ? `flex min-h-0 flex-1 w-full flex-col overflow-hidden ${fraunces.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)]`
            : `flex h-dvh w-full flex-col overflow-hidden ${fraunces.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)]`
        }
        data-parent-portal
        style={{
          ...parentThemeCssVars(theme),
          fontFamily: theme.fontBody,
          color: theme.ink,
          backgroundColor: theme.paper,
        }}
      >
        <SchoolParentHeader
          slug={slug}
          organizationId={organizationId}
          schoolName={schoolName}
          branding={branding}
          features={features}
          userProfile={userProfile}
          portalOptions={portalOptions}
          parentNavBasePath={parentNavBasePath ?? previewParentBasePath}
          mainParentBasePath={
            previewParentBasePath ?? `/school/${slug}/parent`
          }
          previewMode={previewMode}
          previewBasePath={previewBasePath}
          previewParentBasePath={previewParentBasePath}
          embeddedPreview={embeddedPreview}
          coopModeEnabled={coopModeEnabled}
          coopProgramLabel={coopProgramLabel}
          activityUnreadCount={activityUnreadCount}
          onOpenNotifications={openNotifications}
        />

        <main
          className={`flex min-h-0 flex-1 flex-col ${
            isFixedLayoutPage ? "overflow-hidden" : "overflow-y-auto"
          }`}
          style={{ backgroundColor: theme.paper }}
        >
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </main>

        <PortalHelpFab
          C={C}
          organizationId={organizationId}
          userEmail={userProfile.email}
          currentPath={pathname}
          submitEndpoint="/api/parent-portal/support-requests"
          visible={showHelpButton}
          readOnly={previewMode}
          documentationHref={documentationHref}
          iconOnly={isParentCurriculumPath(pathname)}
        />

        <ParentToaster C={C} helpButtonVisible={showHelpButton} />

        <ParentActivityNotificationsPanel
          open={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          organizationId={organizationId}
          slug={slug}
          notificationContext={resolvedNotificationContext}
          parentNavBasePath={resolvedNavBasePath}
          applyBasePath={resolvedApplyBasePath}
          previewMode={previewMode}
          previewFamilyId={previewFamilyId}
          onMarkedRead={() => setActivityUnreadCount(0)}
          onNavigate={embeddedPreview?.onNavigate}
        />
      </div>
    </ParentPortalContextProvider>
  );

  const wrappedShell = (
    <MessagesRefreshProvider
      organizationId={organizationId}
      enabled={messagesEnabled && !previewMode}
    >
      {shell}
    </MessagesRefreshProvider>
  );

  if (previewMode) {
    return wrappedShell;
  }

  return <NavigationLoadingProvider>{wrappedShell}</NavigationLoadingProvider>;
}

function SchoolParentBaselineWithSearchParams(props: SchoolParentBaselineProps) {
  const searchParams = useSearchParams();
  return <SchoolParentBaselineInner {...props} searchParams={searchParams} />;
}

export default function SchoolParentBaseline(props: SchoolParentBaselineProps) {
  return (
    <ParentThemeProvider branding={props.branding}>
      <Suspense fallback={null}>
        <SchoolParentBaselineWithSearchParams {...props} />
      </Suspense>
    </ParentThemeProvider>
  );
}
