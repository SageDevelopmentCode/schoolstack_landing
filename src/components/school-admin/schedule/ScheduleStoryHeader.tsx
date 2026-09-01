"use client";

import { Loader2 } from "lucide-react";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import ParentDatePill from "@/components/school-parent/ui/ParentDatePill";
import ParentStoryPillNav from "@/components/school-parent/ui/ParentStoryPillNav";
import { SCHEDULE_TABS, type ScheduleTabId } from "./schedule-tabs";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ScheduleStoryHeaderProps = {
  theme: ParentThemeTokens;
  activeTab: ScheduleTabId;
  timezoneLabel: string;
  monthSlotCount: number | null;
  monthObservationDayCount: number | null;
  upcomingVisitCount: number | null;
  pendingTabKey?: ScheduleTabId | null;
  loadingTabKey?: ScheduleTabId | null;
  onTabChange: (tab: ScheduleTabId) => void;
};

function formatOverviewSubtitle(
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

function subtitleForTab(
  tab: ScheduleTabId,
  monthSlotCount: number | null,
  monthObservationDayCount: number | null,
  upcomingVisitCount: number | null,
): string {
  switch (tab) {
    case "overview":
      return (
        formatOverviewSubtitle(
          monthSlotCount,
          monthObservationDayCount,
          upcomingVisitCount,
        ) || "Tours, shadow days, and school events in one place"
      );
    case "events":
      return "School-wide events families see in the parent portal";
    case "tours":
      return "Set 30-minute slots for campus tours and family interviews";
    case "shadow":
      return "Configure whole-day, grade-targeted, or grade + time shadow visits";
    case "visits":
      return "Every booked tour, interview, and shadow day";
  }
}

function isTabLoading(
  tabId: ScheduleTabId,
  pendingTabKey?: ScheduleTabId | null,
  loadingTabKey?: ScheduleTabId | null,
): boolean {
  return pendingTabKey === tabId || loadingTabKey === tabId;
}

export default function ScheduleStoryHeader({
  theme,
  activeTab,
  timezoneLabel,
  monthSlotCount,
  monthObservationDayCount,
  upcomingVisitCount,
  pendingTabKey = null,
  loadingTabKey = null,
  onTabChange,
}: ScheduleStoryHeaderProps) {
  const subtitle = subtitleForTab(
    activeTab,
    monthSlotCount,
    monthObservationDayCount,
    upcomingVisitCount,
  );

  const pillItems = SCHEDULE_TABS.map((tab) => {
    const tabLoading = isTabLoading(tab.id, pendingTabKey, loadingTabKey);
    return {
      key: tab.id,
      label: tab.label,
      ariaBusy: tabLoading,
      suffix: tabLoading ? (
        <Loader2
          className="h-3 w-3 animate-spin"
          data-testid="schedule-tab-loading"
        />
      ) : undefined,
    };
  });

  return (
    <div className="mb-5 flex flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end sm:gap-5">
        <div className="min-w-0">
          <AdminSectionKicker theme={theme}>School calendar</AdminSectionKicker>
          <AdminDisplayHeading theme={theme} as="h1" size="section" className="mt-1.5">
            Schedule
          </AdminDisplayHeading>
          <p className="mt-2 text-[13px]" style={{ color: theme.muted }}>
            {subtitle}
          </p>
        </div>
        <ParentDatePill theme={theme} label={timezoneLabel} />
      </div>

      <ParentStoryPillNav
        theme={theme}
        items={pillItems}
        activeKey={activeTab}
        onChange={(key) => onTabChange(key as ScheduleTabId)}
        ariaLabel="Schedule sections"
        data-testid="schedule-tab-nav"
      />
    </div>
  );
}
