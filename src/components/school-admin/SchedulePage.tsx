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
import ScheduleStoryHeader from "@/components/school-admin/schedule/ScheduleStoryHeader";
import ScheduleVisitLoadingPanel from "@/components/school-admin/schedule/ScheduleVisitLoadingPanel";
import { parseScheduleTab, SCHEDULE_TABS, type ScheduleTabId } from "@/components/school-admin/schedule/schedule-tabs";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
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
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type SchedulePageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
};

export default function SchedulePage({
  organizationId,
  branding,
  schoolName,
  slug,
}: SchedulePageProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
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
  const [pendingTabKey, setPendingTabKey] = useState<ScheduleTabId | null>(null);
  const [loadingTabKey, setLoadingTabKey] = useState<ScheduleTabId | null>(null);

  const timezoneLabel = formatOrganizationTimezoneLabel(timezone);
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

  const handleTabChange = useCallback(
    (tab: ScheduleTabId) => {
      if (tab !== activeTab) {
        setPendingTabKey(tab);
      }
      setActiveTab(tab);
    },
    [activeTab, setActiveTab],
  );

  const reportTabLoading = useCallback((tab: ScheduleTabId, loading: boolean) => {
    if (loading) {
      setLoadingTabKey(tab);
      return;
    }
    setLoadingTabKey((current) => (current === tab ? null : current));
    setPendingTabKey((current) => (current === tab ? null : current));
  }, []);

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
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px] pb-14">
          <ScheduleStoryHeader
            theme={theme}
            activeTab={activeTab}
            timezoneLabel={timezoneLabel}
            monthSlotCount={monthSlotCount}
            monthObservationDayCount={monthObservationDayCount}
            upcomingVisitCount={upcomingVisitCount}
            pendingTabKey={pendingTabKey}
            loadingTabKey={loadingTabKey}
            onTabChange={handleTabChange}
          />

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
            >
              {activeTab === "overview" ? (
                <ScheduleOverviewTab
                  theme={theme}
                  C={C}
                  organizationId={organizationId}
                  monthSlotCount={monthSlotCount}
                  monthObservationDayCount={monthObservationDayCount}
                  selectedApplicationId={selectedApplicationId}
                  loadingSubmission={loadingSubmission}
                  onVisitClick={handleVisitClick}
                  onTabChange={handleTabChange}
                  onUpcomingCountChange={handleUpcomingCountChange}
                  onLoadingChange={(loading) => reportTabLoading("overview", loading)}
                />
              ) : null}

              {activeTab === "events" ? (
                <SchoolEventsTab
                  theme={theme}
                  C={C}
                  organizationId={organizationId}
                  onLoadingChange={(loading) => reportTabLoading("events", loading)}
                />
              ) : null}

              {activeTab === "tours" ? (
                <AdminCard theme={theme}>
                  <AdmissionsAvailabilityEditor
                    C={C}
                    organizationId={organizationId}
                    onMonthSlotCountChange={handleMonthSlotCountChange}
                    compactLayout
                    storySurface
                    onLoadingChange={(loading) => reportTabLoading("tours", loading)}
                  />
                </AdminCard>
              ) : null}

              {activeTab === "shadow" ? (
                <AdminCard theme={theme}>
                  <AdmissionsObservationDayAvailabilityEditor
                    C={C}
                    organizationId={organizationId}
                    onMonthDayCountChange={handleMonthDayCountChange}
                    compactLayout
                    storySurface
                    onLoadingChange={(loading) => reportTabLoading("shadow", loading)}
                  />
                </AdminCard>
              ) : null}

              {activeTab === "visits" ? (
                <ScheduledVisitsSection
                  theme={theme}
                  C={C}
                  organizationId={organizationId}
                  selectedApplicationId={selectedApplicationId}
                  loadingSubmission={loadingSubmission}
                  onVisitClick={handleVisitClick}
                  showHeader={false}
                  onLoadingChange={(loading) => reportTabLoading("visits", loading)}
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
