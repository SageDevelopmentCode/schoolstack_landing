"use client";

import { Search } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type AdminMessagesInboxHeaderProps = {
  theme: ParentThemeTokens;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewMessage: () => void;
  newMessageDisabled?: boolean;
};

export default function AdminMessagesInboxHeader({
  theme,
  searchQuery,
  onSearchChange,
  onNewMessage,
  newMessageDisabled = false,
}: AdminMessagesInboxHeaderProps) {
  return (
    <div
      className="shrink-0 border-b px-3 py-3 sm:px-4"
      style={{ borderColor: theme.line }}
      data-testid="admin-messages-inbox-header"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <AdminDisplayHeading
            theme={theme}
            as="h1"
            size="section"
            className="truncate !text-xl"
          >
            Messages
          </AdminDisplayHeading>
        </div>
        <AdminButton
          theme={theme}
          variant="primary"
          size="compact"
          disabled={newMessageDisabled}
          onClick={onNewMessage}
          className="shrink-0"
          data-testid="admin-messages-new-button"
        >
          + New
        </AdminButton>
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
