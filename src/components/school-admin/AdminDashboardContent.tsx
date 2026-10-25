"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import AdminDocumentationGuidePanel from "@/components/school-admin/AdminDocumentationGuidePanel";
import AdminDashboardActivityPanel from "@/components/school-admin/dashboard/AdminDashboardActivityPanel";
import AdminDashboardGuidesPanel from "@/components/school-admin/dashboard/AdminDashboardGuidesPanel";
import AdminDashboardJourneyPanel from "@/components/school-admin/dashboard/AdminDashboardJourneyPanel";
import AdminDashboardStoryHeader from "@/components/school-admin/dashboard/AdminDashboardStoryHeader";
import AdminDashboardTodayPanel from "@/components/school-admin/dashboard/AdminDashboardTodayPanel";
import {
  parseDashboardTab,
  type DashboardTabId,
} from "@/components/school-admin/dashboard/dashboard-tabs";
import { DASHBOARD_TAB_ROOT_CLASS } from "@/components/school-admin/dashboard/dashboard-panel-layout";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import type {
  AdminDashboardActivity,
  AdminDashboardGuides,
  AdminDashboardToday,
} from "@/lib/school-admin/dashboard-summary";
import {
  buildAdminDocumentationGuides,
  groupAdminDocumentationByCategory,
  type AdminDocGuide,
} from "@/lib/school-admin/admin-documentation";
import { schoolMudKitchenPortalPath } from "@/lib/organization-settings/admin-routes";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import { useAdminNotificationsPanel } from "@/lib/school-admin/admin-notifications-panel-context";
import { useVisibilityPolling } from "@/lib/hooks/use-visibility-polling";
import {
  buildJourneySections,
  hasJourneyNavigator,
} from "@/lib/school-admin/dashboard-family-journey";

type AdminDashboardContentProps = {
  organizationId: string;
  slug: string;
  features: OrganizationFeatures;
  userFirstName?: string | null;
  schoolName: string;
  initialToday: AdminDashboardToday;
};

function dashboardSectionFetch(
  organizationId: string,
  slug: string,
  section: "today" | "activity" | "guides",
): string {
  const params = new URLSearchParams({ organizationId, slug, section });
  return `/api/school-admin/dashboard-summary?${params.toString()}`;
}

function tabNeedsAsyncLoad(tab: DashboardTabId): boolean {
  return tab === "activity" || tab === "guides";
}

function isTabDataReady(
  tab: DashboardTabId,
  activityLoaded: boolean,
  guidesLoaded: boolean,
): boolean {
  if (tab === "activity") return activityLoaded;
  if (tab === "guides") return guidesLoaded;
  return true;
}

