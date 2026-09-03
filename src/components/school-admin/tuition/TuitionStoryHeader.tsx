"use client";

import { Loader2, Plus } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import ParentStoryPillNav from "@/components/school-parent/ui/ParentStoryPillNav";
import TuitionSetupButton from "@/components/school-admin/tuition/TuitionSetupButton";
import {
  TUITION_DASHBOARD_TABS,
  type TuitionDashboardTabId,
} from "@/components/school-admin/tuition/tuition-dashboard-tabs";
import { formatCents } from "@/lib/tuition/pricing";
import type { TuitionReadinessStatus } from "@/lib/tuition/tuition-readiness";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type TuitionKpis = {
  collectedYtdCents: number;
  outstandingCents: number;
  familiesAtRisk: number;
  activeAssignments: number;
};

type TuitionStoryHeaderProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  activeTab: TuitionDashboardTabId;
  kpis: TuitionKpis;
  readiness: TuitionReadinessStatus | null;
  pendingTabKey?: TuitionDashboardTabId | null;
  loadingTabKey?: TuitionDashboardTabId | null;
  onTabChange: (tab: TuitionDashboardTabId) => void;
  onOpenSetupPanel: () => void;
  onOpenSetupWizard: () => void;
};

function subtitleForTab(tab: TuitionDashboardTabId, kpis: TuitionKpis): string {
  const overviewParts: string[] = [
    `${formatCents(kpis.collectedYtdCents)} collected YTD`,
    `${formatCents(kpis.outstandingCents)} outstanding`,
  ];
  if (kpis.familiesAtRisk > 0) {
    overviewParts.push(
      `${kpis.familiesAtRisk} ${kpis.familiesAtRisk === 1 ? "family" : "families"} at risk`,
    );
  }

  switch (tab) {
    case "families":
      return overviewParts.join(" · ") || "Manage family billing, schedules, and payments";
    case "catalog":
      return "Rate plans, payment options, and fees for each program";
    case "rules":
      return "Late fees and tuition adjustment rules";
  }
}

function isTabLoading(
  tabId: TuitionDashboardTabId,
  pendingTabKey?: TuitionDashboardTabId | null,
  loadingTabKey?: TuitionDashboardTabId | null,
): boolean {
  return pendingTabKey === tabId || loadingTabKey === tabId;
}

export default function TuitionStoryHeader({
  theme,
  C,
  activeTab,
  kpis,
  readiness,
  pendingTabKey = null,
  loadingTabKey = null,
  onTabChange,
  onOpenSetupPanel,
  onOpenSetupWizard,
}: TuitionStoryHeaderProps) {
  const subtitle = subtitleForTab(activeTab, kpis);

  const pillItems = TUITION_DASHBOARD_TABS.map((tab) => {
    const tabLoading = isTabLoading(tab.id, pendingTabKey, loadingTabKey);
    return {
      key: tab.id,
      label: tab.label,
      ariaBusy: tabLoading,
      testId: `tuition-tab-${tab.id}`,
      suffix: tabLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" data-testid="tuition-tab-loading" />
      ) : undefined,
    };
  });

  return (
    <div className="mb-5 flex flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end sm:gap-5">
        <div className="min-w-0">
          <AdminSectionKicker theme={theme}>My school</AdminSectionKicker>
          <AdminDisplayHeading theme={theme} as="h1" size="section" className="mt-1.5">
            Tuition
          </AdminDisplayHeading>
          <p className="mt-2 text-[13px]" style={{ color: theme.muted }}>
            {subtitle}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {readiness ? (
            <TuitionSetupButton
              theme={theme}
              C={C}
              readiness={readiness}
              onClick={onOpenSetupPanel}
            />
          ) : null}
          <AdminButton theme={theme} onClick={onOpenSetupWizard}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            New rate plan
          </AdminButton>
        </div>
      </div>

      <ParentStoryPillNav
        theme={theme}
        items={pillItems}
        activeKey={activeTab}
        onChange={(key) => onTabChange(key as TuitionDashboardTabId)}
        ariaLabel="Tuition sections"
        data-testid="tuition-tab-nav"
      />
    </div>
  );
}
