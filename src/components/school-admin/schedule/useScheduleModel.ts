"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parseScheduleTab, SCHEDULE_TABS, type ScheduleTabId } from "@/components/school-admin/schedule/schedule-tabs";
import { useScheduleVisitsContext } from "@/components/school-admin/schedule/schedule-visits-context";
import type { AdminScheduledVisit } from "@/lib/admissions/admin-scheduled-visits";
import { formatOrganizationTimezoneLabel } from "@/lib/admissions/admissions-availability";
import {
  getOrgApplicationSubmissionById,
  type AdminApplicationSubmission,
} from "@/lib/admissions/application-submissions";
import type { SchedulePageMeta } from "@/lib/school-admin/schedule-page-meta";
import { upcomingVisitCountFromVisits } from "@/lib/school-admin/schedule-page-meta";
import { formatPermittedStaffCountLabel } from "@/lib/school-events/schedule-settings";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { createClient } from "@/utils/supabase/client";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

/*
 * Schedule view-model (admin Garden). Same behaviour as the old SchedulePage:
 * tab in `?tab=`, tabs mount the first time they're visited and stay mounted,
 * a spinner on a tab while it loads, live month counts reported up by the
 * editors, and the visit → application drawer. New: Refresh (visits + the
 * open tab), and a load error in the drawer instead of closing silently.
 */

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

export function scheduleStatusLine({
  tab,
  monthSlotCount,
  monthObservationDayCount,
  upcomingVisitCount,
  permittedStaffCount,
}: {
  tab: ScheduleTabId;
  monthSlotCount: number | null;
  monthObservationDayCount: number | null;
  upcomingVisitCount: number | null;
  permittedStaffCount: number | null;
}): string {
  switch (tab) {
    case "overview": {
      const parts: string[] = [];
      if (monthSlotCount != null) parts.push(plural(monthSlotCount, "open slot"));
      if (monthObservationDayCount != null) parts.push(plural(monthObservationDayCount, "shadow day"));
      if (upcomingVisitCount != null) parts.push(plural(upcomingVisitCount, "upcoming visit"));
      return parts.join(" · ") || "Tours, shadow days, and school events in one place";
    }
    case "events":
      return "School-wide events families see in the parent portal";
    case "permissions":
      return formatPermittedStaffCountLabel(permittedStaffCount ?? 0);
    case "tours":
      return "Set 30-minute slots for campus tours and family interviews";
    case "shadow":
      return "Configure whole-day, grade-targeted, or grade + time shadow visits";
    case "visits":
      return "Every booked tour, interview, and shadow day";
  }
}

const NO_LOCKED_TABS: readonly ScheduleTabId[] = [];

