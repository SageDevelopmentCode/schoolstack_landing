"use client";

import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type ParentMessagesInboxFilter = "all" | "unread";

type ParentMessagesInboxFiltersProps = {
  theme: ParentThemeTokens;
  activeFilter: ParentMessagesInboxFilter;
  totalThreadCount: number;
  unreadThreadCount: number;
  onFilterChange: (filter: ParentMessagesInboxFilter) => void;
};

export default function ParentMessagesInboxFilters({
  theme,
  activeFilter,
  totalThreadCount,
  unreadThreadCount,
  onFilterChange,
}: ParentMessagesInboxFiltersProps) {
  const filters: { key: ParentMessagesInboxFilter; label: string }[] = [
    {
      key: "all",
      label: totalThreadCount > 0 ? `Inbox · ${totalThreadCount}` : "Inbox",
    },
    {
      key: "unread",
      label: unreadThreadCount > 0 ? `Unread · ${unreadThreadCount}` : "Unread",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Inbox filters">
      {filters.map((filter) => {
        const active = activeFilter === filter.key;
        return (
          <button
            key={filter.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onFilterChange(filter.key)}
            className="rounded-full px-2.5 py-1 text-[12px] font-semibold transition-colors"
            style={{
              backgroundColor: active ? "#E8F1E9" : "transparent",
              color: active ? theme.primary : theme.muted,
            }}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
