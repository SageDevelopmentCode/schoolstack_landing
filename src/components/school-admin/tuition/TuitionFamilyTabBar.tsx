"use client";

import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  TUITION_FAMILY_TABS,
  type TuitionFamilyTabId,
} from "./tuition-family-tabs";

type TuitionFamilyTabBarProps = {
  C: AdminThemeTokens;
  activeTab: TuitionFamilyTabId;
  onTabChange: (tab: TuitionFamilyTabId) => void;
};

export default function TuitionFamilyTabBar({
  C,
  activeTab,
  onTabChange,
}: TuitionFamilyTabBarProps) {
  return (
    <div
      className="overflow-x-auto"
      style={{ borderBottom: `1px solid ${C.border}` }}
      data-testid="tuition-family-tab-bar"
    >
      <div className="-mb-px flex gap-4" role="tablist" aria-label="Family billing sections">
        {TUITION_FAMILY_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const tabId = `tuition-family-tab-${tab.id}`;
          const panelId = `tuition-family-panel-${tab.id}`;

          return (
            <button
              key={tab.id}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              onClick={() => onTabChange(tab.id)}
              className="shrink-0 whitespace-nowrap border-b-2 py-2.5 text-sm font-medium transition-colors"
              style={{
                borderBottomColor: isActive ? C.accent : "transparent",
                color: isActive ? C.accent : C.textTertiary,
              }}
              data-testid={`tuition-family-tab-${tab.id}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
