"use client";

import { useState, type ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { PORTAL_MESSAGE_DELETED_PREVIEW } from "@/lib/messages/constants";
import { portalMessageSupportsTextMutation } from "@/lib/messages/message-mutation-eligibility";
import type { PortalMessage } from "@/lib/messages/types";
import MessageBubbleBody from "./MessageBubbleBody";

const actionButtonClass =
  "flex h-7 w-7 items-center justify-center rounded-full cursor-pointer transition-colors hover:bg-black/[0.06] [@media(hover:none)]:bg-black/[0.04]";

export default function MessageBubbleRow({
  message,
  C,
  theme,
  splitPane,
  parentStory,
  ownBubble,
  readOnly,
  showSenderName,
  senderLabel,
  onEditMessage,
  onRequestDelete,
  avatar,
}: {
  message: PortalMessage;
  C: AdminThemeTokens;
  theme?: ParentThemeTokens;
  splitPane: boolean;
  parentStory: boolean;
  ownBubble: boolean;
  readOnly?: boolean;
  showSenderName: boolean;
  senderLabel: string;
  onEditMessage?: (messageId: string, body: string) => Promise<void>;
  onRequestDelete?: (messageId: string) => void;
  avatar?: ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const isDeleted = Boolean(message.deletedAt);
  const canMutate =
    !readOnly &&
    portalMessageSupportsTextMutation(message) &&
    Boolean(onEditMessage) &&
    Boolean(onRequestDelete);

  const bodyColor = parentStory && theme
    ? message.isOwn
      ? "#ffffff"
      : theme.ink
    : ownBubble
      ? "#ffffff"
      : C.textSecondary;

  const actionIconColor = theme?.muted ?? C.textTertiary;

  const actions = canMutate && !editing ? (
    <div
      className={`flex shrink-0 flex-row items-center gap-0.5 pb-1 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto [@media(hover:none)]:opacity-100 [@media(hover:none)]:pointer-events-auto`}
    >
      <button
        type="button"
        className={actionButtonClass}
        style={{ color: actionIconColor }}
        aria-label="Edit message"
        onClick={() => setEditing(true)}
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className={actionButtonClass}
        style={{ color: actionIconColor }}
        aria-label="Delete message"
        onClick={() => onRequestDelete?.(message.id)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  ) : null;

  const bubbleContent = isDeleted ? (
    <>
      <p className="text-sm italic" style={{ color: theme?.muted ?? C.textTertiary }}>
        {PORTAL_MESSAGE_DELETED_PREVIEW}
      </p>
      <p
        className="mt-1 text-right text-[10px]"
        style={{ color: theme?.muted ?? C.textTertiary }}
      >
        {message.pending ? "Sending…" : message.timeLabel}
      </p>
    </>
  ) : (
    <MessageBubbleBody
      message={message}
      C={C}
      theme={theme}
      splitPane={splitPane}
      ownBubble={ownBubble}
      bodyColor={bodyColor}
      editing={editing}
      onEditingChange={setEditing}
      onEditMessage={onEditMessage}
    />
  );

  const bubbleShellClass = parentStory
    ? "max-w-[min(75%,28rem)] rounded-2xl px-3.5 py-2.5"
    : splitPane
      ? message.isOwn
        ? "max-w-[min(75%,28rem)] rounded-2xl rounded-br-md px-3 py-2 shadow-sm"
        : "max-w-[min(75%,28rem)] rounded-2xl rounded-bl-md px-3 py-2 shadow-sm"
      : "max-w-[min(75%,28rem)] rounded-xl border p-3";

  const bubbleShellStyle = isDeleted
    ? {
        backgroundColor: parentStory && theme ? theme.white : C.surface,
        border: `1px dashed ${theme?.line ?? C.border}`,
        opacity: message.pending ? 0.75 : 1,
      }
    : parentStory && theme
      ? {
          backgroundColor: message.isOwn ? theme.primary : theme.white,
          border: message.isOwn ? undefined : `1px solid ${theme.line}`,
          opacity: message.pending ? 0.75 : 1,
        }
      : splitPane
        ? {
            backgroundColor: message.isOwn
              ? theme?.primary ?? C.accent
              : theme?.white ?? C.surface,
            opacity: message.pending ? 0.75 : 1,
          }
        : {
            backgroundColor: message.isOwn ? `${C.accent}12` : C.surface,
            borderColor: C.border,
            opacity: message.pending ? 0.7 : 1,
          };

  const bubble = (
    <div className={bubbleShellClass} style={bubbleShellStyle}>
      {showSenderName && !isDeleted ? (
        <p
          className="mb-1 text-xs font-semibold"
          style={{
            color: parentStory && theme
              ? message.isOwn
                ? "rgba(255,255,255,0.75)"
                : theme.primary
              : splitPane
                ? C.accent
                : C.textPrimary,
          }}
        >
          {senderLabel}
        </p>
      ) : null}
      {bubbleContent}
    </div>
  );

  const messageCluster = (
    <div
      className={`group flex max-w-full items-end gap-1.5 flex-row`}
    >
      {message.isOwn ? actions : null}
      {bubble}
    </div>
  );

  if (parentStory && avatar) {
    return (
      <div
        className={`flex items-start gap-2.5 ${
          message.isOwn ? "flex-row-reverse" : ""
        }`}
      >
        {avatar}
        {messageCluster}
      </div>
    );
  }

  return messageCluster;
}
