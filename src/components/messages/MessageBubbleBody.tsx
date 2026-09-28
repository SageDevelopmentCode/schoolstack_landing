"use client";

import { useEffect, useState } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { PortalMessage } from "@/lib/messages/types";
import MessageAttachments from "./MessageAttachments";

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
  editing,
  onEditingChange,
  onEditMessage,
}: {
  message: PortalMessage;
  C: AdminThemeTokens;
  theme?: ParentThemeTokens;
  splitPane: boolean;
  ownBubble: boolean;
  bodyColor: string;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  onEditMessage?: (messageId: string, body: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(message.body);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) {
      queueMicrotask(() => setDraft(message.body));
    }
  }, [editing, message.body]);

  const cancelEdit = () => {
    setDraft(message.body);
    setEditError(null);
    onEditingChange(false);
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
      onEditingChange(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to edit message.");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    const editOnFilledBubble = message.isOwn && (ownBubble || Boolean(theme));
    const editFieldTextColor = theme?.ink ?? C.textPrimary;
    const cancelColor = editOnFilledBubble
      ? "rgba(255,255,255,0.85)"
      : theme?.muted ?? C.textSecondary;
    const saveColor = editOnFilledBubble ? "#ffffff" : theme?.primary ?? C.accent;

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
            color: editFieldTextColor,
          }}
          disabled={saving}
        />
        {editError ? (
          <p
            className="mt-1 text-xs"
            style={{ color: editOnFilledBubble ? "#fecaca" : C.warning }}
          >
            {editError}
          </p>
        ) : null}
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={cancelEdit}
            disabled={saving}
            className="text-xs font-medium cursor-pointer disabled:opacity-50"
            style={{ color: cancelColor }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void saveEdit()}
            disabled={saving}
            className="text-xs font-semibold cursor-pointer disabled:opacity-50"
            style={{ color: saveColor }}
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
      <MessageTimestamp message={message} ownBubble={ownBubble} theme={theme} C={C} />
    </>
  );
}
