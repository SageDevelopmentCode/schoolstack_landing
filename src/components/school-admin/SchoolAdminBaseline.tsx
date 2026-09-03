"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  buildAdminNavGroups,
} from "@/lib/organization-settings/admin-nav";
import { isAdminMessagesPath } from "@/lib/organization-settings/admin-routes";
import {
  schoolAdminLoginPath,
  type SchoolAdminUserProfile,
} from "@/lib/school-admin/access";
import type { SchoolPortalOption } from "@/lib/auth/portal-switcher-types";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";
import AdminPageContentShell from "@/components/school-admin/AdminPageContentShell";
import SchoolAdminStoryShell, {
  SCHOOL_ADMIN_PAPER_BG,
  useSchoolAdminStoryTheme,
} from "@/components/school-admin/SchoolAdminStoryShell";
import SchoolAdminStorySidebar from "@/components/school-admin/SchoolAdminStorySidebar";
import { useMessagesUnreadCount } from "@/lib/messages/use-messages-unread-count";
import { useSchoolPortalOptions } from "@/lib/auth/use-school-portal-options";
import { MessagesRefreshProvider } from "@/lib/messages/messages-refresh-context";
import { AdminNotificationsPanelProvider } from "@/lib/school-admin/admin-notifications-panel-context";
import NavigationLoadingProvider from "@/components/school/shared/NavigationLoadingProvider";

const AdminSupportRequestModal = dynamic(
  () => import("@/components/school-admin/AdminSupportRequestModal"),
  { ssr: false },
);
const AdminToaster = dynamic(
  () => import("@/components/school-admin/AdminToaster"),
  { ssr: false },
);
const AdminActivityNotificationsPanel = dynamic(
  () => import("@/components/school-admin/AdminActivityNotificationsPanel"),
  { ssr: false },
);

type SchoolAdminBaselineProps = {
  slug: string;
  organizationId: string;
  schoolName: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  userProfile: SchoolAdminUserProfile | null;
  portalOptions?: SchoolPortalOption[];
  initialMessagesUnreadCount?: number;
  initialActivityUnreadCount?: number;
  previewMode?: boolean;
  children: ReactNode;
};

function SchoolAdminBaselineInner({
  slug,
  organizationId,
  schoolName,
  branding,
  features,
  userProfile,
  portalOptions = [],
  initialMessagesUnreadCount,
  initialActivityUnreadCount,
  previewMode = false,
  children,
}: SchoolAdminBaselineProps) {
  const pathname = usePathname();
  const isMessagesPage = isAdminMessagesPath(pathname);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { C } = useSchoolAdminStoryTheme();

  const navGroups = useMemo(
    () =>
      buildAdminNavGroups(
        features.admin,
        features.feature_nav?.admin,
      ),
    [features.admin, features.feature_nav?.admin],
  );

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [supportOpen, setSupportOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialActivityUnreadCount ?? 0);
  const lastUnreadFetchRef = useRef(0);
  const FOCUS_REFETCH_MS = 60_000;
  const messagesEnabled = Boolean(features.admin.messages);
  const skipInitialUnreadFetch = !previewMode && initialActivityUnreadCount != null;
  const { options: loadedPortalOptions } = useSchoolPortalOptions(
    organizationId,
    slug,
    {
      enabled: !previewMode,
      initialOptions: previewMode ? portalOptions : undefined,
    },
  );
  const resolvedPortalOptions = previewMode ? portalOptions : loadedPortalOptions;
  const { unreadCount: messagesUnreadCount } = useMessagesUnreadCount(
    "/api/school-admin/messages",
    organizationId,
    schoolName,
    messagesEnabled && !previewMode,
    {
      initialUnreadCount: initialMessagesUnreadCount,
      skipInitialFetch: !previewMode && initialMessagesUnreadCount != null,
    },
  );

  const fetchUnreadCount = useCallback(async () => {
    try {
      const params = new URLSearchParams({ organizationId });
      const response = await fetch(
        `/api/school-admin/activity-notifications/unread-count?${params.toString()}`,
      );
      if (!response.ok) return;

      const payload = (await response.json()) as { unreadCount?: number };
      setUnreadCount(payload.unreadCount ?? 0);
      lastUnreadFetchRef.current = Date.now();
    } catch {
      // ignore transient fetch errors
    }
  }, [organizationId]);

  useEffect(() => {
    if (previewMode || skipInitialUnreadFetch) return;
    queueMicrotask(() => {
      void fetchUnreadCount();
    });
  }, [fetchUnreadCount, previewMode, skipInitialUnreadFetch]);

  useEffect(() => {
    if (previewMode) return;
    const handleFocus = () => {
      if (Date.now() - lastUnreadFetchRef.current < FOCUS_REFETCH_MS) return;
      void fetchUnreadCount();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchUnreadCount, previewMode]);

  const handleSignOut = async () => {
    if (previewMode) {
      router.push("/admin/organizations");
      return;
    }
    await supabase.auth.signOut();
    router.push(schoolAdminLoginPath(slug));
    router.refresh();
  };

  const openNotifications = useCallback(() => {
    setNotificationsOpen(true);
  }, []);

  return (
    <MessagesRefreshProvider
      organizationId={organizationId}
      enabled={messagesEnabled && !previewMode}
    >
      <NavigationLoadingProvider>
        <div className="flex h-dvh w-full overflow-hidden">
          <SchoolAdminStorySidebar
            branding={branding}
            schoolName={schoolName}
            slug={slug}
            navGroups={navGroups}
            isExpanded={sidebarExpanded}
            onToggleExpand={() => setSidebarExpanded((v) => !v)}
            userProfile={userProfile}
            onSignOut={handleSignOut}
            portalOptions={resolvedPortalOptions}
            previewMode={previewMode}
            onOpenSupport={() => setSupportOpen(true)}
            onOpenNotifications={openNotifications}
            unreadCount={unreadCount}
            messagesUnreadCount={messagesUnreadCount}
          />

          {supportOpen ? (
            <AdminSupportRequestModal
              C={C}
              open={supportOpen}
              onClose={() => setSupportOpen(false)}
              organizationId={organizationId}
              userEmail={userProfile?.email ?? null}
              currentPath={pathname}
              documentationHref={`/school/${slug}/admin/documentation`}
            />
          ) : null}

          {notificationsOpen ? (
            <AdminActivityNotificationsPanel
              C={C}
              open={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
              organizationId={organizationId}
              onMarkedRead={() => setUnreadCount(0)}
            />
          ) : null}

          <AdminToaster C={C} />

          <main
            className="min-w-0 flex-1 overflow-hidden"
            style={{ backgroundColor: SCHOOL_ADMIN_PAPER_BG }}
          >
            <div
              className={`relative h-full ${
                isMessagesPage ? "overflow-hidden" : "overflow-y-auto"
              }`}
            >
              <AdminNotificationsPanelProvider onOpenNotifications={openNotifications}>
                <AdminPageContentShell>{children}</AdminPageContentShell>
              </AdminNotificationsPanelProvider>
            </div>
          </main>
        </div>
      </NavigationLoadingProvider>
    </MessagesRefreshProvider>
  );
}

export default function SchoolAdminBaseline(props: SchoolAdminBaselineProps) {
  return (
    <SchoolAdminStoryShell branding={props.branding}>
      <SchoolAdminBaselineInner {...props} />
    </SchoolAdminStoryShell>
  );
}
