"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  buildAdminNavGroups,
} from "@/lib/organization-settings/admin-nav";
import { DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import {
  isAdminMessagesPath,
  resolveAdminNavChildHref,
  schoolAdminPath,
} from "@/lib/organization-settings/admin-routes";
import type { OrganizationPlan } from "@/lib/organization-settings/plans";
import {
  FREE_PLAN_UPGRADE_QUERY,
  resolveFreePlanUpgradeTarget,
} from "@/lib/school-admin/free-plan-upgrade";
import { getFreePlanPitch } from "@/lib/school-admin/free-plan-upgrade-pitches";
import { FreePlanUpgradeProvider } from "@/lib/school-admin/free-plan-upgrade-context";
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
import {
  AdminMobileNavDrawer,
  AdminMobileTopBar,
} from "@/components/school-admin/sidebar/AdminMobileNav";
import { useSidebarExpanded } from "@/components/school-admin/sidebar/useSidebarPreferences";
import { adminToast } from "@/lib/school-admin/admin-toast";
import { AdminNavCountsProvider } from "@/lib/school-admin/admin-nav-counts-context";
import { useAdminNavCountsPolling } from "@/lib/school-admin/use-admin-nav-counts";
import type {
  AdminNavCountFlags,
  AdminNavCountKey,
  AdminNavCountsResult,
} from "@/lib/school-admin/admin-nav-counts";
import {
  adminNavTotalBadge,
  isAdminNavChildLocked,
  isAdminNavItemLocked,
  isCommitteesNavChild,
  isStaffHoursNavChild,
  isSubmissionsNavChild,
  type AdminNavGroup,
} from "@/lib/school-admin/admin-sidebar-nav";
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
const FreePlanUpgradeDialog = dynamic(
  () => import("@/components/school-admin/FreePlanUpgradeDialog"),
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
  openPortalLinksInNewTab?: boolean;
  initialMessagesUnreadCount?: number;
  initialActivityUnreadCount?: number;
  /** "Needs you" counts loaded by the layout for the sidebar badges. */
  initialNavCounts?: AdminNavCountsResult;
  previewMode?: boolean;
  initialSidebarExpanded?: boolean;
  /** Marketing / preview embeds: pretend the user is on this admin path for sidebar active states. */
  previewPathname?: string;
  /** Use `h-full` instead of `h-dvh` when nested in a fixed-height marketing frame. */
  fillParentHeight?: boolean;
  fridayBranchParentPortalPaused?: boolean;
  plan?: OrganizationPlan;
  children: ReactNode;
};

type NavCountTarget = { href: string; reviewHref: string };

const NAV_COUNT_TOAST_COPY: Record<
  AdminNavCountKey,
  { one: string; many: (n: number) => string; description: (total: number) => string }
> = {
  staffHoursPending: {
    one: "New hour request waiting.",
    many: (n) => `${n} new hour requests waiting.`,
    description: (total) => `${total} waiting for you in Staff hours.`,
  },
  applicationsToReview: {
    one: "New application ready to review.",
    many: (n) => `${n} new applications ready to review.`,
    description: (total) => `${total} waiting for a decision in Submissions.`,
  },
  committeeJoinRequests: {
    one: "New committee join request.",
    many: (n) => `${n} new committee join requests.`,
    description: (total) => `${total} waiting for you in Committees.`,
  },
};

/** Where each "needs you" count lives in this school's nav (null when hidden or locked). */
function findAdminNavCountTargets(
  slug: string,
  navGroups: AdminNavGroup[],
  lockedMode: boolean,
): Record<AdminNavCountKey, NavCountTarget | null> {
  const targets: Record<AdminNavCountKey, NavCountTarget | null> = {
    staffHoursPending: null,
    applicationsToReview: null,
    committeeJoinRequests: null,
  };
  for (const item of navGroups.flatMap((group) => group.items)) {
    if (!item.children?.length) {
      if (item.key === "committees" && !isAdminNavItemLocked(item, lockedMode)) {
        const href = schoolAdminPath(slug, "committees");
        targets.committeeJoinRequests ??= { href, reviewHref: href };
      }
      continue;
    }
    for (const child of item.children) {
      if (child.children?.length || isAdminNavChildLocked(item.key, child, lockedMode)) continue;
      const href = resolveAdminNavChildHref(slug, item.key, child);
      if (isStaffHoursNavChild(item.key, child)) {
        targets.staffHoursPending ??= { href, reviewHref: `${href}?view=requests` };
      } else if (isSubmissionsNavChild(item.key, child)) {
        targets.applicationsToReview ??= { href, reviewHref: href };
      } else if (isCommitteesNavChild(child)) {
        targets.committeeJoinRequests ??= { href, reviewHref: href };
      }
    }
  }
  return targets;
}

function SchoolAdminBaselineInner({
  slug,
  organizationId,
  schoolName,
  branding,
  features,
  userProfile,
  portalOptions = [],
  openPortalLinksInNewTab = false,
  initialMessagesUnreadCount,
  initialActivityUnreadCount,
  initialNavCounts,
  previewMode = false,
  initialSidebarExpanded = true,
  previewPathname,
  fillParentHeight = false,
  fridayBranchParentPortalPaused = false,
  plan = "custom",
  children,
}: SchoolAdminBaselineProps) {
  const routerPathname = usePathname();
  const pathname =
    previewMode && previewPathname ? previewPathname : routerPathname;
  const isMessagesPage = isAdminMessagesPath(pathname);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { C, theme: storyTheme } = useSchoolAdminStoryTheme();

  const searchParams = useSearchParams();
  const upgradeFromUrl =
    plan === "free" ? searchParams.get(FREE_PLAN_UPGRADE_QUERY) : null;
  const [pickedUpgradeLabel, setPickedUpgradeLabel] = useState<string | null>(null);
  const upgradeLabel = pickedUpgradeLabel ?? upgradeFromUrl;

  const navGroups = useMemo(
    () =>
      plan === "free"
        ? buildAdminNavGroups(DEFAULT_FEATURES.admin)
        : buildAdminNavGroups(
            features.admin,
            features.feature_nav?.admin,
          ),
    [features.admin, features.feature_nav?.admin, plan],
  );

  const upgradePitch = useMemo(
    () =>
      getFreePlanPitch(
        upgradeLabel ? resolveFreePlanUpgradeTarget(navGroups, upgradeLabel) : null,
      ),
    [navGroups, upgradeLabel],
  );

  const closeUpgrade = useCallback(() => {
    setPickedUpgradeLabel(null);
    if (upgradeFromUrl) {
      router.replace(schoolAdminPath(slug, "home"));
    }
  }, [router, slug, upgradeFromUrl]);

  const {
    expanded: sidebarExpanded,
    setExpanded: setSidebarExpanded,
    ready: sidebarReady,
  } = useSidebarExpanded(initialSidebarExpanded, !previewMode);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileNavSearch, setMobileNavSearch] = useState(false);
  const [searchFocusToken, setSearchFocusToken] = useState(0);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close the phone drawer once the page the admin picked opens.
  const [drawerPathname, setDrawerPathname] = useState(pathname);
  if (drawerPathname !== pathname) {
    setDrawerPathname(pathname);
    setMobileNavOpen(false);
  }
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

  /* "Needs you" badges: Staff hours requests, applications, committee join requests. */
  const lockedMode = plan === "free";
  const navTargets = useMemo(
    () => findAdminNavCountTargets(slug, navGroups, lockedMode),
    [lockedMode, navGroups, slug],
  );
  const navCountFlags = useMemo<AdminNavCountFlags>(
    () => ({
      staffHoursPending: !previewMode && navTargets.staffHoursPending != null,
      applicationsToReview: !previewMode && navTargets.applicationsToReview != null,
      committeeJoinRequests: !previewMode && navTargets.committeeJoinRequests != null,
    }),
    [navTargets, previewMode],
  );
  const onNavCountIncrease = useCallback(
    (key: AdminNavCountKey, added: number, total: number) => {
      const target = navTargets[key];
      if (!target) return;
      // That page shows its own list; no need to interrupt there.
      if (pathname === target.href || pathname.startsWith(`${target.href}/`)) return;
      const copy = NAV_COUNT_TOAST_COPY[key];
      adminToast.info(added === 1 ? copy.one : copy.many(added), {
        id: `nav-count-new-${key}`,
        description: copy.description(total),
        action: { label: "Review", onClick: () => router.push(target.reviewHref) },
      });
    },
    [navTargets, pathname, router],
  );
  const {
    counts: needsCounts,
    report: reportNavCount,
    refresh: refreshNavCounts,
  } = useAdminNavCountsPolling({
    organizationId,
    flags: navCountFlags,
    initialCounts: previewMode ? undefined : initialNavCounts,
    pathname,
    onIncrease: onNavCountIncrease,
  });
  const sidebarCounts = useMemo(
    () => ({ messagesUnread: messagesUnreadCount, ...needsCounts }),
    [messagesUnreadCount, needsCounts],
  );
  const waitingBadge = useMemo(
    () => adminNavTotalBadge(navGroups, sidebarCounts, lockedMode),
    [lockedMode, navGroups, sidebarCounts],
  );
  const navCounts = useMemo(
    () => ({ counts: needsCounts, report: reportNavCount, refresh: refreshNavCounts }),
    [needsCounts, refreshNavCounts, reportNavCount],
  );

  // ⌘K / Ctrl+K: focus "Find a page" (expand the sidebar or open the drawer).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return;
      if (event.key.toLowerCase() !== "k") return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      const inOtherField =
        target != null &&
        !target.hasAttribute("data-admin-sidebar-search") &&
        (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if (inOtherField) return; // editors keep their own ⌘K (e.g. insert link)
      event.preventDefault();
      if (window.matchMedia("(min-width: 768px)").matches) {
        setSidebarExpanded(true);
      } else {
        setMobileNavSearch(true);
        setMobileNavOpen(true);
      }
      setSearchFocusToken((token) => token + 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setSidebarExpanded]);

  const requestSidebarSearch = useCallback(() => {
    setSidebarExpanded(true);
    setSearchFocusToken((token) => token + 1);
  }, [setSidebarExpanded]);

  const openMobileNav = useCallback(() => {
    setMobileNavSearch(false);
    setMobileNavOpen(true);
  }, []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

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
      // ignore transient fetch errors. intentionally silent
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
    setMobileNavOpen(false);
    setNotificationsOpen(true);
  }, []);
  const openSupport = useCallback(() => {
    setMobileNavOpen(false);
    setSupportOpen(true);
  }, []);
  const onLockedFeature = useCallback((label: string) => {
    setMobileNavOpen(false);
    setPickedUpgradeLabel(label);
  }, []);

  return (
    <MessagesRefreshProvider
      organizationId={organizationId}
      enabled={messagesEnabled && !previewMode}
    >
      <NavigationLoadingProvider>
        <div
          className={`flex w-full flex-col overflow-hidden md:flex-row ${
            fillParentHeight ? "h-full min-h-0" : "h-dvh"
          }`}
        >
          <SchoolAdminStorySidebar
            className="hidden md:block"
            branding={branding}
            schoolName={schoolName}
            slug={slug}
            pathnameOverride={previewMode && previewPathname ? pathname : undefined}
            navGroups={navGroups}
            isExpanded={sidebarExpanded}
            onToggleExpand={() => setSidebarExpanded((v) => !v)}
            userProfile={userProfile}
            onSignOut={handleSignOut}
            portalOptions={resolvedPortalOptions}
            openPortalLinksInNewTab={openPortalLinksInNewTab}
            previewMode={previewMode}
            onOpenSupport={openSupport}
            onOpenNotifications={openNotifications}
            unreadCount={unreadCount}
            messagesUnreadCount={messagesUnreadCount}
            needsCounts={needsCounts}
            fridayBranchParentPortalPaused={fridayBranchParentPortalPaused}
            plan={plan}
            onLockedFeature={plan === "free" ? onLockedFeature : undefined}
            searchFocusToken={searchFocusToken}
            onRequestSearch={requestSidebarSearch}
            animateWidth={sidebarReady}
          />

          <AdminMobileTopBar
            branding={branding}
            schoolName={schoolName}
            plan={plan}
            drawerOpen={mobileNavOpen}
            onOpenDrawer={openMobileNav}
            menuButtonRef={menuButtonRef}
            unreadCount={unreadCount}
            onOpenNotifications={openNotifications}
            waitingBadge={waitingBadge}
          />

          <AdminMobileNavDrawer
            open={mobileNavOpen}
            onClose={closeMobileNav}
            returnFocusRef={menuButtonRef}
            focusSearch={mobileNavSearch}
            searchFocusToken={mobileNavSearch ? searchFocusToken : 0}
            branding={branding}
            schoolName={schoolName}
            slug={slug}
            pathname={pathname}
            navGroups={navGroups}
            counts={sidebarCounts}
            unreadCount={unreadCount}
            userProfile={userProfile}
            onSignOut={handleSignOut}
            onOpenSupport={openSupport}
            onOpenNotifications={openNotifications}
            portalOptions={resolvedPortalOptions}
            openPortalLinksInNewTab={openPortalLinksInNewTab}
            previewMode={previewMode}
            fridayBranchParentPortalPaused={fridayBranchParentPortalPaused}
            onLockedFeature={plan === "free" ? onLockedFeature : undefined}
            plan={plan}
          />

          {plan === "free" ? (
            <FreePlanUpgradeDialog
              open={Boolean(upgradeLabel)}
              featureLabel={upgradeLabel ?? ""}
              pitch={upgradePitch}
              schoolName={schoolName}
              slug={slug}
              userName={userProfile?.displayName ?? ""}
              userEmail={userProfile?.email ?? ""}
              previewMode={previewMode}
              onClose={closeUpgrade}
            />
          ) : null}

          {supportOpen ? (
            <AdminSupportRequestModal
              theme={storyTheme}
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
              theme={storyTheme}
              open={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
              organizationId={organizationId}
              onMarkedRead={() => setUnreadCount(0)}
              newCount={unreadCount}
            />
          ) : null}

          <AdminToaster C={C} theme={storyTheme} />

          <main
            className="min-h-0 min-w-0 flex-1 overflow-hidden"
            style={{ backgroundColor: SCHOOL_ADMIN_PAPER_BG }}
          >
            <div
              className={`relative h-full ${
                isMessagesPage ? "overflow-hidden" : "overflow-y-auto"
              }`}
            >
              <AdminNavCountsProvider value={navCounts}>
                <AdminNotificationsPanelProvider onOpenNotifications={openNotifications}>
                  <FreePlanUpgradeProvider value={plan === "free" ? onLockedFeature : null}>
                    <AdminPageContentShell>{children}</AdminPageContentShell>
                  </FreePlanUpgradeProvider>
                </AdminNotificationsPanelProvider>
              </AdminNavCountsProvider>
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
