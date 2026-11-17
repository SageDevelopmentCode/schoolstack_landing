"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  parseDashboardTab,
  type DashboardTabId,
} from "@/components/school-admin/dashboard/dashboard-tabs";
import type {
  AdminDashboardActivity,
  AdminDashboardGuides,
  AdminDashboardSummary,
  AdminDashboardToday,
} from "@/lib/school-admin/dashboard-summary";
import {
  buildAdminDocumentationGuides,
  groupAdminDocumentationByCategory,
  type AdminDocGuide,
} from "@/lib/school-admin/admin-documentation";
import type { OrganizationPlan } from "@/lib/organization-settings/plans";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import { useVisibilityPolling } from "@/lib/hooks/use-visibility-polling";
import {
  buildJourneySections,
  hasJourneyNavigator,
} from "@/lib/school-admin/dashboard-family-journey";

export type AdminDashboardModelInput = {
  organizationId: string;
  slug: string;
  plan: OrganizationPlan;
  features: OrganizationFeatures;
  /**
   * Today's data. In `previewMode` this may be a full `AdminDashboardSummary`
   * (marketing demos): Activity and Guides then come from it, not the API.
   */
  initialToday: AdminDashboardToday | AdminDashboardSummary;
  /**
   * Marketing demos: tabs switch locally (no URL change) and nothing is
   * fetched (no lazy sections, focus refresh or Stripe polling). Real
   * routes never pass it.
   */
  previewMode?: boolean;
};

export type DashboardSectionId = "today" | "activity" | "guides";

export function dashboardSectionFetch(
  organizationId: string,
  slug: string,
  section: DashboardSectionId,
): string {
  const params = new URLSearchParams({ organizationId, slug, section });
  return `/api/school-admin/dashboard-summary?${params.toString()}`;
}

function tabNeedsAsyncLoad(tab: DashboardTabId): boolean {
  return tab === "activity" || tab === "guides";
}

