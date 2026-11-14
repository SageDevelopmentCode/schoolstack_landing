"use client";

import { useMemo, type ReactNode } from "react";
import { Loader2, RotateCw } from "lucide-react";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { GTabBar, gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import {
  DASHBOARD_TABS,
  type DashboardTabId,
} from "@/components/school-admin/dashboard/dashboard-tabs";
import type { AdminDashboardModel } from "@/components/school-admin/dashboard/useAdminDashboardModel";
import { greetingParts } from "@/lib/school-admin/dashboard-summary";
import { adminToast } from "@/lib/school-admin/admin-toast";
import { useRelativeTime } from "./shared";

type Props = {
  model: AdminDashboardModel;
  userFirstName?: string | null;
  subtitle?: ReactNode;
  /** Extra header actions (left of Refresh). */
  actions?: ReactNode;
};

function todayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function AdminGardenDashboardHeader({
  model,
  userFirstName,
  subtitle,
  actions,
}: Props) {
  const greetingName = userFirstName?.trim() || "there";
  const { prefix, emoji } = greetingParts();
  const updatedLabel = useRelativeTime(model.lastUpdatedAt);
  const dateLabel = useMemo(() => todayLabel(), []);

  const tabItems = useMemo(
    () =>
      DASHBOARD_TABS.filter((tab) => model.visibleTabs.includes(tab.id)).map((tab) => {
        const Icon = tab.icon;
        const busy = model.pendingTabKey === tab.id || model.loadingTabKey === tab.id;
        return {
          key: tab.id,
          label: tab.label,
          icon: <Icon className="h-3.5 w-3.5" aria-hidden />,
          suffix: busy ? (
            <Loader2
              className="h-3.5 w-3.5 animate-spin"
              aria-hidden
              data-testid="dashboard-tab-loading"
            />
          ) : undefined,
          ariaBusy: busy,
          testId: `dashboard-tab-${tab.id}`,
        };
      }),
    [model.visibleTabs, model.pendingTabKey, model.loadingTabKey],
  );

  const handleRefresh = async () => {
    const ok = await model.refreshAll();
    if (ok) {
      adminToast.success("Dashboard refreshed", {
        id: "dashboard-refresh",
        description: "You're looking at the latest numbers.",
      });
    } else {
      adminToast.error("Couldn't refresh the dashboard", {
        id: "dashboard-refresh",
        description: "Check your connection. The numbers on screen are from your last refresh.",
        action: { label: "Retry", onClick: () => void handleRefresh() },
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ParentGardenPageHeader
        kicker={
          <>
            School workspace<span className="hidden sm:inline"> · {dateLabel}</span>
          </>
        }
        title={
          <span className="text-[1.75rem] sm:text-[2.1rem]">
            {prefix}, <span className="text-[var(--sf-clay)]">{greetingName}</span>.{" "}
            <span aria-hidden="true">{emoji}</span>
          </span>
        }
        subtitle={subtitle}
        actions={
          <>
            {actions}
            <div className="flex items-center gap-2">
              <span
                className="hidden text-[12px] font-bold text-[var(--sf-soft)] sm:inline"
                aria-live="polite"
              >
                {model.refreshing ? "Refreshing…" : `Updated ${updatedLabel}`}
              </span>
              <button
                type="button"
                onClick={() => void handleRefresh()}
                disabled={model.refreshing}
                className={`${gBtnOutlineSm} !px-3 !py-2`}
                aria-label="Refresh dashboard"
                title="Refresh dashboard"
              >
                <RotateCw
                  className={`h-4 w-4 ${model.refreshing ? "animate-spin" : ""}`}
                  aria-hidden
                />
                <span className="sm:hidden">Refresh</span>
              </button>
            </div>
          </>
        }
      />
      {tabItems.length > 1 ? (
        <GTabBar
          items={tabItems}
          activeKey={model.activeTab}
          onChange={(key) => model.handleTabChange(key as DashboardTabId)}
          ariaLabel="Dashboard sections"
          data-testid="dashboard-tab-nav"
        />
      ) : null}
    </div>
  );
}
