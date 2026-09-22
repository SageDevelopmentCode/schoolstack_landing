"use client";

import type { ParentStoryPillNavItem } from "@/components/school-parent/ui/ParentStoryPillNav";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type CommitteeWorkspaceSideNavProps = {
  theme: ParentThemeTokens;
  items: ParentStoryPillNavItem[];
  activeKey: string;
  onChange: (key: string) => void;
  ariaLabel: string;
  className?: string;
  "data-testid"?: string;
};

export default function CommitteeWorkspaceSideNav({
  theme,
  items,
  activeKey,
  onChange,
  ariaLabel,
  className = "",
  "data-testid": dataTestId,
}: CommitteeWorkspaceSideNavProps) {
  return (
    <nav
      className={`flex flex-col gap-0.5 ${className}`}
      aria-label={ariaLabel}
      role="tablist"
      data-testid={dataTestId}
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            onClick={() => onChange(item.key)}
            disabled={item.disabled}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] font-bold transition-colors disabled:cursor-wait disabled:opacity-70"
            style={{
              backgroundColor: active ? theme.white : "transparent",
              color: active ? theme.primary : "#728079",
              boxShadow: active ? "0 1px 4px #dbe2dc" : undefined,
            }}
            aria-selected={active}
            aria-current={active ? "true" : undefined}
            aria-busy={item.ariaBusy || undefined}
            data-testid={item.testId}
            data-tour-id={item.tourId}
          >
            {item.icon}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.suffix}
          </button>
        );
      })}
    </nav>
  );
}