/** Activity / Guides carried on a preview summary (empty when absent). */
function previewSections(initialToday: AdminDashboardModelInput["initialToday"]): {
  activity: AdminDashboardActivity;
  guides: AdminDashboardGuides;
} {
  const summary = initialToday as Partial<AdminDashboardSummary>;
  return {
    activity: {
      recentActivity: summary.recentActivity ?? [],
      quickActions: summary.quickActions ?? [],
    },
    guides: { featureAnnouncements: summary.featureAnnouncements ?? [] },
  };
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

/**
 * Shared view-model for the admin Dashboard tab: tab state (in `?tab=`),
 * lazy Activity/Guides loading, refresh on window focus, Stripe setup polling
 * and the how-to guide drawer. Used by the story dashboard and the Garden
 * variants so business logic is never forked.
 */
export function useAdminDashboardModel({
  organizationId,
  slug,
  plan,
  features,
  initialToday,
  previewMode = false,
}: AdminDashboardModelInput) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Preview keeps the tab in local state; live routes keep it in `?tab=`.
  const [previewTab, setPreviewTab] = useState<DashboardTabId>("today");
  const activeTab = previewMode ? previewTab : parseDashboardTab(searchParams.get("tab"));

  const [today, setToday] = useState<AdminDashboardToday>(initialToday);
  const [prevInitialToday, setPrevInitialToday] = useState(initialToday);
  const [activity, setActivity] = useState<AdminDashboardActivity | null>(() =>
    previewMode ? previewSections(initialToday).activity : null,
  );
  const [guides, setGuides] = useState<AdminDashboardGuides | null>(() =>
    previewMode ? previewSections(initialToday).guides : null,
  );
  const [activityError, setActivityError] = useState(false);
  const [guidesError, setGuidesError] = useState(false);
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
  const [activityLoaded, setActivityLoaded] = useState(previewMode);
  const [guidesLoaded, setGuidesLoaded] = useState(previewMode);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number>(() => Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const activityFetchStartedRef = useRef(false);
  const guidesFetchStartedRef = useRef(false);

  const howToGuides = useMemo(
    () => buildAdminDocumentationGuides(slug, features, plan),
    [slug, features, plan],
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
    if (previewMode) {
      const sections = previewSections(initialToday);
      setActivity(sections.activity);
      setGuides(sections.guides);
    }
  }

  const setActiveTab = useCallback(
    (tab: DashboardTabId) => {
      if (previewMode) {
        setPreviewTab(tab);
        return;
      }
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "today") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, previewMode, router, searchParams],
  );

  const loadActivity = useCallback(async () => {
    // Defer so callers inside effects never set state synchronously.
    await Promise.resolve();
    if (previewMode || activityLoaded || activityFetchStartedRef.current) {
      setLoadingTabKey((current) => (current === "activity" ? null : current));
      setPendingTabKey((current) => (current === "activity" ? null : current));
      return;
    }
    activityFetchStartedRef.current = true;
    setLoadingTabKey("activity");
    setActivityError(false);
    try {
      const response = await fetch(
        dashboardSectionFetch(organizationId, slug, "activity"),
      );
      if (!response.ok) {
        setActivityError(true);
        return;
      }
      const next = (await response.json()) as AdminDashboardActivity;
      setActivity(next);
      setActivityLoaded(true);
    } catch {
      setActivityError(true);
    } finally {
      setLoadingTabKey((current) => (current === "activity" ? null : current));
      setPendingTabKey((current) => (current === "activity" ? null : current));
    }
  }, [activityLoaded, organizationId, previewMode, slug]);

  const loadGuides = useCallback(async () => {
    // Defer so callers inside effects never set state synchronously.
    await Promise.resolve();
    if (previewMode || guidesLoaded || guidesFetchStartedRef.current) {
      setLoadingTabKey((current) => (current === "guides" ? null : current));
      setPendingTabKey((current) => (current === "guides" ? null : current));
      return;
    }
    guidesFetchStartedRef.current = true;
    setLoadingTabKey("guides");
    setGuidesError(false);
    try {
      const response = await fetch(
        dashboardSectionFetch(organizationId, slug, "guides"),
      );
      if (!response.ok) {
        setGuidesError(true);
        return;
      }
      const next = (await response.json()) as AdminDashboardGuides;
      setGuides(next);
      setGuidesLoaded(true);
    } catch {
      setGuidesError(true);
    } finally {
      setLoadingTabKey((current) => (current === "guides" ? null : current));
      setPendingTabKey((current) => (current === "guides" ? null : current));
    }
  }, [guidesLoaded, organizationId, previewMode, slug]);

  /** Retry a lazy section after a failed first load. */
  const retrySection = useCallback(
    (section: "activity" | "guides") => {
      if (section === "activity") {
        activityFetchStartedRef.current = false;
        setActivityError(false);
        void loadActivity();
      } else {
        guidesFetchStartedRef.current = false;
        setGuidesError(false);
        void loadGuides();
      }
    },
    [loadActivity, loadGuides],
  );

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

  /** Returns true when fresh data arrived. */
  const refreshToday = useCallback(async (): Promise<boolean> => {
    if (previewMode) {
      // Nothing to fetch: the fixtures are the latest data.
      setLastUpdatedAt(Date.now());
      return true;
    }
    try {
      const response = await fetch(
        dashboardSectionFetch(organizationId, slug, "today"),
      );
      if (!response.ok) return false;
      const next = (await response.json()) as AdminDashboardToday;
      setToday(next);
      setLastUpdatedAt(Date.now());
      return true;
    } catch {
      // Keep last known today payload. intentionally silent
      return false;
    }
  }, [organizationId, previewMode, slug]);

  useEffect(() => {
    queueMicrotask(() => {
      if (visitedTabs.has("activity")) {
        void loadActivity();
      }
      if (visitedTabs.has("guides")) {
        void loadGuides();
      }
    });
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
      // Deferred: in preview this sets local state (never synchronously in an effect).
      queueMicrotask(() => setActiveTab("today"));
    }
  }, [activeTab, visibleTabs, setActiveTab]);

  const refreshActivity = useCallback(async () => {
    if (previewMode) return;
    try {
      const response = await fetch(
        dashboardSectionFetch(organizationId, slug, "activity"),
      );
      if (!response.ok) return;
      const next = (await response.json()) as AdminDashboardActivity;
      setActivity(next);
      setActivityLoaded(true);
      setActivityError(false);
    } catch {
      // Keep last known activity payload. intentionally silent
    }
  }, [organizationId, previewMode, slug]);

  const refreshGuides = useCallback(async () => {
    if (previewMode) return;
    try {
      const response = await fetch(
        dashboardSectionFetch(organizationId, slug, "guides"),
      );
      if (!response.ok) return;
      const next = (await response.json()) as AdminDashboardGuides;
      setGuides(next);
      setGuidesLoaded(true);
      setGuidesError(false);
    } catch {
      // Keep last known guides payload. intentionally silent
    }
  }, [organizationId, previewMode, slug]);

  const refreshOnFocus = useCallback(async () => {
    const ok = await refreshToday();
    if (visitedTabs.has("activity") && activityLoaded) {
      await refreshActivity();
    }
    if (visitedTabs.has("guides") && guidesLoaded) {
      await refreshGuides();
    }
    return ok;
  }, [
    refreshToday,
    visitedTabs,
    activityLoaded,
    guidesLoaded,
    refreshActivity,
    refreshGuides,
  ]);

  useEffect(() => {
    if (previewMode) return;
    const onFocus = () => {
      void refreshOnFocus();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [previewMode, refreshOnFocus]);

  /** Manual "Refresh" button. Resolves true when today's data refreshed. */
  const refreshAll = useCallback(async (): Promise<boolean> => {
    setRefreshing(true);
    try {
      return await refreshOnFocus();
    } finally {
      setRefreshing(false);
    }
  }, [refreshOnFocus]);

  const stripeStep = today.setupStatus.steps.find((step) => step.id === "stripe");
  const stripeChecking = stripeStep?.status === "in_progress";
  const pollStripe = useCallback(async () => {
    try {
      await fetch("/api/stripe/connect/status");
      await refreshToday();
    } catch {
      // Ignore polling errors. intentionally silent
    }
  }, [refreshToday]);

  useVisibilityPolling(pollStripe, 60_000, stripeChecking && !previewMode);

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

  return {
    today,
    setToday,
    refreshToday,
    refreshAll,
    refreshing,
    lastUpdatedAt,
    stripeChecking,
    activity,
    activityError,
    guides,
    guidesError,
    retrySection,
    howToGuides,
    groupedHowToGuides,
    journeySections,
    visibleTabs,
    visitedTabs,
    activeTab: resolvedActiveTab,
    pendingTabKey,
    loadingTabKey,
    handleTabChange,
    activeGuide,
    openGuide,
    closeGuide,
  };
}

export type AdminDashboardModel = ReturnType<typeof useAdminDashboardModel>;
