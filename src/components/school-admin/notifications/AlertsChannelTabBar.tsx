"use client";

import type { NotificationChannel } from "@/lib/notifications/org-notification-settings";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type AlertsChannelTab = {
  id: NotificationChannel;
  label: string;
  needsAction?: boolean;
};

type AlertsChannelTabBarProps = {
  theme: ParentThemeTokens;
  tabs: ReadonlyArray<AlertsChannelTab>;
  activeTab: NotificationChannel;
  onTabChange: (tab: NotificationChannel) => void;
};

export default function AlertsChannelTabBar({
  theme,
  tabs,
  activeTab,
  onTabChange,
}: AlertsChannelTabBarProps) {
  return (
    <div
      className="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ borderBottom: "1px solid #E1E8E1" }}
      data-testid="alerts-tab-bar"
    >
      <div
        className="-mb-px flex gap-[3px]"
        role="tablist"
        aria-label="Notification channels"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const tabId = `alerts-tab-${tab.id}`;
          const panelId = `alerts-panel-${tab.id}`;

          return (
            <button
              key={tab.id}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              onClick={() => onTabChange(tab.id)}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-[9px] py-[11px] text-[11px] font-bold transition-colors"
              style={{
                borderBottomColor: isActive ? theme.primary : "transparent",
                color: isActive ? theme.primary : "#77858A",
              }}
              data-testid={tabId}
            >
              {tab.label}
              {tab.needsAction ? (
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "#A26B22" }}
                  aria-label="Action needed"
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
