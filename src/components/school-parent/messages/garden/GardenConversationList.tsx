"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Inbox, Loader2, Pin, Plus, Search, X } from "lucide-react";
import { GChip, GSkeleton, GTabBar, G_FOCUS, gBtnOutlineSm, gLinkSm } from "@/components/school-parent/garden/ui";
import type { MessageThreadSummary } from "@/lib/messages/types";
import { GardenAvatar, isMudKitchenSupportListThread } from "./garden-messages-shared";

export type GardenInboxFilter = "all" | "unread";

/*
 * Inbox column: search, All / Unread tabs, and conversation rows. Rows are
 * real buttons; the active one sits on the accent wash with a gliding bar.
 */
export default function GardenConversationList({
  threads,
  filter,
  onFilterChange,
  unreadCount,
  activeThreadId,
  onSelect,
  search,
  onSearchChange,
  loading,
  refreshing,
  emptyDescription,
  onStartConversation,
  startDisabled,
  onNewMessage,
  newMessageDisabled,
  newMessageBusy,
  readOnly,
}: {
  threads: MessageThreadSummary[];
  filter: GardenInboxFilter;
  onFilterChange: (filter: GardenInboxFilter) => void;
  unreadCount: number;
  activeThreadId: string | null;
  onSelect: (threadId: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
  refreshing: boolean;
  emptyDescription: string;
  onStartConversation: () => void;
  startDisabled: boolean;
  onNewMessage: () => void;
  newMessageDisabled: boolean;
  newMessageBusy: boolean;
  readOnly: boolean;
}) {
  const reduce = useReducedMotion() === true;
  const searching = search.trim().length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        data-testid="parent-messages-inbox-header"
        className="shrink-0 space-y-3 border-b-[1.5px] border-[var(--sf-ink)]/10 px-4 pb-3 pt-4"
      >
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sf-ink)]/45"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && search) {
                event.preventDefault();
                onSearchChange("");
              }
            }}
            placeholder="Search messages"
            aria-label="Search messages"
            className="w-full rounded-full border-2 border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] py-2 pl-10 pr-10 text-[16px] font-semibold text-[var(--sf-ink)] outline-none transition-colors placeholder:text-[var(--sf-ink)]/40 focus:border-[var(--sf-ink)] sm:text-sm [&::-webkit-search-cancel-button]:hidden"
          />
          {searching ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className={`absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--sf-ink)]/60 hover:bg-[var(--sf-ink)]/[0.06] hover:text-[var(--sf-ink)] ${G_FOCUS} focus-visible:ring-offset-0`}
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-2">
          <GTabBar
            ariaLabel="Filter conversations"
            activeKey={filter}
            onChange={(key) => onFilterChange(key as GardenInboxFilter)}
            items={[
              { key: "all", label: "All" },
              {
                key: "unread",
                label: "Unread",
                suffix:
                  unreadCount > 0 ? (
                    <span
                      className={`ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] ${
                        filter === "unread"
                          ? "bg-white text-[var(--sf-clay-deep)]"
                          : "bg-[var(--sf-clay)] text-white"
                      }`}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  ) : undefined,
              },
            ]}
            className="!shadow-none [&_button]:!px-3 [&_button]:!py-1.5"
          />
          <button
            type="button"
            onClick={onNewMessage}
            disabled={newMessageDisabled}
            aria-busy={newMessageBusy || undefined}
            data-testid="parent-messages-new-button"
            className={`${gBtnOutlineSm} shrink-0 !px-3.5 !py-2`}
          >
            {newMessageBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Plus className="h-4 w-4" aria-hidden />
            )}
            {readOnly ? "New (preview)" : "New message"}
          </button>
        </div>
        <p
          aria-live="polite"
          className={`m-0 flex items-center gap-1 text-[11.5px] font-bold text-[var(--sf-soft)] ${
            refreshing ? "" : "sr-only"
          }`}
        >
          {refreshing ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              Updating…
            </>
          ) : null}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {loading ? (
          <div aria-label="Loading conversations" role="status" className="space-y-1 p-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="flex items-center gap-3 rounded-2xl px-2 py-2.5">
                <GSkeleton className="h-10 w-10 !rounded-full" />
                <div className="flex-1 space-y-2">
                  <GSkeleton className="h-3.5 w-2/3 !rounded-full" />
                  <GSkeleton className="h-3 w-full !rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <span
              aria-hidden="true"
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--sf-sky)] text-[#24507a]"
            >
              {searching ? <Search className="h-5 w-5" /> : <Inbox className="h-5 w-5" />}
            </span>
            {searching || filter === "unread" ? (
              <>
                <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">
                  {searching
                    ? "No conversations match this filter."
                    : "No unread conversations"}
                </p>
                <p className="m-0 mt-1 text-[13px] font-semibold text-[var(--sf-soft)]">
                  {searching
                    ? `Nothing found for “${search.trim()}”.`
                    : "You’ve read everything in your inbox."}
                </p>
                <button
                  type="button"
                  className={`${gLinkSm} mt-3`}
                  onClick={() => {
                    if (searching) onSearchChange("");
                    else onFilterChange("all");
                  }}
                >
                  {searching ? "Clear search" : "Show all conversations"}
                </button>
              </>
            ) : (
              <>
                <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">
                  No messages yet
                </p>
                <p className="m-0 mt-1 max-w-[260px] text-[13px] font-semibold text-[var(--sf-soft)]">
                  {emptyDescription}
                </p>
                <button
                  type="button"
                  className={`${gLinkSm} mt-3`}
                  onClick={onStartConversation}
                  disabled={startDisabled}
                >
                  <Plus className="h-4 w-4" aria-hidden /> Start a conversation
                </button>
              </>
            )}
          </div>
        ) : (
          <ul aria-label="Conversations" className="m-0 list-none space-y-1 p-2">
            {threads.map((thread) => {
              const active = thread.id === activeThreadId;
              const unread = thread.unreadCount > 0;
              const pinned = isMudKitchenSupportListThread(thread);
              return (
                <li key={thread.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(thread.id)}
                    aria-current={active ? "true" : undefined}
                    className={`relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${
                      active
                        ? "bg-[var(--sf-accent-wash)]"
                        : pinned
                          ? "bg-[var(--sf-paper)] hover:bg-[var(--sf-accent-wash)]/70"
                          : "hover:bg-[var(--sf-ink)]/[0.035]"
                    } ${G_FOCUS} focus-visible:ring-inset focus-visible:ring-offset-0`}
                  >
                    {active ? (
                      <motion.span
                        layoutId="parent-garden-inbox-active"
                        aria-hidden="true"
                        className="absolute inset-y-2.5 left-0 w-[3.5px] rounded-full bg-[var(--sf-clay)]"
                        transition={
                          reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }
                        }
                      />
                    ) : null}
                    <GardenAvatar
                      name={thread.title}
                      color={thread.color}
                      photoUrl={thread.photoUrl}
                      listAvatars={thread.listAvatars}
                      supportLogo={pinned}
                      size="sm"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span
                          className={`truncate text-[14.5px] text-[var(--sf-ink)] ${
                            unread ? "font-extrabold" : "font-bold"
                          }`}
                        >
                          {thread.title}
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5">
                          {pinned ? (
                            <Pin
                              className="h-3 w-3 text-[var(--sf-clay-deep)]/70"
                              aria-label="Pinned"
                            />
                          ) : null}
                          {thread.lastMessageTimeLabel ? (
                            <span
                              className={`text-[11.5px] ${
                                unread
                                  ? "font-extrabold text-[var(--sf-clay-deep)]"
                                  : "font-semibold text-[var(--sf-soft)]"
                              }`}
                            >
                              {thread.lastMessageTimeLabel}
                            </span>
                          ) : null}
                        </span>
                      </span>
                      <span className="mt-0.5 flex items-center justify-between gap-2">
                        <span
                          className={`truncate text-[13px] ${
                            unread
                              ? "font-bold text-[var(--sf-ink)]/85"
                              : "font-semibold text-[var(--sf-soft)]"
                          }`}
                        >
                          {thread.lastMessagePreview ?? thread.subtitle ?? "No messages yet"}
                        </span>
                        {unread ? (
                          <GChip tone="alert" className="!px-2 !py-0 !text-[11px]">
                            <span className="sr-only">Unread messages: </span>
                            {thread.unreadCount > 99 ? "99+" : thread.unreadCount}
                          </GChip>
                        ) : null}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
