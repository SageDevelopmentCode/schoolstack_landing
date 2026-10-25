"use client";

import { Loader2 } from "lucide-react";
import AdminDashboardHeader from "@/components/school-admin/AdminDashboardHeader";
import ParentStoryPillNav from "@/components/school-parent/ui/ParentStoryPillNav";
import {
  DASHBOARD_TABS,
  DASHBOARD_TAB_ICON_CLASS,
  type DashboardTabId,
} from "@/components/school-admin/dashboard/dashboard-tabs";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type AdminDashboardStoryHeaderProps = {
  theme: ParentThemeTokens;
  schoolName: string;
  userFirstName?: string | null;
  activeTab: DashboardTabId;
  visibleTabs: DashboardTabId[];
  pendingTabKey?: DashboardTabId | null;
  loadingTabKey?: DashboardTabId | null;
  onTabChange: (tab: DashboardTabId) => void;
};

function isTabLoading(
  tabId: DashboardTabId,
  pendingTabKey?: DashboardTabId | null,
  loadingTabKey?: DashboardTabId | null,
): boolean {
  return pendingTabKey === tabId || loadingTabKey === tabId;
}

export default function AdminDashboardStoryHeader({
  theme,
  schoolName,
  userFirstName,
  activeTab,
  visibleTabs,
  pendingTabKey = null,
  loadingTabKey = null,
  onTabChange,
}: AdminDashboardStoryHeaderProps) {
  const pillItems = DASHBOARD_TABS.filter((tab) => visibleTabs.includes(tab.id)).map(
    (tab) => {
      const tabLoading = isTabLoading(tab.id, pendingTabKey, loadingTabKey);
      const Icon = tab.icon;
      return {
        key: tab.id,
        label: tab.label,
        icon: <Icon className={DASHBOARD_TAB_ICON_CLASS} aria-hidden />,
        testId: `dashboard-tab-${tab.id}`,
        ariaBusy: tabLoading,
        suffix: tabLoading ? (
          <Loader2
            className="h-3 w-3 animate-spin"
            data-testid="dashboard-tab-loading"
          />
        ) : undefined,
      };
    },
  );

  const activePanel = DASHBOARD_TABS.find((tab) => tab.id === activeTab);

  return (
    <div className="mb-5 flex flex-col gap-4">
      <AdminDashboardHeader
        schoolName={schoolName}
        userFirstName={userFirstName}
      />
      {pillItems.length > 1 ? (
        <ParentStoryPillNav
          theme={theme}
          items={pillItems}
          activeKey={activeTab}
          onChange={(key) => onTabChange(key as DashboardTabId)}
          ariaLabel="Dashboard sections"
          data-testid="dashboard-tab-nav"
        />
      ) : null}
      <span className="sr-only">{activePanel?.panelLabel}</span>
    </div>
  );
}
