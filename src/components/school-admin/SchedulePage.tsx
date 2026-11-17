"use client";

import { Globe2, Loader2, Lock } from "lucide-react";
import ToursInterviewsTabContent from "@/components/school-admin/schedule/ToursInterviewsTabContent";
import AdmissionsObservationDayAvailabilityEditor from "@/components/school-admin/admissions/AdmissionsObservationDayAvailabilityEditor";
import ApplicationSubmissionDetailPanel from "@/components/school-admin/admissions/ApplicationSubmissionDetailPanel";
import ScheduledVisitsSection from "@/components/school-admin/ScheduledVisitsSection";
import ScheduleOverviewTab from "@/components/school-admin/schedule/ScheduleOverviewTab";
import ScheduleEventPermissionsTab from "@/components/school-admin/schedule/ScheduleEventPermissionsTab";
import SchoolEventsTab from "@/components/school-admin/schedule/SchoolEventsTab";
import ScheduleVisitLoadingPanel from "@/components/school-admin/schedule/ScheduleVisitLoadingPanel";
import {
  FREE_PLAN_LOCKED_SCHEDULE_TABS,
  SCHEDULE_TABS,
  type ScheduleTabId,
} from "@/components/school-admin/schedule/schedule-tabs";
import { useScheduleModel } from "@/components/school-admin/schedule/useScheduleModel";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import { AdminGardenPage, AdminGardenPageHeader } from "@/components/school-admin/garden/kit";
import { GCard, GChip } from "@/components/school-parent/garden/ui";
import type { SchedulePageMeta } from "@/lib/school-admin/schedule-page-meta";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { FREE_PLAN_SCHEDULE_UPGRADE_LABELS } from "@/lib/school-admin/free-plan-upgrade";
import { useFreePlanUpgrade } from "@/lib/school-admin/free-plan-upgrade-context";

const NO_LOCKED_TABS: readonly ScheduleTabId[] = [];

type SchedulePageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
  initialMeta: SchedulePageMeta;
  visitsDeferred?: boolean;
};