export default function AdminDashboardContent({
  organizationId,
  slug,
  features,
  userFirstName,
  schoolName,
  initialToday,
}: AdminDashboardContentProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const { openNotifications } = useAdminNotificationsPanel();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = parseDashboardTab(searchParams.get("tab"));

  const [today, setToday] = useState(initialToday);
  const [prevInitialToday, setPrevInitialToday] = useState(initialToday);
  const [activity, setActivity] = useState<AdminDashboardActivity | null>(null);
  const [guides, setGuides] = useState<AdminDashboardGuides | null>(null);
  const [activeGuide, setActiveGuide] = useState<AdminDocGuide | null>(null);
  const [everVisitedTabs, setEverVisitedTabs] = useState<Set<DashboardTabId>>(
    () => new Set([activeTab]),
  );
  const visitedTabs = useMemo(() => {
    const next = new Set(everVisitedTabs);
    next.add(activeTab);
    return next;
  }, [everVisitedTabs, activeTab]);
  const [pendingTabKey, setPendingTabKey] = useState<DashboardTabId | null>(null);
  const [loadingTabKey, setLoadingTabKey] = useState<DashboardTabId | null>(null);
  const [activityLoaded, setActivityLoaded] = useState(false);
  const [guidesLoaded, setGuidesLoaded] = useState(false);
  const activityFetchStartedRef = useRef(false);
  const guidesFetchStartedRef = useRef(false);

  const howToGuides = useMemo(
    () => buildAdminDocumentationGuides(slug, features),
    [slug, features],
  );
  const groupedHowToGuides = useMemo(
    () => groupAdminDocumentationByCategory(howToGuides),
    [howToGuides],
  );

  const adminFeatures = features.admin;

  const journeySections = useMemo(
    () => buildJourneySections(slug, features),
    [slug, features],
  );

  const visibleTabs = useMemo(() => {
    const tabs: DashboardTabId[] = ["today"];
    if (hasJourneyNavigator(features)) {
      tabs.push("journey");
    }
    const showActivity =
      adminFeatures?.admissions ||
      adminFeatures?.messages ||
      (activity != null && activity.recentActivity.length > 0) ||
      (activity != null && activity.quickActions.length > 0) ||
      loadingTabKey === "activity";
    if (showActivity) {
      tabs.push("activity");
    }
    const announcementCount = guides?.featureAnnouncements.length ?? 0;
    const showGuides =
      howToGuides.length > 0 ||
      announcementCount > 0 ||
      loadingTabKey === "guides";
    if (showGuides) {
      tabs.push("guides");
    }
    return tabs;
  }, [
    adminFeatures,
    activity,
    features,
    guides,
    howToGuides.length,
    loadingTabKey,
  ]);

  if (initialToday !== prevInitialToday) {
    setPrevInitialToday(initialToday);
    setToday(initialToday);
  }

  const setActiveTab = useCallback(
    (tab: DashboardTabId) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "today") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const loadActivity = useCallback(async () => {
    if (activityLoaded || activityFetchStartedRef.current) {
      setLoadingTabKey((current) => (current === "activity" ? null : current));
      setPendingTabKey((current) => (current === "activity" ? null : current));
      return;
    }
    activityFetchStartedRef.current = true;
    await Promise.resolve();
    setLoadingTabKey("activity");
    try {
      const response = await fetch(
        dashboardSectionFetch(organizationId, slug, "activity"),
      );
      if (!response.ok) return;
      const next = (await response.json()) as AdminDashboardActivity;
      setActivity(next);
      setActivityLoaded(true);
    } finally {
      setLoadingTabKey((current) => (current === "activity" ? null : current));
      setPendingTabKey((current) => (current === "activity" ? null : current));
    }
  }, [activityLoaded, organizationId, slug]);

  const loadGuides = useCallback(async () => {
    if (guidesLoaded || guidesFetchStartedRef.current) {
      setLoadingTabKey((current) => (current === "guides" ? null : current));
      setPendingTabKey((current) => (current === "guides" ? null : current));
      return;
    }
    guidesFetchStartedRef.current = true;
    await Promise.resolve();
    setLoadingTabKey("guides");
    try {
      const response = await fetch(
        dashboardSectionFetch(organizationId, slug, "guides"),
      );
      if (!response.ok) return;
      const next = (await response.json()) as AdminDashboardGuides;
      setGuides(next);
      setGuidesLoaded(true);
    } finally {
      setLoadingTabKey((current) => (current === "guides" ? null : current));
      setPendingTabKey((current) => (current === "guides" ? null : current));
    }
  }, [guidesLoaded, organizationId, slug]);

  const ensureTabData = useCallback(
    (tab: DashboardTabId) => {
      if (tab === "activity") {
        void loadActivity();
      }
      if (tab === "guides") {
        void loadGuides();
      }
    },
    [loadActivity, loadGuides],
  );

  const refreshToday = useCallback(async () => {
    try {
      const response = await fetch(
        dashboardSectionFetch(organizationId, slug, "today"),
      );
      if (!response.ok) return;
      const next = (await response.json()) as AdminDashboardToday;
      setToday(next);
    } catch {
      // Keep last known today payload. intentionally silent
    }
  }, [organizationId, slug]);

  useEffect(() => {
    if (visitedTabs.has("activity")) {
      void loadActivity();
    }
    if (visitedTabs.has("guides")) {
      void loadGuides();
    }
  }, [visitedTabs, loadActivity, loadGuides]);

  const handleTabChange = useCallback(
    (tab: DashboardTabId) => {
      setEverVisitedTabs((current) => {
        if (current.has(tab)) return current;
        const next = new Set(current);
        next.add(tab);
        return next;
      });
      ensureTabData(tab);
      if (
        tab !== activeTab &&
        tabNeedsAsyncLoad(tab) &&
        !isTabDataReady(tab, activityLoaded, guidesLoaded)
      ) {
        setPendingTabKey(tab);
      } else {
        setPendingTabKey(null);
      }
      setActiveTab(tab);
    },
    [activeTab, activityLoaded, ensureTabData, guidesLoaded, setActiveTab],
  );

  useEffect(() => {
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab("today");
    }
  }, [activeTab, visibleTabs, setActiveTab]);

  const refreshActivity = useCallback(async () => {
    try {
      const response = await fetch(
        dashboardSectionFetch(organizationId, slug, "activity"),
      );
      if (!response.ok) return;
      const next = (await response.json()) as AdminDashboardActivity;
      setActivity(next);
      setActivityLoaded(true);
    } catch {
      // Keep last known activity payload. intentionally silent
    }
  }, [organizationId, slug]);

  const refreshGuides = useCallback(async () => {
    try {
      const response = await fetch(
        dashboardSectionFetch(organizationId, slug, "guides"),
      );
      if (!response.ok) return;
      const next = (await response.json()) as AdminDashboardGuides;
      setGuides(next);
      setGuidesLoaded(true);
    } catch {
      // Keep last known guides payload. intentionally silent
    }
  }, [organizationId, slug]);

  const refreshOnFocus = useCallback(async () => {
    await refreshToday();
    if (visitedTabs.has("activity") && activityLoaded) {
      await refreshActivity();
    }
    if (visitedTabs.has("guides") && guidesLoaded) {
      await refreshGuides();
    }
  }, [
    refreshToday,
    visitedTabs,
    activityLoaded,
    guidesLoaded,
    refreshActivity,
    refreshGuides,
  ]);

  useEffect(() => {
    const onFocus = () => {
      void refreshOnFocus();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshOnFocus]);

  const stripeStep = today.setupStatus.steps.find((step) => step.id === "stripe");
  const pollStripe = useCallback(async () => {
    try {
      await fetch("/api/stripe/connect/status");
      await refreshToday();
    } catch {
      // Ignore polling errors. intentionally silent
    }
  }, [refreshToday]);

  useVisibilityPolling(
    pollStripe,
    60_000,
    stripeStep?.status === "in_progress",
  );

  const openGuide = useCallback((guide: AdminDocGuide) => {
    setActiveGuide(guide);
  }, []);

  const closeGuide = useCallback(() => {
    setActiveGuide(null);
  }, []);

  useEffect(() => {
    if (!activeGuide) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeGuide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeGuide, closeGuide]);

  const resolvedActiveTab = visibleTabs.includes(activeTab) ? activeTab : "today";

  return (
    <>
      <AdminDashboardStoryHeader
        theme={theme}
        schoolName={schoolName}
        userFirstName={userFirstName}
        activeTab={resolvedActiveTab}
        visibleTabs={visibleTabs}
        pendingTabKey={pendingTabKey}
        loadingTabKey={loadingTabKey}
        onTabChange={handleTabChange}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={resolvedActiveTab}
          id={`dashboard-panel-${resolvedActiveTab}`}
          role="tabpanel"
          aria-labelledby={`dashboard-tab-${resolvedActiveTab}`}
          className={DASHBOARD_TAB_ROOT_CLASS}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          {visitedTabs.has("today") ? (
            <div className={DASHBOARD_TAB_ROOT_CLASS} hidden={resolvedActiveTab !== "today"}>
              <AdminDashboardTodayPanel
                theme={theme}
                C={C}
                organizationId={organizationId}
                slug={slug}
                features={features}
                today={today}
                onTodayChange={setToday}
              />
            </div>
          ) : null}

          {visitedTabs.has("journey") ? (
            <div className={DASHBOARD_TAB_ROOT_CLASS} hidden={resolvedActiveTab !== "journey"}>
              <AdminDashboardJourneyPanel
                theme={theme}
                slug={slug}
                features={features}
              />
            </div>
          ) : null}

          {visitedTabs.has("activity") ? (
            <div className={DASHBOARD_TAB_ROOT_CLASS} hidden={resolvedActiveTab !== "activity"}>
              {activity ? (
                <AdminDashboardActivityPanel
                  theme={theme}
                  activity={activity}
                  onViewAllActivity={openNotifications}
                />
              ) : (
                <p className="text-sm" style={{ color: theme.muted }}>
                  Loading activity…
                </p>
              )}
            </div>
          ) : null}

          {visitedTabs.has("guides") ? (
            <div className={DASHBOARD_TAB_ROOT_CLASS} hidden={resolvedActiveTab !== "guides"}>
              {guides ? (
                <AdminDashboardGuidesPanel
                  theme={theme}
                  slug={slug}
                  guides={guides}
                  groupedHowToGuides={groupedHowToGuides}
                  buildLogHref={schoolMudKitchenPortalPath(slug, "build-log")}
                  onOpenGuide={openGuide}
                />
              ) : (
                <p className="text-sm" style={{ color: theme.muted }}>
                  Loading guides…
                </p>
              )}
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <AdminDocumentationGuidePanel
        C={C}
        guide={activeGuide}
        open={activeGuide != null}
        onClose={closeGuide}
      />
    </>
  );
}
