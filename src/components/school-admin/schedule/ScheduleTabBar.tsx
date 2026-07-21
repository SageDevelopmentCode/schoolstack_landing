"use client";

import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { SCHEDULE_TABS, type ScheduleTabId } from "./schedule-tabs";

type ScheduleTabBarProps = {
  C: AdminThemeTokens;
  activeTab: ScheduleTabId;
  onTabChange: (tab: ScheduleTabId) => void;
};

export default function ScheduleTabBar({ C, activeTab, onTabChange }: ScheduleTabBarProps) {
  return (
    <div
      className="flex-shrink-0 overflow-x-auto px-4 sm:px-5"
      style={{ borderBottom: `1px solid ${C.border}` }}
    >
      <div className="-mb-px flex gap-6" role="tablist" aria-label="Schedule sections">
        {SCHEDULE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const tabId = `schedule-tab-${tab.id}`;
          const panelId = `schedule-panel-${tab.id}`;

          return (
            <button
              key={tab.id}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              onClick={() => onTabChange(tab.id)}
              className="shrink-0 whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-colors"
              style={{
                borderBottomColor: isActive ? C.accent : "transparent",
                color: isActive ? C.accent : C.textTertiary,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
