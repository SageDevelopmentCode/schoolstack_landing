"use client";

import { useEffect, useState } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { PortalMessage } from "@/lib/messages/types";
import MessageAttachments from "./MessageAttachments";

function messageIsEditable(message: PortalMessage): boolean {
  return (
    message.isOwn &&
    !message.pending &&
    Boolean(message.body.trim()) &&
    message.attachments.length === 0
  );
}

function MessageTimestamp({
  message,
  ownBubble,
  theme,
  C,
}: {
  message: PortalMessage;
  ownBubble: boolean;
  theme?: ParentThemeTokens;
  C: AdminThemeTokens;
}) {
  const editedSuffix = message.editedAt ? " (Edited)" : "";
  const label = message.pending ? "Sending…" : `${message.timeLabel}${editedSuffix}`;

  return (
    <p
      className={`mt-1 text-right text-[10px] ${ownBubble ? "text-white/70" : ""}`}
      style={ownBubble ? undefined : { color: theme?.muted ?? C.textTertiary }}
    >
      {label}
    </p>
  );
}

export default function MessageBubbleBody({
  message,
  C,
  theme,
  splitPane,
  ownBubble,
  bodyColor,
  readOnly,
  onEditMessage,
}: {
  message: PortalMessage;
  C: AdminThemeTokens;
  theme?: ParentThemeTokens;
  splitPane: boolean;
  ownBubble: boolean;
  bodyColor: string;
  readOnly?: boolean;
  onEditMessage?: (messageId: string, body: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.body);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const canEdit = !readOnly && messageIsEditable(message) && Boolean(onEditMessage);

  useEffect(() => {
    if (!editing) {
      setDraft(message.body);
    }
  }, [editing, message.body]);

  const cancelEdit = () => {
    setDraft(message.body);
    setEditError(null);
    setEditing(false);
  };

  const saveEdit = async () => {
    if (!onEditMessage) return;
    const nextBody = draft.trim();
    if (!nextBody) {
      setEditError("Message cannot be empty.");
      return;
    }
    if (nextBody === message.body.trim()) {
      cancelEdit();
      return;
    }

    setSaving(true);
    setEditError(null);
    try {
      await onEditMessage(message.id, nextBody);
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to edit message.");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          className="w-full resize-y rounded-lg border px-2.5 py-2 text-sm"
          style={{
            borderColor: theme?.line ?? C.border,
            backgroundColor: theme?.white ?? C.bg,
            color: bodyColor,
          }}
          disabled={saving}
        />
        {editError ? (
          <p className="mt-1 text-xs" style={{ color: C.warning }}>
            {editError}
          </p>
        ) : null}
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={cancelEdit}
            disabled={saving}
            className="text-xs font-medium cursor-pointer disabled:opacity-50"
            style={{ color: theme?.muted ?? C.textSecondary }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void saveEdit()}
            disabled={saving}
            className="text-xs font-semibold cursor-pointer disabled:opacity-50"
            style={{ color: theme?.primary ?? C.accent }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {message.body ? (
        <p className="whitespace-pre-wrap text-sm" style={{ color: bodyColor }}>
          {message.body}
        </p>
      ) : null}
      <MessageAttachments
        attachments={message.attachments}
        C={C}
        splitPane={splitPane}
        isOwn={message.isOwn}
      />
      <div className="flex items-center justify-end gap-2">
        {canEdit ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={`text-[10px] font-medium cursor-pointer hover:underline ${
              ownBubble ? "text-white/80" : ""
            }`}
            style={ownBubble ? undefined : { color: theme?.muted ?? C.textTertiary }}
          >
            Edit
          </button>
        ) : null}
        <MessageTimestamp message={message} ownBubble={ownBubble} theme={theme} C={C} />
      </div>
    </>
  );
}
