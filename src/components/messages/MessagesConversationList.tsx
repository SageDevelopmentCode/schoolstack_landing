"use client";

import type { KeyboardEvent } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { MessageContact, MessageThreadSummary } from "@/lib/messages/types";
import MessagesAvatar, { type MessagesLayoutVariant } from "./MessagesAvatar";
import MessagesDualAvatar from "./MessagesDualAvatar";
import MessageStudentSubtitle from "./MessageStudentSubtitle";

export type MessagesConversationListItem =
  | { type: "section"; key: string; label: string }
  | { type: "thread"; thread: MessageThreadSummary }
  | { type: "contact"; contact: MessageContact };

function renderSectionHeader(
  label: string,
  embedded: boolean,
  C: AdminThemeTokens,
) {
  if (embedded) {
    return (
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1" style={{ backgroundColor: C.border }} />
          <p className="text-[11px] font-medium" style={{ color: C.textTertiary }}>
            {label}
          </p>
          <div className="h-px flex-1" style={{ backgroundColor: C.border }} />
        </div>
      </div>
    );
  }

  return (
    <p
      className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider"
      style={{ color: C.textTertiary }}
    >
      {label}
    </p>
  );
}

function handleRowKeyDown(
  event: KeyboardEvent<HTMLDivElement>,
  onSelect: () => void,
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onSelect();
  }
}

export default function MessagesConversationList({
  items,
  activeKey,
  onSelect,
  C,
  showContactsHeader = false,
  variant = "card",
  hideStudentSubtitle = false,
}: {
  items: MessagesConversationListItem[];
  activeKey: string | null;
  onSelect: (key: string) => void;
  C: AdminThemeTokens;
  showContactsHeader?: boolean;
  variant?: MessagesLayoutVariant;
  hideStudentSubtitle?: boolean;
}) {
  const embedded = variant === "embedded";
  let showingContacts = false;
  const firstContactIndex = items.findIndex((item) => item.type === "contact");

  return (
    <div className="overflow-y-auto flex-1">
      {items.length === 0 ? (
        <p className="text-sm text-center py-8 px-4" style={{ color: C.textTertiary }}>
          No conversations yet.
        </p>
      ) : (
        items.map((item, itemIndex) => {
          if (item.type === "section") {
            return (
              <div key={item.key}>{renderSectionHeader(item.label, embedded, C)}</div>
            );
          }

          const isContact = item.type === "contact";
          if (isContact && !showingContacts && showContactsHeader) {
            showingContacts = true;
          }

          const listAvatars =
            item.type === "thread" ? item.thread.listAvatars : undefined;
          const key = item.type === "thread" ? item.thread.id : item.contact.key;
          const title =
            item.type === "thread" ? item.thread.title : item.contact.name;
          const subtitle =
            item.type === "thread" ? item.thread.subtitle : item.contact.subtitle;
          const subtitleStudents =
            item.type === "thread"
              ? item.thread.subtitleStudents
              : item.contact.subtitleStudents;
          const preview =
            item.type === "thread" ? item.thread.lastMessagePreview : "Start a conversation";
          const timeLabel =
            item.type === "thread" ? item.thread.lastMessageTimeLabel : null;
          const unread =
            item.type === "thread" ? item.thread.unreadCount : 0;
          const color =
            item.type === "thread" ? item.thread.color : item.contact.color;
          const isActive = activeKey === key;
          const hasUnread = unread > 0;
          const shouldShowSubtitle =
            !listAvatars?.length &&
            (subtitle || subtitleStudents?.length) &&
            !(hideStudentSubtitle && subtitleStudents?.length);

          return (
            <div key={key}>
              {isContact && showContactsHeader && itemIndex === firstContactIndex ? (
                embedded ? (
                  <div className="px-4 pt-4 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1" style={{ backgroundColor: C.border }} />
                      <p className="text-[11px] font-medium" style={{ color: C.textTertiary }}>
                        Start a conversation
                      </p>
                      <div className="h-px flex-1" style={{ backgroundColor: C.border }} />
                    </div>
                  </div>
                ) : (
                  <p
                    className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: C.textTertiary }}
                  >
                    Start a conversation
                  </p>
                )
              ) : null}
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelect(key)}
                onKeyDown={(event) => handleRowKeyDown(event, () => onSelect(key))}
                className={`relative w-full flex items-start gap-3 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  embedded
                    ? "px-4 py-3.5 hover:bg-black/[0.03] active:scale-[0.99]"
                    : "p-3"
                }`}
                style={{
                  backgroundColor:
                    !embedded && isActive ? `${C.accent}14` : "transparent",
                  ...(embedded && isActive
                    ? { boxShadow: `inset 3px 0 0 0 ${C.accent}` }
                    : {}),
                }}
              >
                {listAvatars?.length === 2 ? (
                  <MessagesDualAvatar avatars={listAvatars} size="sm" />
                ) : (
                  <MessagesAvatar name={title} color={color} size="sm" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <p
                      className={`truncate ${embedded ? "text-sm" : "text-xs"} ${
                        hasUnread && embedded ? "font-bold" : "font-semibold"
                      }`}
                      style={{ color: C.textPrimary }}
                    >
                      {title}
                    </p>
                    {timeLabel && (
                      <p
                        className={`shrink-0 ${embedded ? "text-[11px]" : "text-[10px]"}`}
                        style={{
                          color: hasUnread && embedded ? C.accent : C.textTertiary,
                          fontWeight: hasUnread && embedded ? 600 : 400,
                        }}
                      >
                        {timeLabel}
                      </p>
                    )}
                  </div>
                  {shouldShowSubtitle ? (
                    <MessageStudentSubtitle
                      students={subtitleStudents}
                      subtitle={subtitle}
                      C={C}
                      truncate
                    />
                  ) : null}
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p
                      className={`truncate ${embedded ? "text-xs" : "text-xs"} ${
                        hasUnread && embedded ? "font-medium" : ""
                      }`}
                      style={{
                        color:
                          hasUnread && embedded ? C.textPrimary : C.textSecondary,
                      }}
                    >
                      {preview}
                    </p>
                    {unread > 0 ? (
                      embedded ? (
                        <span
                          className="min-w-[1.25rem] h-5 px-1.5 rounded-full text-white text-[10px] font-semibold flex items-center justify-center shrink-0"
                          style={{ backgroundColor: C.accent }}
                        >
                          {unread > 99 ? "99+" : unread}
                        </span>
                      ) : (
                        <span
                          className="w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center shrink-0"
                          style={{ backgroundColor: C.accent }}
                        >
                          {unread}
                        </span>
                      )
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
