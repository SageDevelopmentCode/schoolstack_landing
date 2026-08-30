"use client";

import type { KeyboardEvent } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { MessageContact, MessageThreadSummary } from "@/lib/messages/types";
import MessagesAvatar, { type MessagesLayoutVariant } from "./MessagesAvatar";
import MessagesDualAvatar from "./MessagesDualAvatar";
import MessageStudentSubtitle from "./MessageStudentSubtitle";
import {
  isSplitPaneMessagesVariant,
  isStoryMessagesVariant,
} from "@/lib/messages/messages-layout-variant";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type MessagesConversationListItem =
  | { type: "section"; key: string; label: string; description?: string }
  | { type: "thread"; thread: MessageThreadSummary }
  | { type: "contact"; contact: MessageContact };

function renderSectionHeader(
  label: string,
  description: string | undefined,
  splitPane: boolean,
  C: AdminThemeTokens,
  theme?: ParentThemeTokens,
  storyVariant = false,
) {
  const lineColor = storyVariant && theme ? theme.line : C.border;
  const textColor = storyVariant && theme ? theme.muted : C.textTertiary;

  if (splitPane) {
    return (
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1" style={{ backgroundColor: lineColor }} />
          <p className="text-[11px] font-medium" style={{ color: textColor }}>
            {label}
          </p>
          <div className="h-px flex-1" style={{ backgroundColor: lineColor }} />
        </div>
        {description ? (
          <p
            className="mt-2 text-center text-[11px] leading-relaxed"
            style={{ color: textColor }}
          >
            {description}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="px-3 pt-3 pb-1">
      <p
        className="text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: textColor }}
      >
        {label}
      </p>
      {description ? (
        <p className="mt-1 text-[11px] leading-relaxed" style={{ color: textColor }}>
          {description}
        </p>
      ) : null}
    </div>
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
  theme,
  showContactsHeader = false,
  variant = "card",
  hideStudentSubtitle = false,
}: {
  items: MessagesConversationListItem[];
  activeKey: string | null;
  onSelect: (key: string) => void;
  C: AdminThemeTokens;
  theme?: ParentThemeTokens;
  showContactsHeader?: boolean;
  variant?: MessagesLayoutVariant;
  hideStudentSubtitle?: boolean;
}) {
  const splitPane = isSplitPaneMessagesVariant(variant);
  const storyVariant = isStoryMessagesVariant(variant);
  let showingContacts = false;
  const firstContactIndex = items.findIndex((item) => item.type === "contact");

  return (
    <div className="overflow-y-auto flex-1">
      {items.length === 0 ? (
        <p
          className="text-sm text-center py-8 px-4"
          style={{ color: theme?.muted ?? C.textTertiary }}
        >
          {storyVariant ? "No conversations match this filter." : "No conversations yet."}
        </p>
      ) : (
        items.map((item, itemIndex) => {
          if (item.type === "section") {
            return (
              <div key={item.key}>
                {renderSectionHeader(
                  item.label,
                  item.description,
                  splitPane,
                  C,
                  theme,
                  storyVariant,
                )}
              </div>
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
          const photoUrl =
            item.type === "thread" ? item.thread.photoUrl : item.contact.profilePhotoUrl;
          const isActive = activeKey === key;
          const hasUnread = unread > 0;
          const shouldShowSubtitle =
            !listAvatars?.length &&
            (subtitle || subtitleStudents?.length) &&
            !(hideStudentSubtitle && subtitleStudents?.length);

          return (
            <div key={key}>
              {isContact && showContactsHeader && itemIndex === firstContactIndex ? (
                splitPane ? (
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
                  storyVariant
                    ? "border-b px-[15px] py-[13px] hover:bg-black/[0.02]"
                    : splitPane
                      ? "px-4 py-3.5 hover:bg-black/[0.03] active:scale-[0.99]"
                      : "p-3"
                }`}
                style={{
                  backgroundColor:
                    !splitPane && isActive ? `${C.accent}14` : "transparent",
                  borderColor: storyVariant ? theme?.line ?? C.border : undefined,
                  ...(splitPane && isActive && !storyVariant
                    ? { boxShadow: `inset 3px 0 0 0 ${C.accent}` }
                    : {}),
                  ...(storyVariant && isActive && theme
                    ? {
                        backgroundColor: theme.primarySoft,
                        boxShadow: `inset 3px 0 0 0 ${theme.primary}`,
                      }
                    : {}),
                }}
              >
                {listAvatars?.length === 2 ? (
                  <MessagesDualAvatar avatars={listAvatars} size="sm" />
                ) : (
                  <MessagesAvatar
                    name={title}
                    color={color}
                    photoUrl={photoUrl}
                    size="sm"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`truncate ${splitPane ? "text-sm" : "text-xs"} ${
                        hasUnread && splitPane ? "font-bold" : "font-semibold"
                      }`}
                      style={{ color: theme?.ink ?? C.textPrimary }}
                    >
                      {title}
                    </p>
                    {timeLabel ? (
                      <div className="flex shrink-0 items-center gap-1.5">
                        {storyVariant && hasUnread ? (
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: theme?.primary ?? C.accent }}
                            aria-hidden
                          />
                        ) : null}
                        <p
                          className={`shrink-0 ${splitPane ? "text-[11px]" : "text-[10px]"}`}
                          style={{
                            color:
                              storyVariant || (hasUnread && splitPane)
                                ? theme?.muted ?? C.textTertiary
                                : C.textTertiary,
                            fontWeight: !storyVariant && hasUnread && splitPane ? 600 : 400,
                          }}
                        >
                          {timeLabel}
                        </p>
                      </div>
                    ) : null}
                  </div>
                  {shouldShowSubtitle && !storyVariant ? (
                    <MessageStudentSubtitle
                      students={subtitleStudents}
                      subtitle={subtitle}
                      C={C}
                      truncate
                    />
                  ) : null}
                  {storyVariant ? (
                    <p
                      className={`mt-0.5 truncate text-xs ${hasUnread ? "font-medium" : ""}`}
                      style={{ color: theme?.muted ?? C.textSecondary }}
                    >
                      {preview}
                    </p>
                  ) : (
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <p
                        className={`truncate text-xs ${hasUnread && splitPane ? "font-medium" : ""}`}
                        style={{
                          color:
                            hasUnread && splitPane ? C.textPrimary : C.textSecondary,
                        }}
                      >
                        {preview}
                      </p>
                      {unread > 0 ? (
                        splitPane ? (
                          <span
                            className="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold text-white"
                            style={{ backgroundColor: C.accent }}
                          >
                            {unread > 99 ? "99+" : unread}
                          </span>
                        ) : (
                          <span
                            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] text-white"
                            style={{ backgroundColor: C.accent }}
                          >
                            {unread}
                          </span>
                        )
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
