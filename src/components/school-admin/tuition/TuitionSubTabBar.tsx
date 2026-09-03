"use client";

import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type TuitionSubTab<T extends string> = {
  id: T;
  label: string;
};

type TuitionSubTabBarProps<T extends string> = {
  theme: ParentThemeTokens;
  tabs: ReadonlyArray<TuitionSubTab<T>>;
  activeTab: T;
  onTabChange: (tab: T) => void;
  ariaLabel: string;
  testIdPrefix: string;
};

export default function TuitionSubTabBar<T extends string>({
  theme,
  tabs,
  activeTab,
  onTabChange,
  ariaLabel,
  testIdPrefix,
}: TuitionSubTabBarProps<T>) {
  return (
    <div
      className="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ borderBottom: "1px solid #E1E8E1" }}
      data-testid={`${testIdPrefix}-tab-bar`}
    >
      <div className="-mb-px flex gap-[3px]" role="tablist" aria-label={ariaLabel}>
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
              className="shrink-0 whitespace-nowrap border-b-2 px-[9px] py-[11px] text-[11px] font-bold transition-colors"
              style={{
                borderBottomColor: isActive ? theme.primary : "transparent",
                color: isActive ? theme.primary : "#77858A",
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
