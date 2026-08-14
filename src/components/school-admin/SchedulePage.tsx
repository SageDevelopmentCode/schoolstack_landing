"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import AdmissionsAvailabilityEditor from "@/components/school-admin/admissions/AdmissionsAvailabilityEditor";
import AdmissionsObservationDayAvailabilityEditor from "@/components/school-admin/admissions/AdmissionsObservationDayAvailabilityEditor";
import ApplicationSubmissionDetailPanel from "@/components/school-admin/admissions/ApplicationSubmissionDetailPanel";
import ScheduledVisitsSection from "@/components/school-admin/ScheduledVisitsSection";
import ScheduleOverviewTab from "@/components/school-admin/schedule/ScheduleOverviewTab";
import SchoolEventsTab from "@/components/school-admin/schedule/SchoolEventsTab";
import ScheduleTabBar from "@/components/school-admin/schedule/ScheduleTabBar";
import ScheduleVisitLoadingPanel from "@/components/school-admin/schedule/ScheduleVisitLoadingPanel";
import { parseScheduleTab, SCHEDULE_TABS, type ScheduleTabId } from "@/components/school-admin/schedule/schedule-tabs";
import {
  listOrgScheduledVisits,
  type AdminScheduledVisit,
} from "@/lib/admissions/admin-scheduled-visits";
import {
  countAdmissionsAvailabilitySlotsInMonth,
  formatOrganizationTimezoneLabel,
  getOrganizationTimezone,
  todayMonthYearInTimezone,
} from "@/lib/admissions/admissions-availability";
import { countObservationDaysInMonth } from "@/lib/admissions/admissions-observation-availability";
import {
  getOrgApplicationSubmissionById,
  type AdminApplicationSubmission,
} from "@/lib/admissions/application-submissions";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type SchedulePageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
};

function formatHeaderStats(
  monthSlotCount: number | null,
  monthObservationDayCount: number | null,
  upcomingVisitCount: number | null,
): string {
  const parts: string[] = [];

  if (monthSlotCount != null) {
    parts.push(
      `${monthSlotCount} open slot${monthSlotCount === 1 ? "" : "s"}`,
    );
  }
  if (monthObservationDayCount != null) {
    parts.push(
      `${monthObservationDayCount} shadow day${monthObservationDayCount === 1 ? "" : "s"}`,
    );
  }
  if (upcomingVisitCount != null) {
    parts.push(
      `${upcomingVisitCount} upcoming visit${upcomingVisitCount === 1 ? "" : "s"}`,
    );
  }

  return parts.join(" · ");
}

