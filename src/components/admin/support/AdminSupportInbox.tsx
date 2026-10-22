"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Paperclip, X } from "lucide-react";
import { AdminDetailEmpty } from "@/components/admin/ui/AdminDetailEmpty";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminFilterChip } from "@/components/admin/ui/AdminFilterChip";
import { AdminListItem } from "@/components/admin/ui/AdminListItem";
import { AdminListPanelHeader } from "@/components/admin/ui/AdminListPanelHeader";
import { AdminMasterDetail } from "@/components/admin/ui/AdminMasterDetail";
import { AdminPageState } from "@/components/admin/ui/AdminPageState";
import type { PlatformSupportConversation } from "@/lib/admin/platform-support-types";
import { formatMessageTime } from "@/lib/messages/format";
import {
  MAX_MESSAGE_ATTACHMENTS,
  MAX_MESSAGE_ATTACHMENT_BYTES,
} from "@/lib/messages/message-attachment-storage";
import { MUDKITCHEN_SUPPORT_TEAM_NAME } from "@/lib/messages/platform-support";
import type { MessageThreadDetail, PortalMessage } from "@/lib/messages/types";

type SupportDetail = {
  organizationName: string;
  organizationSlug: string;
  thread: MessageThreadDetail;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function ParentAvatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  return (
    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#C46A45] text-xs font-semibold text-white">
      {photoUrl ? (
        <img src={photoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </div>
  );
}

export default function AdminSupportInbox() {
  const searchParams = useSearchParams();
  const requestedThreadId = searchParams.get("thread");
  const [conversations, setConversations] = useState<PlatformSupportConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(requestedThreadId);
  const [detail, setDetail] = useState<SupportDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(Boolean(requestedThreadId));
  const [draft, setDraft] = useState("");
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const detailRequestRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addStagedFiles = (incoming: FileList | File[]) => {
    const next = [...stagedFiles];
    for (const file of incoming) {
      if (next.length >= MAX_MESSAGE_ATTACHMENTS) break;
      if (file.size > MAX_MESSAGE_ATTACHMENT_BYTES) continue;
      next.push(file);
    }
    setStagedFiles(next);
  };

  const loadConversations = useCallback(async () => {
    const response = await fetch("/api/admin/support-messages");
    const data = (await response.json()) as {
      conversations?: PlatformSupportConversation[];
      error?: string;
    };
    if (!response.ok) {
      throw new Error(data.error ?? "Failed to load support conversations.");
    }
    setConversations(data.conversations ?? []);
    setError(null);
  }, []);

  const loadDetail = useCallback(async (threadId: string) => {
    const requestId = detailRequestRef.current + 1;
    detailRequestRef.current = requestId;
    try {
      const response = await fetch(`/api/admin/support-messages/${threadId}`);
      const data = (await response.json()) as SupportDetail & { error?: string };
      if (requestId !== detailRequestRef.current) return;
      if (!response.ok) {
        setDetail(null);
        setSendError(data.error ?? "Failed to load conversation.");
        setDetailLoading(false);
        return;
      }
      setDetail({
        organizationName: data.organizationName,
        organizationSlug: data.organizationSlug,
        thread: data.thread,
      });
      setSendError(null);
      setDetailLoading(false);
      setConversations((current) =>
        current.map((conversation) =>
          conversation.threadId === threadId
            ? { ...conversation, unreadCount: 0 }
            : conversation,
        ),
      );
    } catch (err) {
      if (requestId !== detailRequestRef.current) return;
      setDetail(null);
      setSendError(err instanceof Error ? err.message : "Failed to load conversation.");
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await loadConversations();
        if (!cancelled && requestedThreadId) {
          await loadDetail(requestedThreadId);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load support conversations.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadConversations, loadDetail, requestedThreadId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void loadConversations().catch(() => undefined);
      if (selectedId) void loadDetail(selectedId);
    }, 20000);
    return () => window.clearInterval(timer);
  }, [loadConversations, loadDetail, selectedId]);

  const schools = useMemo(() => {
    const counts = new Map<string, number>();
    for (const conversation of conversations) {
      counts.set(
        conversation.organizationName,
        (counts.get(conversation.organizationName) ?? 0) + 1,
      );
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [conversations]);

  const visibleConversations = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return conversations.filter((conversation) => {
      if (schoolFilter !== "all" && conversation.organizationName !== schoolFilter) {
        return false;
      }
      if (!needle) return true;
      return (
        conversation.parentName.toLowerCase().includes(needle) ||
        conversation.organizationName.toLowerCase().includes(needle) ||
        conversation.preview?.toLowerCase().includes(needle)
      );
    });
  }, [conversations, query, schoolFilter]);

  const selected = conversations.find((conversation) => conversation.threadId === selectedId) ?? null;

  async function handleSend() {
    if (!selectedId || sending) return;
    const body = draft.trim();
    const filesToSend = [...stagedFiles];
    if (!body && filesToSend.length === 0) return;
    setSending(true);
    setSendError(null);
    try {
      let response: Response;
      if (filesToSend.length > 0) {
        const formData = new FormData();
        formData.set("body", body);
        for (const file of filesToSend) {
          formData.append("files", file);
        }
        response = await fetch(`/api/admin/support-messages/${selectedId}/messages`, {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch(`/api/admin/support-messages/${selectedId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        });
      }
      const data = (await response.json()) as { message?: PortalMessage; error?: string };
      if (!response.ok || !data.message) {
        throw new Error(data.error ?? "Failed to send reply.");
      }
      const sent = data.message;
      setDraft("");
      setStagedFiles([]);
      setDetail((current) =>
        current
          ? { ...current, thread: { ...current.thread, messages: [...current.thread.messages, sent] } }
          : current,
      );
      await loadConversations();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send reply.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <AdminPageState variant="loading" message="Loading support conversations…" />;
  }

  if (error) {
    return <AdminPageState variant="error" message={error} />;
  }

  return (
    <AdminMasterDetail
      listWidth="md"
      list={
        <>
          <AdminListPanelHeader>
            <div>
              <p className="text-sm font-semibold text-admin-text">Support</p>
              <p className="text-xs text-admin-muted">
                Replies appear as {MUDKITCHEN_SUPPORT_TEAM_NAME}.
              </p>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search parents or schools"
              className="w-full rounded-admin-md border border-admin-border bg-admin-bg px-2.5 py-1.5 text-sm text-admin-text outline-none focus:ring-2 focus:ring-admin-accent/30"
            />
            <div className="flex flex-wrap gap-1.5">
              <AdminFilterChip
                label="All"
                count={conversations.length}
                active={schoolFilter === "all"}
                onClick={() => setSchoolFilter("all")}
              />
              {schools.map(([name, count]) => (
                <AdminFilterChip
                  key={name}
                  label={name}
                  count={count}
                  active={schoolFilter === name}
                  onClick={() => setSchoolFilter(name)}
                />
              ))}
            </div>
          </AdminListPanelHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {visibleConversations.length === 0 ? (
              <AdminEmptyState message="No support conversations yet." />
            ) : (
              visibleConversations.map((conversation) => (
                <AdminListItem
                  key={conversation.threadId}
                  selected={conversation.threadId === selectedId}
                  onClick={() => {
                    if (conversation.threadId === selectedId) return;
                    setDetail(null);
                    setDetailLoading(true);
                    setDraft("");
                    setStagedFiles([]);
                    setSendError(null);
                    setSelectedId(conversation.threadId);
                    void loadDetail(conversation.threadId);
                  }}
                  title={conversation.parentName}
                  subtitle={conversation.organizationName}
                  meta={
                    conversation.lastMessageAt
                      ? formatMessageTime(conversation.lastMessageAt)
                      : undefined
                  }
                  badge={
                    conversation.unreadCount > 0 ? (
                      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-admin-accent" />
                    ) : null
                  }
                  footer={
                    conversation.preview
                      ? conversation.preview.length > 90
                        ? `${conversation.preview.slice(0, 90)}…`
                        : conversation.preview
                      : undefined
                  }
                  leading={
                    <ParentAvatar
                      name={conversation.parentName}
                      photoUrl={conversation.parentPhotoUrl}
                    />
                  }
                />
              ))
            )}
          </div>
        </>
      }
      detail={
        !selectedId ? (
          <AdminDetailEmpty message="Select a parent to reply." />
        ) : detailLoading && !detail ? (
          <div className="flex h-full items-center justify-center text-sm text-admin-faint">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading conversation…
          </div>
        ) : detail ? (
          <div className="flex h-full min-h-0 flex-col">
            <div className="border-b border-admin-border px-5 py-4">
              <p className="text-sm font-semibold text-admin-text">
                {selected?.parentName ?? detail.thread.title}
              </p>
              <p className="text-xs text-admin-muted">
                {selected?.organizationName ?? detail.organizationName}
                {selected?.parentEmail ? ` · ${selected.parentEmail}` : ""}
              </p>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {detail.thread.messages.length === 0 ? (
                <p className="text-sm text-admin-faint">No messages yet.</p>
              ) : (
                detail.thread.messages.map((message) => (
                  <SupportBubble key={message.id} message={message} />
                ))
              )}
            </div>
            <form
              className="border-t border-admin-border px-5 py-4"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSend();
              }}
            >
              {sendError ? <p className="mb-2 text-sm text-admin-error">{sendError}</p> : null}
              {stagedFiles.length > 0 ? (
                <div className="mb-2 flex flex-wrap gap-2">
                  {stagedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center gap-1 rounded-full border border-admin-border bg-admin-bg px-3 py-1 text-xs text-admin-muted"
                    >
                      <span className="max-w-[160px] truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setStagedFiles(stagedFiles.filter((_, i) => i !== index))}
                        className="cursor-pointer text-admin-faint hover:text-admin-text"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={3}
                placeholder={`Reply as ${MUDKITCHEN_SUPPORT_TEAM_NAME}`}
                className="w-full resize-none rounded-admin-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text outline-none focus:ring-2 focus:ring-admin-accent/30"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sending || stagedFiles.length >= MAX_MESSAGE_ATTACHMENTS}
                    className="shrink-0 rounded-admin-md border border-admin-border p-1.5 text-admin-muted hover:bg-admin-surface disabled:opacity-50"
                    aria-label="Attach files"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept="application/pdf,image/jpeg,image/png,image/webp,image/gif"
                    onChange={(event) => {
                      if (event.target.files) addStagedFiles(event.target.files);
                      event.target.value = "";
                    }}
                  />
                  <p className="text-xs text-admin-faint">
                    Parents and staff see the MudKitchen logo and team name.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={sending || (draft.trim().length === 0 && stagedFiles.length === 0)}
                  className="shrink-0 rounded-admin-md bg-admin-accent px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {sending ? "Sending…" : "Send"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <AdminDetailEmpty message={sendError ?? "This conversation could not be loaded."} />
        )
      }
    />
  );
}

function SupportBubble({ message }: { message: PortalMessage }) {
  const deleted = Boolean(message.deletedAt);
  return (
    <div className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
          message.isOwn
            ? "bg-admin-accent text-white"
            : "bg-admin-surface text-admin-text border border-admin-border"
        }`}
      >
        {!message.isOwn ? (
          <p className={`mb-1 text-xs font-medium ${message.isOwn ? "text-white/80" : "text-admin-muted"}`}>
            {message.senderName}
          </p>
        ) : null}
        {deleted || message.body.trim() ? (
          <p className={deleted ? "italic opacity-80" : undefined}>
            {deleted ? "Message deleted" : message.body}
          </p>
        ) : null}
        {message.attachments.length > 0 ? (
          <ul className="mt-2 space-y-1 text-xs">
            {message.attachments.map((attachment) => (
              <li key={attachment.id}>
                {attachment.url ? (
                  <a href={attachment.url} className="underline" target="_blank" rel="noreferrer">
                    {attachment.fileName}
                  </a>
                ) : (
                  attachment.fileName
                )}
              </li>
            ))}
          </ul>
        ) : null}
        <p className={`mt-1 text-[11px] ${message.isOwn ? "text-white/70" : "text-admin-faint"}`}>
          {message.timeLabel}
          {message.editedAt && !deleted ? " · Edited" : ""}
        </p>
      </div>
    </div>
  );
}
