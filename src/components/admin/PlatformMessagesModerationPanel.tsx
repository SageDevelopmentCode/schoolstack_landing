"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { AdminDetailEmpty } from "@/components/admin/ui/AdminDetailEmpty";
import { AdminDetailHeader } from "@/components/admin/ui/AdminDetailHeader";
import { AdminDetailLayout } from "@/components/admin/ui/AdminDetailLayout";
import { AdminDetailSection } from "@/components/admin/ui/AdminDetailSection";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminListItem } from "@/components/admin/ui/AdminListItem";
import { AdminListPanelHeader } from "@/components/admin/ui/AdminListPanelHeader";
import { AdminMasterDetail } from "@/components/admin/ui/AdminMasterDetail";
import { AdminPageState } from "@/components/admin/ui/AdminPageState";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import MessagesAvatar from "@/components/messages/MessagesAvatar";
import MessagesDualAvatar from "@/components/messages/MessagesDualAvatar";
import { getAdminThreadSection } from "@/lib/messages/admin-thread-sections";
import type {
  MessageThreadDetail,
  MessageThreadSummary,
  PortalMessage,
  PortalMessageSenderKind,
} from "@/lib/messages/types";
import { formatRelativeTime } from "@/lib/school-admin/activity-notifications";

const PAGE_SIZE = 25;

type OrganizationOption = {
  id: string;
  name: string;
  slug: string;
};

type PlatformMessagesModerationPanelProps = {
  organizations: OrganizationOption[];
  organizationId: string;
  onOrganizationChange: (organizationId: string) => void;
  organizationsLoading: boolean;
  organizationsError: string | null;
};

function senderKindLabel(kind: PortalMessageSenderKind): string {
  switch (kind) {
    case "guardian":
      return "Parent";
    case "staff_member":
      return "Teacher";
    case "org_admin":
      return "School admin";
    default:
      return "Unknown";
  }
}

function threadTypeLabel(thread: MessageThreadSummary): string {
  const section = getAdminThreadSection(thread);
  if (section === "family_office") return "Family & office";
  if (section === "family_staff") return "Family & teacher";
  return "Other";
}

function threadTypeVariant(
  thread: MessageThreadSummary,
): "scheduled" | "success" | "neutral" {
  const section = getAdminThreadSection(thread);
  if (section === "family_office") return "scheduled";
  if (section === "family_staff") return "success";
  return "neutral";
}

function renderThreadAvatar(thread: MessageThreadSummary, selected: boolean) {
  const ringClassName = selected ? "ring-admin-accent-soft" : "ring-admin-surface";

  if (thread.listAvatars?.length === 2) {
    return (
      <MessagesDualAvatar
        avatars={thread.listAvatars}
        size="sm"
        ringClassName={ringClassName}
      />
    );
  }

  return <MessagesAvatar name={thread.title} color={thread.color} size="sm" />;
}

function formatMessageTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function MessageAttachments({
  attachments,
}: {
  attachments: PortalMessage["attachments"];
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      {attachments.map((attachment) => (
        <a
          key={attachment.id}
          href={attachment.url ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-admin-accent underline"
        >
          <FileText className="h-3.5 w-3.5" aria-hidden />
          {attachment.fileName}
        </a>
      ))}
    </div>
  );
}

function MessageBubble({ message }: { message: PortalMessage }) {
  return (
    <div className="rounded-admin-md border border-admin-border bg-admin-surface p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium text-admin-text">{message.senderName}</p>
        <AdminStatusBadge
          label={senderKindLabel(message.senderKind)}
          variant="neutral"
        />
        <p className="text-xs text-admin-faint">{formatMessageTimestamp(message.createdAt)}</p>
      </div>
      {message.body.trim() ? (
        <p className="mt-2 whitespace-pre-wrap text-sm text-admin-text">{message.body}</p>
      ) : null}
      <MessageAttachments attachments={message.attachments} />
    </div>
  );
}

function ThreadDetailPanel({
  thread,
  loading,
  error,
}: {
  thread: MessageThreadDetail | null;
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <AdminDetailLayout>
        <div className="flex items-center gap-2 py-12 text-sm text-admin-faint">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading conversation…
        </div>
      </AdminDetailLayout>
    );
  }

  if (error) {
    return (
      <AdminDetailLayout>
        <p className="text-sm text-admin-error">{error}</p>
      </AdminDetailLayout>
    );
  }

  if (!thread) {
    return (
      <AdminDetailEmpty message="Select a conversation to review messages." />
    );
  }

  return (
    <AdminDetailLayout>
      <AdminDetailHeader
        title={thread.title}
        subtitle={thread.subtitle}
        badges={
          <AdminStatusBadge
            label={threadTypeLabel(thread)}
            variant={threadTypeVariant(thread)}
          />
        }
      />

      <AdminDetailSection title="Messages">
        {thread.messages.length === 0 ? (
          <p className="text-sm text-admin-muted">No messages in this thread yet.</p>
        ) : (
          <div className="space-y-3">
            {thread.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        )}
      </AdminDetailSection>
    </AdminDetailLayout>
  );
}

export default function PlatformMessagesModerationPanel({
  organizations,
  organizationId,
  onOrganizationChange,
  organizationsLoading,
  organizationsError,
}: PlatformMessagesModerationPanelProps) {
  const [threads, setThreads] = useState<MessageThreadSummary[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<MessageThreadDetail | null>(null);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [threadsLoadingMore, setThreadsLoadingMore] = useState(false);
  const [threadDetailLoading, setThreadDetailLoading] = useState(false);
  const [threadsError, setThreadsError] = useState<string | null>(null);
  const [threadDetailError, setThreadDetailError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchThreadsPage = useCallback(
    async (cursor: string | null, append: boolean) => {
      if (!organizationId) return;

      if (append) {
        setThreadsLoadingMore(true);
      } else {
        setThreadsLoading(true);
      }
      setThreadsError(null);

      try {
        const params = new URLSearchParams({
          organizationId,
          limit: String(PAGE_SIZE),
        });
        if (cursor) params.set("cursor", cursor);

        const response = await fetch(`/api/admin/messages/threads?${params}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load message threads.");
        }

        const pageThreads = (payload.threads as MessageThreadSummary[]) ?? [];
        setThreads((prev) => (append ? [...prev, ...pageThreads] : pageThreads));
        setNextCursor(payload.nextCursor ?? null);
        setHasMore(Boolean(payload.hasMore));

        if (!append) {
          const firstThreadId = pageThreads[0]?.id ?? null;
          setSelectedThreadId(firstThreadId);
          if (!firstThreadId) {
            setSelectedThread(null);
          }
        }
      } catch (loadError) {
        setThreadsError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load message threads.",
        );
        if (!append) {
          setThreads([]);
          setSelectedThreadId(null);
          setSelectedThread(null);
          setNextCursor(null);
          setHasMore(false);
        }
      } finally {
        if (append) {
          setThreadsLoadingMore(false);
        } else {
          setThreadsLoading(false);
        }
      }
    },
    [organizationId],
  );

  const loadThreads = useCallback(async () => {
    await fetchThreadsPage(null, false);
  }, [fetchThreadsPage]);

  const loadMoreThreads = useCallback(async () => {
    if (!hasMore || threadsLoadingMore || threadsLoading || !nextCursor) return;
    await fetchThreadsPage(nextCursor, true);
  }, [fetchThreadsPage, hasMore, nextCursor, threadsLoading, threadsLoadingMore]);

  const loadThreadDetail = useCallback(
    async (threadId: string) => {
      if (!organizationId) return;

      setThreadDetailLoading(true);
      setThreadDetailError(null);

      try {
        const params = new URLSearchParams({ organizationId });
        const response = await fetch(
          `/api/admin/messages/threads/${threadId}?${params}`,
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load conversation.");
        }

        setSelectedThread((payload.thread as MessageThreadDetail) ?? null);
      } catch (loadError) {
        setThreadDetailError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load conversation.",
        );
        setSelectedThread(null);
      } finally {
        setThreadDetailLoading(false);
      }
    },
    [organizationId],
  );

  useEffect(() => {
    if (!organizationId) return;

    queueMicrotask(() => {
      setThreads([]);
      setSelectedThreadId(null);
      setSelectedThread(null);
      setNextCursor(null);
      setHasMore(false);
      void loadThreads();
    });
  }, [loadThreads, organizationId]);

  useEffect(() => {
    if (!selectedThreadId || !organizationId) {
      setSelectedThread(null);
      return;
    }

    queueMicrotask(() => {
      void loadThreadDetail(selectedThreadId);
    });
  }, [loadThreadDetail, organizationId, selectedThreadId]);

  useEffect(() => {
    if (!hasMore || threadsLoading || threadsLoadingMore) return;

    const root = scrollContainerRef.current;
    const sentinel = loadMoreRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMoreThreads();
        }
      },
      { root, rootMargin: "120px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMoreThreads, threads.length, threadsLoading, threadsLoadingMore]);

  if (organizationsLoading) {
    return <AdminPageState variant="loading" />;
  }

  if (organizationsError) {
    return <AdminPageState variant="error" message={organizationsError} />;
  }

  if (organizations.length === 0) {
    return (
      <div className="flex h-[calc(100vh-3rem)] items-center justify-center">
        <AdminEmptyState message="No schools found." />
      </div>
    );
  }

  return (
    <AdminMasterDetail
      list={
        <>
          <AdminListPanelHeader>
            <div className="space-y-1">
              <h1 className="text-sm font-semibold text-admin-text">Messages</h1>
              <p className="text-xs text-admin-muted">
                Read-only oversight of parent, teacher, and school office conversations.
              </p>
            </div>
            <AdminSelect
              value={organizationId}
              onChange={(event) => onOrganizationChange(event.target.value)}
              className="w-full"
              triggerClassName="text-xs px-2 py-1.5 text-admin-text"
              aria-label="School filter"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </AdminSelect>
          </AdminListPanelHeader>

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
            {threadsLoading && threads.length === 0 ? (
              <div className="flex items-center gap-2 px-4 py-8 text-sm text-admin-faint">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Loading threads…
              </div>
            ) : threadsError ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-admin-error">{threadsError}</p>
                <button
                  type="button"
                  onClick={() => void loadThreads()}
                  className="mt-3 rounded-admin-md border border-admin-border bg-admin-surface px-3 py-1.5 text-xs font-semibold text-admin-text hover:bg-admin-bg"
                >
                  Try again
                </button>
              </div>
            ) : threads.length === 0 ? (
              <AdminEmptyState message="This school does not have any message threads yet." />
            ) : (
              <>
                {threads.map((thread) => (
                  <AdminListItem
                    key={thread.id}
                    selected={selectedThreadId === thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    leading={renderThreadAvatar(
                      thread,
                      selectedThreadId === thread.id,
                    )}
                    title={thread.title}
                    subtitle={thread.lastMessagePreview ?? "No messages yet"}
                    badge={
                      <AdminStatusBadge
                        label={threadTypeLabel(thread)}
                        variant={threadTypeVariant(thread)}
                      />
                    }
                    footer={
                      thread.lastMessageAt
                        ? formatRelativeTime(thread.lastMessageAt)
                        : undefined
                    }
                  />
                ))}
                <div ref={loadMoreRef} className="h-4" aria-hidden />
                {threadsLoadingMore ? (
                  <div className="flex justify-center py-3">
                    <Loader2
                      className="h-4 w-4 animate-spin text-admin-faint"
                      aria-label="Loading more threads"
                    />
                  </div>
                ) : null}
              </>
            )}
          </div>
        </>
      }
      detail={
        <ThreadDetailPanel
          thread={selectedThread}
          loading={threadDetailLoading}
          error={threadDetailError}
        />
      }
    />
  );
}