export default function SchedulePage({
  organizationId,
  branding,
  schoolName,
  slug,
}: SchedulePageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = parseScheduleTab(searchParams.get("tab"));

  const [timezone, setTimezone] = useState("America/Chicago");
  const [monthSlotCount, setMonthSlotCount] = useState<number | null>(null);
  const [monthObservationDayCount, setMonthObservationDayCount] = useState<number | null>(
    null,
  );
  const [upcomingVisitCount, setUpcomingVisitCount] = useState<number | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(
    null,
  );
  const [selectedSubmission, setSelectedSubmission] =
    useState<AdminApplicationSubmission | null>(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);

  const timezoneLabel = formatOrganizationTimezoneLabel(timezone);
  const headerStats = formatHeaderStats(
    monthSlotCount,
    monthObservationDayCount,
    upcomingVisitCount,
  );

  const activePanel = SCHEDULE_TABS.find((tab) => tab.id === activeTab);

  const setActiveTab = useCallback(
    (tab: ScheduleTabId) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "overview") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadPageStats() {
      try {
        const tz = await getOrganizationTimezone(supabase, organizationId);
        if (cancelled) return;
        setTimezone(tz);

        const { year, month } = todayMonthYearInTimezone(tz);
        const [slotCount, dayCount, visits] = await Promise.all([
          countAdmissionsAvailabilitySlotsInMonth(supabase, organizationId, year, month),
          countObservationDaysInMonth(supabase, organizationId, year, month),
          listOrgScheduledVisits(supabase, organizationId),
        ]);

        if (!cancelled) {
          setMonthSlotCount(slotCount);
          setMonthObservationDayCount(dayCount);
          setUpcomingVisitCount(
            visits.filter((visit) => visit.timing === "upcoming").length,
          );
        }
      } catch {
        // Stats are supplementary; editors will still load their own data.
      }
    }

    void loadPageStats();

    return () => {
      cancelled = true;
    };
  }, [organizationId, supabase]);

  const handleVisitClick = useCallback(
    async (visit: AdminScheduledVisit) => {
      if (!visit.applicationId) {
        return;
      }

      if (selectedApplicationId === visit.applicationId) {
        setSelectedApplicationId(null);
        setSelectedSubmission(null);
        return;
      }

      setSelectedApplicationId(visit.applicationId);
      setLoadingSubmission(true);
      setSelectedSubmission(null);

      try {
        const submission = await getOrgApplicationSubmissionById(
          supabase,
          organizationId,
          visit.applicationId,
        );
        setSelectedSubmission(submission);
      } catch {
        setSelectedApplicationId(null);
      } finally {
        setLoadingSubmission(false);
      }
    },
    [organizationId, selectedApplicationId, supabase],
  );

  const handleClosePanel = useCallback(() => {
    setSelectedApplicationId(null);
    setSelectedSubmission(null);
  }, []);

  const handleMonthSlotCountChange = useCallback((count: number) => {
    setMonthSlotCount(count);
  }, []);

  const handleMonthDayCountChange = useCallback((count: number) => {
    setMonthObservationDayCount(count);
  }, []);

  const handleUpcomingCountChange = useCallback((count: number) => {
    setUpcomingVisitCount(count);
  }, []);

  return (
    <div className="relative flex h-full min-h-0 flex-col" style={{ backgroundColor: C.surface }}>
      <div
        className="flex flex-shrink-0 flex-col gap-1 px-4 py-3 sm:px-5"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold" style={{ color: C.textPrimary }}>
              Schedule
            </h1>
            {headerStats ? (
              <p className="mt-0.5 text-xs" style={{ color: C.textSecondary }}>
                {headerStats}
              </p>
            ) : null}
          </div>
          <p className="text-xs" style={{ color: C.textTertiary }}>
            {timezoneLabel}
          </p>
        </div>
      </div>

      <ScheduleTabBar C={C} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              id={`schedule-panel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`schedule-tab-${activeTab}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="px-4 py-5 sm:px-5"
            >
              {activeTab === "overview" ? (
                <ScheduleOverviewTab
                  C={C}
                  organizationId={organizationId}
                  monthSlotCount={monthSlotCount}
                  monthObservationDayCount={monthObservationDayCount}
                  selectedApplicationId={selectedApplicationId}
                  loadingSubmission={loadingSubmission}
                  onVisitClick={handleVisitClick}
                  onTabChange={setActiveTab}
                  onUpcomingCountChange={handleUpcomingCountChange}
                />
              ) : null}

              {activeTab === "events" ? (
                <SchoolEventsTab C={C} organizationId={organizationId} />
              ) : null}

              {activeTab === "tours" ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                        Tours & interviews
                      </h2>
                      {monthSlotCount !== null && monthSlotCount > 0 ? (
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                          style={{ backgroundColor: C.accentLight, color: C.accent }}
                        >
                          {monthSlotCount} open slot{monthSlotCount === 1 ? "" : "s"} this month
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs" style={{ color: C.textTertiary }}>
                      Set 30-minute time slots for campus tours and family interviews.
                    </p>
                  </div>
                  <AdmissionsAvailabilityEditor
                    C={C}
                    organizationId={organizationId}
                    onMonthSlotCountChange={handleMonthSlotCountChange}
                    compactLayout
                  />
                </div>
              ) : null}

              {activeTab === "shadow" ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                        Shadow / observation days
                      </h2>
                      {monthObservationDayCount !== null && monthObservationDayCount > 0 ? (
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                          style={{ backgroundColor: C.accentLight, color: C.accent }}
                        >
                          {monthObservationDayCount} open day
                          {monthObservationDayCount === 1 ? "" : "s"} this month
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs" style={{ color: C.textTertiary }}>
                      Configure whole-day, grade-targeted, or grade + time shadow visit slots.
                    </p>
                  </div>
                  <AdmissionsObservationDayAvailabilityEditor
                    C={C}
                    organizationId={organizationId}
                    onMonthDayCountChange={handleMonthDayCountChange}
                    compactLayout
                  />
                </div>
              ) : null}

              {activeTab === "visits" ? (
                <ScheduledVisitsSection
                  C={C}
                  organizationId={organizationId}
                  selectedApplicationId={selectedApplicationId}
                  loadingSubmission={loadingSubmission}
                  onVisitClick={handleVisitClick}
                  showHeader={false}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {loadingSubmission && selectedApplicationId ? (
          <ScheduleVisitLoadingPanel C={C} onClose={handleClosePanel} />
        ) : null}
        {selectedSubmission ? (
          <ApplicationSubmissionDetailPanel
            key={selectedSubmission.id}
            submission={selectedSubmission}
            organizationId={organizationId}
            branding={branding}
            schoolName={schoolName}
            schoolSlug={slug}
            onClose={handleClosePanel}
          />
        ) : null}
      </AnimatePresence>

      <span className="sr-only">{activePanel?.panelLabel}</span>
    </div>
  );
}
