"use client";

import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type TuitionSubTab<T extends string> = {
  id: T;
  label: string;
};

type TuitionSubTabBarProps<T extends string> = {
  C: AdminThemeTokens;
  tabs: ReadonlyArray<TuitionSubTab<T>>;
  activeTab: T;
  onTabChange: (tab: T) => void;
  ariaLabel: string;
  testIdPrefix: string;
};

export default function TuitionSubTabBar<T extends string>({
  C,
  tabs,
  activeTab,
  onTabChange,
  ariaLabel,
  testIdPrefix,
}: TuitionSubTabBarProps<T>) {
  return (
    <div
      className="overflow-x-auto"
      style={{ borderBottom: `1px solid ${C.border}` }}
      data-testid={`${testIdPrefix}-tab-bar`}
    >
      <div className="-mb-px flex gap-4" role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const tabId = `${testIdPrefix}-tab-${tab.id}`;
          const panelId = `${testIdPrefix}-panel-${tab.id}`;

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
              data-testid={tabId}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
