"use client";

import { Search } from "lucide-react";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import ParentMessagesInboxFilters, {
  type ParentMessagesInboxFilter,
} from "./ParentMessagesInboxFilters";

type ParentMessagesInboxHeaderProps = {
  theme: ParentThemeTokens;
  activeFilter: ParentMessagesInboxFilter;
  totalThreadCount: number;
  unreadThreadCount: number;
  onFilterChange: (filter: ParentMessagesInboxFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewMessage: () => void;
  newMessageDisabled?: boolean;
  readOnly?: boolean;
};

export default function ParentMessagesInboxHeader({
  theme,
  activeFilter,
  totalThreadCount,
  unreadThreadCount,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onNewMessage,
  newMessageDisabled = false,
  readOnly = false,
}: ParentMessagesInboxHeaderProps) {
  const disabled = readOnly || newMessageDisabled;

  return (
    <div
      className="shrink-0 border-b px-4 py-4"
      style={{ borderColor: theme.line }}
      data-testid="parent-messages-inbox-header"
    >
      <div className="flex items-center justify-between gap-3">
        <ParentDisplayHeading theme={theme} as="h1" size="section" className="!text-xl">
          Messages
        </ParentDisplayHeading>
        <ParentButton
          theme={theme}
          variant="primary"
          disabled={disabled}
          onClick={onNewMessage}
          className="!px-3 !py-1.5 !text-[12px]"
          data-testid="parent-messages-new-button"
        >
          + New{readOnly ? " (preview)" : ""}
        </ParentButton>
      </div>

      <div className="mt-3">
        <ParentMessagesInboxFilters
          theme={theme}
          activeFilter={activeFilter}
          totalThreadCount={totalThreadCount}
          unreadThreadCount={unreadThreadCount}
          onFilterChange={onFilterChange}
        />
      </div>

      <div className="relative mt-3">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
          style={{ color: theme.muted }}
          aria-hidden
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search messages"
          className="w-full rounded-full border py-2 pl-9 pr-3 text-[13px] outline-none transition-colors focus:ring-1"
          style={{
            backgroundColor: "#F4F7F5",
            borderColor: theme.line,
            color: theme.ink,
          }}
          aria-label="Search messages"
        />
      </div>
    </div>
  );
}