export function useScheduleModel({
  organizationId,
  initialMeta,
  lockedTabs = NO_LOCKED_TABS,
}: {
  organizationId: string;
  initialMeta: SchedulePageMeta;
  /** Free plan: tabs that never open (the page shows the unlock popup). */
  lockedTabs?: readonly ScheduleTabId[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const { visits, visitsReady, refetchVisits } = useScheduleVisitsContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = parseScheduleTab(searchParams.get("tab"), lockedTabs);

  const [timezone] = useState(initialMeta.timezone);
  const [monthSlotCount, setMonthSlotCount] = useState<number | null>(initialMeta.monthSlotCount);
  const [monthObservationDayCount, setMonthObservationDayCount] = useState<number | null>(
    initialMeta.monthObservationDayCount,
  );
  const [overviewCount, setOverviewCount] = useState<number | null>(null);
  const [visitedTabs, setVisitedTabs] = useState<Set<ScheduleTabId>>(() => new Set([activeTab]));
  const [permittedStaffCount, setPermittedStaffCount] = useState<number | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<AdminApplicationSubmission | null>(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [lastVisit, setLastVisit] = useState<AdminScheduledVisit | null>(null);
  const [pendingTabKey, setPendingTabKey] = useState<ScheduleTabId | null>(null);
  const [loadingTabKey, setLoadingTabKey] = useState<ScheduleTabId | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());

  const visitsCount = visitsReady ? upcomingVisitCountFromVisits(visits) : null;
  const upcomingVisitCount = visitsCount ?? overviewCount ?? initialMeta.upcomingVisitCount;
  const timezoneLabel = formatOrganizationTimezoneLabel(timezone);
  const activePanel = SCHEDULE_TABS.find((tab) => tab.id === activeTab);

  const setActiveTab = useCallback(
    (tab: ScheduleTabId) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "overview") {
        params.delete("tab");
        params.delete("toursSubtab");
      } else {
        params.set("tab", tab);
        if (tab !== "tours") params.delete("toursSubtab");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleTabChange = useCallback(
    (tab: ScheduleTabId) => {
      if (lockedTabs.includes(tab)) return;
      setVisitedTabs((current) => {
        if (current.has(tab)) return current;
        const next = new Set(current);
        next.add(tab);
        return next;
      });
      if (tab !== activeTab) setPendingTabKey(tab);
      setActiveTab(tab);
    },
    [activeTab, lockedTabs, setActiveTab],
  );

  const reportTabLoading = useCallback((tab: ScheduleTabId, loading: boolean) => {
    if (loading) {
      setLoadingTabKey(tab);
      return;
    }
    setLoadingTabKey((current) => (current === tab ? null : current));
    setPendingTabKey((current) => (current === tab ? null : current));
  }, []);

  const loadSubmission = useCallback(
    async (visit: AdminScheduledVisit) => {
      if (!visit.applicationId) return;
      setLastVisit(visit);
      setSelectedApplicationId(visit.applicationId);
      setLoadingSubmission(true);
      setSelectedSubmission(null);
      setSubmissionError(null);
      try {
        const submission = await getOrgApplicationSubmissionById(supabase, organizationId, visit.applicationId);
        setSelectedSubmission(submission);
      } catch (err) {
        void reportPortalOperationalError(
          "school_admin",
          {
            organizationId,
            operation: "schedule.visit_submission.load",
            error: "",
            entityType: "application",
            entityId: visit.applicationId,
          },
          err,
        );
        setSubmissionError(formatActionError(err, "Could not load this application."));
      } finally {
        setLoadingSubmission(false);
      }
    },
    [organizationId, supabase],
  );

  const handleVisitClick = useCallback(
    async (visit: AdminScheduledVisit) => {
      if (!visit.applicationId) return;
      if (selectedApplicationId === visit.applicationId && !submissionError) {
        setSelectedApplicationId(null);
        setSelectedSubmission(null);
        return;
      }
      await loadSubmission(visit);
    },
    [loadSubmission, selectedApplicationId, submissionError],
  );

  const retrySubmission = useCallback(() => {
    if (lastVisit) void loadSubmission(lastVisit);
  }, [lastVisit, loadSubmission]);

  const handleClosePanel = useCallback(() => {
    setSelectedApplicationId(null);
    setSelectedSubmission(null);
    setSubmissionError(null);
  }, []);

  const refreshRef = useRef<() => Promise<void>>(async () => {});
  /** Refresh visits (shared by every tab) and re-mount the open tab so it reloads. */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    const ok = await refetchVisits();
    setRefreshToken((token) => token + 1);
    setRefreshing(false);
    if (ok) {
      setLastUpdatedAt(Date.now());
      adminToast.dismiss("schedule-refresh-error");
      adminToast.success("Schedule is up to date.", {
        id: "schedule-refresh",
        description: "Visits and this tab were reloaded.",
      });
    } else {
      adminToast.error("Couldn't refresh visits.", {
        id: "schedule-refresh-error",
        description: "The visits on screen are from the last load.",
        action: { label: "Retry", onClick: () => void refreshRef.current() },
      });
    }
  }, [refetchVisits]);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  return {
    activeTab,
    activePanel,
    visitedTabs,
    handleTabChange,
    reportTabLoading,
    pendingTabKey,
    loadingTabKey,
    timezone,
    timezoneLabel,
    monthSlotCount,
    setMonthSlotCount,
    monthObservationDayCount,
    setMonthObservationDayCount,
    upcomingVisitCount,
    setOverviewCount,
    permittedStaffCount,
    setPermittedStaffCount,
    selectedApplicationId,
    selectedSubmission,
    loadingSubmission,
    submissionError,
    handleVisitClick,
    retrySubmission,
    handleClosePanel,
    refresh,
    refreshing,
    refreshToken,
    lastUpdatedAt,
    statusLine: scheduleStatusLine({
      tab: activeTab,
      monthSlotCount,
      monthObservationDayCount,
      upcomingVisitCount,
      permittedStaffCount,
    }),
  };
}

export type ScheduleModel = ReturnType<typeof useScheduleModel>;