/** Schedule (admin Garden): overview, events, permissions, tours, shadow days, visits. */
export default function SchedulePage({
  organizationId,
  branding,
  schoolName,
  slug,
  initialMeta,
  visitsDeferred = false,
}: SchedulePageProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  // Free plan: only Tours & interviews and All visits open; the rest show a lock.
  const openUpgrade = useFreePlanUpgrade();
  const lockedTabs = openUpgrade ? FREE_PLAN_LOCKED_SCHEDULE_TABS : NO_LOCKED_TABS;
  const model = useScheduleModel({ organizationId, initialMeta, lockedTabs });
  const { activeTab, visitedTabs, refreshToken } = model;

  const tabItems = SCHEDULE_TABS.map((tab) => {
    const locked = lockedTabs.includes(tab.id);
    const loading = model.pendingTabKey === tab.id || model.loadingTabKey === tab.id;
    return {
      key: tab.id,
      label: tab.label,
      ariaBusy: loading,
      testId: `schedule-tab-${tab.id}`,
      suffix: locked ? (
        <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[var(--sf-ink)]/[0.07] text-[var(--sf-ink)]/55">
          <Lock className="h-2.5 w-2.5" strokeWidth={2.8} aria-hidden />
          <span className="sr-only">, locked</span>
        </span>
      ) : loading ? (
        <Loader2 className="h-3 w-3 animate-spin" data-testid="schedule-tab-loading" aria-hidden />
      ) : undefined,
    };
  });

  const handleTabSelect = (key: ScheduleTabId) => {
    if (openUpgrade && lockedTabs.includes(key)) {
      openUpgrade(FREE_PLAN_SCHEDULE_UPGRADE_LABELS[key] ?? "Schedule");
      return;
    }
    model.handleTabChange(key);
  };

  const panel = (id: ScheduleTabId, children: React.ReactNode) =>
    visitedTabs.has(id) ? (
      <div
        hidden={activeTab !== id}
        id={`schedule-panel-${id}`}
        role="tabpanel"
        aria-label={SCHEDULE_TABS.find((tab) => tab.id === id)?.panelLabel}
      >
        {children}
      </div>
    ) : null;

  const overlays = (
    <>
      {model.selectedApplicationId && (model.loadingSubmission || model.submissionError) ? (
        <ScheduleVisitLoadingPanel
          theme={theme}
          error={model.submissionError}
          onRetry={model.retrySubmission}
          onClose={model.handleClosePanel}
        />
      ) : null}
      {model.selectedSubmission ? (
        <ApplicationSubmissionDetailPanel
          key={model.selectedSubmission.id}
          submission={model.selectedSubmission}
          organizationId={organizationId}
          branding={branding}
          schoolName={schoolName}
          schoolSlug={slug}
          onClose={model.handleClosePanel}
          appearance="garden"
        />
      ) : null}
    </>
  );

  return (
    <AdminGardenPage theme={theme} skinOverlays overlays={overlays} data-testid="admin-schedule-page">
      <AdminGardenPageHeader
        kicker="School calendar"
        title={<span className="text-[var(--sf-clay)]">Schedule</span>}
        subtitle={model.statusLine}
        refresh={{
          onRefresh: () => void model.refresh(),
          refreshing: model.refreshing,
          lastUpdatedAt: model.lastUpdatedAt,
          label: "Refresh schedule",
        }}
        actions={
          <GChip tone="neutral" className="!normal-case">
            <Globe2 className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden />
            {model.timezoneLabel}
          </GChip>
        }
        tabs={{
          items: tabItems,
          activeKey: activeTab,
          onChange: (key) => handleTabSelect(key as ScheduleTabId),
          ariaLabel: "Schedule sections",
          "data-testid": "schedule-tab-nav",
        }}
      />

      {panel(
        "overview",
        <ScheduleOverviewTab
          organizationId={organizationId}
          monthSlotCount={model.monthSlotCount}
          monthObservationDayCount={model.monthObservationDayCount}
          selectedApplicationId={model.selectedApplicationId}
          loadingSubmission={model.loadingSubmission}
          onVisitClick={model.handleVisitClick}
          onTabChange={model.handleTabChange}
          onUpcomingCountChange={model.setOverviewCount}
          onLoadingChange={(loading) => model.reportTabLoading("overview", loading)}
          visitsDeferred={visitsDeferred}
          timezone={model.timezone}
          refreshToken={refreshToken}
        />,
      )}

      {panel(
        "events",
        <SchoolEventsTab
          key={`events-${refreshToken}`}
          theme={theme}
          C={C}
          organizationId={organizationId}
          onLoadingChange={(loading) => model.reportTabLoading("events", loading)}
        />,
      )}

      {panel(
        "permissions",
        <ScheduleEventPermissionsTab
          key={`permissions-${refreshToken}`}
          organizationId={organizationId}
          slug={slug}
          onLoadingChange={(loading) => model.reportTabLoading("permissions", loading)}
          onPermittedStaffCountChange={model.setPermittedStaffCount}
        />,
      )}

      {panel(
        "tours",
        <GCard index={1}>
          <ToursInterviewsTabContent
            key={`tours-${refreshToken}`}
            C={C}
            organizationId={organizationId}
            schoolSlug={slug}
            onMonthSlotCountChange={model.setMonthSlotCount}
            onLoadingChange={(loading) => model.reportTabLoading("tours", loading)}
            visitsDeferred={visitsDeferred}
          />
        </GCard>,
      )}

      {panel(
        "shadow",
        <GCard index={1}>
          <AdmissionsObservationDayAvailabilityEditor
            key={`shadow-${refreshToken}`}
            C={C}
            organizationId={organizationId}
            onMonthDayCountChange={model.setMonthObservationDayCount}
            compactLayout
            storySurface
            onLoadingChange={(loading) => model.reportTabLoading("shadow", loading)}
          />
        </GCard>,
      )}

      {panel(
        "visits",
        <ScheduledVisitsSection
          selectedApplicationId={model.selectedApplicationId}
          loadingSubmission={model.loadingSubmission}
          onVisitClick={model.handleVisitClick}
          onLoadingChange={(loading) => model.reportTabLoading("visits", loading)}
          visitsDeferred={visitsDeferred}
        />,
      )}

      <span className="sr-only" aria-live="polite">
        {model.activePanel?.panelLabel}
      </span>
    </AdminGardenPage>
  );
}
