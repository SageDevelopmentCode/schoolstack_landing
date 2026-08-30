"use client";

import { Search } from "lucide-react";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentMessagesInboxHeaderProps = {
  theme: ParentThemeTokens;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewMessage: () => void;
  newMessageDisabled?: boolean;
  readOnly?: boolean;
};

export default function ParentMessagesInboxHeader({
  theme,
  searchQuery,
  onSearchChange,
  onNewMessage,
  newMessageDisabled = false,
  readOnly = false,
}: ParentMessagesInboxHeaderProps) {
  const disabled = readOnly || newMessageDisabled;

  return (
    <div
      className="shrink-0 border-b px-3 py-3 sm:px-4"
      style={{ borderColor: theme.line }}
      data-testid="parent-messages-inbox-header"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <ParentDisplayHeading
            theme={theme}
            as="h1"
            size="section"
            className="truncate !text-xl"
          >
            Messages
          </ParentDisplayHeading>
        </div>
        <ParentButton
          theme={theme}
          variant="primary"
          disabled={disabled}
          onClick={onNewMessage}
          className="shrink-0 !px-3 !py-1.5 !text-[12px]"
          data-testid="parent-messages-new-button"
        >
          + New{readOnly ? " (preview)" : ""}
        </ParentButton>
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
          className="w-full rounded-full border py-2 pl-9 pr-3 text-[16px] outline-none transition-colors focus:ring-1 sm:text-[13px]"
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
