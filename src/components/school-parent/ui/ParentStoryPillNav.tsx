"use client";

import type { ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type ParentStoryPillNavItem = {
  key: string;
  label: string;
  icon?: ReactNode;
  suffix?: ReactNode;
  disabled?: boolean;
  ariaBusy?: boolean;
  testId?: string;
};

type ParentStoryPillNavProps = {
  theme: ParentThemeTokens;
  items: ParentStoryPillNavItem[];
  activeKey: string;
  onChange: (key: string) => void;
  ariaLabel: string;
  className?: string;
  "data-testid"?: string;
};

export default function ParentStoryPillNav({
  theme,
  items,
  activeKey,
  onChange,
  ariaLabel,
  className = "",
  "data-testid": dataTestId,
}: ParentStoryPillNavProps) {
  return (
    <nav
      className={`inline-flex w-fit max-w-full shrink-0 items-center gap-1 overflow-x-auto rounded-lg p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      style={{ backgroundColor: "#EAF2EB" }}
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
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold transition-colors disabled:cursor-wait disabled:opacity-70"
              style={{
                backgroundColor: active ? theme.white : "transparent",
                color: active ? theme.primary : "#728079",
                boxShadow: active ? "0 1px 4px #dbe2dc" : undefined,
              }}
              aria-selected={active}
              aria-current={active ? "true" : undefined}
              aria-busy={item.ariaBusy || undefined}
              data-testid={item.testId}
            >
              {item.icon}
              {item.label}
              {item.suffix}
            </button>
          );
        })}
    </nav>
  );
}
