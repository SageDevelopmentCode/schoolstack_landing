"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { PortalMessage } from "@/lib/messages/types";
import LinkifiedText from "@/components/text/LinkifiedText";
import MessageAttachments from "./MessageAttachments";

function MessageTimestamp({
  message,
  ownBubble,
  theme,
  C,
  garden = false,
}: {
  message: PortalMessage;
  ownBubble: boolean;
  theme?: ParentThemeTokens;
  C: AdminThemeTokens;
  garden?: boolean;
}) {
  const editedSuffix = message.editedAt ? " (Edited)" : "";
  const label = message.pending ? "Sending…" : `${message.timeLabel}${editedSuffix}`;

  if (garden) {
    return (
      <p
        className={`m-0 mt-1 flex items-center justify-end gap-1 text-[11px] font-semibold ${
          message.isOwn ? "text-white/80" : "text-[var(--sf-soft)]"
        }`}
      >
        {message.pending ? (
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        ) : null}
        {label}
      </p>
    );
  }

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
  garden = false,
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
  /** Parent Garden look; edit/save logic is shared. */
  garden?: boolean;
}) {
  const [draft, setDraft] = useState(message.body);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const gardenEditRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!garden || !editing) return;
    // Bring Save/Cancel into view when editing the last message near the composer.
    gardenEditRef.current?.scrollIntoView({ block: "nearest" });
  }, [editing, garden]);

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

  const linkColor =
    bodyColor === "#ffffff" || bodyColor === "#FFFFFF"
      ? "rgba(255,255,255,0.92)"
      : theme?.primary ?? C.accent;

  if (editing && garden) {
    return (
      <div ref={gardenEditRef}>
        <label className="sr-only" htmlFor={`edit-message-${message.id}`}>
          Edit message
        </label>
        <textarea
          id={`edit-message-${message.id}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              cancelEdit();
            } else if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              void saveEdit();
            }
          }}
          rows={3}
          autoFocus
          className="w-full resize-y rounded-2xl border-2 border-white/40 bg-white px-3 py-2 text-sm font-semibold text-[var(--sf-ink)] outline-none focus:border-[var(--sf-ink)]"
          disabled={saving}
        />
        {editError ? (
          <p role="alert" className="m-0 mt-1.5 rounded-lg bg-white/95 px-2 py-1 text-xs font-bold text-[var(--sf-clay-deep)]">
            {editError}
          </p>
        ) : null}
        <div className="mt-2 flex items-center justify-end gap-2">
          <span className="mr-auto hidden text-[11px] font-semibold text-white/75 sm:inline">
            Esc to cancel · ⌘/Ctrl + Enter to save
          </span>
          <button
            type="button"
            onClick={cancelEdit}
            disabled={saving}
            className="rounded-full px-3 py-1.5 text-xs font-extrabold text-white/90 hover:bg-white/15 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void saveEdit()}
            disabled={saving}
            aria-busy={saving || undefined}
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-[var(--sf-ink)] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : null}
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    );
  }

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
        <LinkifiedText
          as="p"
          text={message.body}
          className={
            garden
              ? "m-0 whitespace-pre-wrap break-words text-[14.5px] font-medium leading-relaxed"
              : "whitespace-pre-wrap text-sm"
          }
          style={{ color: bodyColor }}
          linkColor={linkColor}
        />
      ) : null}
      <MessageAttachments
        attachments={message.attachments}
        C={C}
        splitPane={splitPane}
        isOwn={message.isOwn}
      />
      <MessageTimestamp
        message={message}
        ownBubble={ownBubble}
        theme={theme}
        C={C}
        garden={garden}
      />
    </>
  );
}
