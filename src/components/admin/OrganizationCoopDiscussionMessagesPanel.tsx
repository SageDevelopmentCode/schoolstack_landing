"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import AdminReadOnlyMessageBubble from "@/components/admin/messages/AdminReadOnlyMessageBubble";
import { AdminDetailEmpty } from "@/components/admin/ui/AdminDetailEmpty";
import { AdminDetailHeader } from "@/components/admin/ui/AdminDetailHeader";
import { AdminDetailLayout } from "@/components/admin/ui/AdminDetailLayout";
import { AdminDetailSection } from "@/components/admin/ui/AdminDetailSection";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminListItem } from "@/components/admin/ui/AdminListItem";
import { AdminListPanelHeader } from "@/components/admin/ui/AdminListPanelHeader";
import { AdminMasterDetail } from "@/components/admin/ui/AdminMasterDetail";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import type { OrganizationCoopDiscussionThreadSummary } from "@/lib/admin/organization-coop-discussion-messages";
import type { ProgramCoopCurriculumDiscussionMessage } from "@/lib/admissions/program-coop-curriculum-discussion";
import { formatRelativeTime } from "@/lib/school-admin/activity-notifications";

type OrganizationCoopDiscussionMessagesPanelProps = {
  organizationId: string;
};

type SelectedThread = {
  programId: string;
  programName: string;
  curriculumId: string | null;
  threadLabel: string;
};

function threadId(thread: SelectedThread): string {
  return `${thread.programId}|${thread.curriculumId ?? "general"}`;
}

function formatMessageTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function CoopDiscussionDetailPanel({
  thread,
  messages,
  loading,
  error,
}: {
  thread: SelectedThread | null;
  messages: ProgramCoopCurriculumDiscussionMessage[];
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <AdminDetailLayout>
        <div className="flex items-center gap-2 py-12 text-sm text-admin-faint">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading discussion…
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
      <AdminDetailEmpty message="Select a discussion thread to review messages." />
    );
  }

  return (
    <AdminDetailLayout>
      <AdminDetailHeader
        title={thread.threadLabel}
        subtitle={thread.programName}
        badges={<AdminStatusBadge label="Co-op discussion" variant="neutral" />}
      />

      <AdminDetailSection title="Messages">
        {messages.length === 0 ? (
          <p className="text-sm text-admin-muted">No messages in this thread yet.</p>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <AdminReadOnlyMessageBubble
                key={message.id}
                senderName={message.senderDisplayName}
                roleLabel="Co-op parent"
                timestamp={formatMessageTimestamp(message.createdAt)}
                body={message.body}
                metadata={
                  message.pageNumber ? (
                    <p className="mt-2 text-xs text-admin-muted">
                      Page {message.pageNumber}
                    </p>
                  ) : null
                }
              />
            ))}
          </div>
        )}
      </AdminDetailSection>
    </AdminDetailLayout>
  );
}

export default function OrganizationCoopDiscussionMessagesPanel({
  organizationId,
}: OrganizationCoopDiscussionMessagesPanelProps) {
  const [threads, setThreads] = useState<OrganizationCoopDiscussionThreadSummary[]>([]);
  const [selectedThread, setSelectedThread] = useState<SelectedThread | null>(null);
  const [messages, setMessages] = useState<ProgramCoopCurriculumDiscussionMessage[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadThreads = useCallback(async () => {
    setListLoading(true);
    setListError(null);

    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/messages/coop-discussion`,
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load co-op discussion threads.");
      }

      const rows = (payload.threads as OrganizationCoopDiscussionThreadSummary[]) ?? [];
      setThreads(rows);

      const first = rows[0];
      setSelectedThread(
        first
          ? {
              programId: first.programId,
              programName: first.programName,
              curriculumId: first.curriculumId,
              threadLabel: first.threadLabel,
            }
          : null,
      );
      if (!first) {
        setMessages([]);
      }
    } catch (loadError) {
      setListError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load co-op discussion threads.",
      );
      setThreads([]);
      setSelectedThread(null);
      setMessages([]);
    } finally {
      setListLoading(false);
    }
  }, [organizationId]);

  const loadMessages = useCallback(
    async (thread: SelectedThread) => {
      setDetailLoading(true);
      setDetailError(null);

      try {
        const params = new URLSearchParams();
        if (thread.curriculumId) {
          params.set("curriculumId", thread.curriculumId);
        } else {
          params.set("curriculumId", "general");
        }

        const response = await fetch(
          `/api/admin/organizations/${organizationId}/messages/coop-discussion/${thread.programId}?${params}`,
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load co-op discussion messages.");
        }

        setMessages(
          (payload.messages as ProgramCoopCurriculumDiscussionMessage[]) ?? [],
        );
      } catch (loadError) {
        setDetailError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load co-op discussion messages.",
        );
        setMessages([]);
      } finally {
        setDetailLoading(false);
      }
    },
    [organizationId],
  );

  useEffect(() => {
    queueMicrotask(() => {
      setThreads([]);
      setSelectedThread(null);
      setMessages([]);
      void loadThreads();
    });
  }, [loadThreads]);

  useEffect(() => {
    if (!selectedThread) {
      queueMicrotask(() => {
        setMessages([]);
      });
      return;
    }

    queueMicrotask(() => {
      void loadMessages(selectedThread);
    });
  }, [loadMessages, selectedThread]);

  const selectedThreadId = selectedThread ? threadId(selectedThread) : null;

  return (
    <div className="min-h-[560px] h-[calc(100vh-14rem)] overflow-hidden rounded-admin-md border border-admin-border">
      <AdminMasterDetail
        className="h-full"
        list={
          <>
            <AdminListPanelHeader>
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-admin-text">Co-op discussion</h2>
                <p className="text-xs text-admin-muted">
                  Curriculum discussion threads across co-op programs.
                </p>
              </div>
            </AdminListPanelHeader>

            <div className="flex-1 overflow-y-auto">
              {listLoading ? (
                <div className="flex items-center gap-2 px-4 py-8 text-sm text-admin-faint">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Loading threads…
                </div>
              ) : listError ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-admin-error">{listError}</p>
                  <button
                    type="button"
                    onClick={() => void loadThreads()}
                    className="mt-3 rounded-admin-md border border-admin-border bg-admin-surface px-3 py-1.5 text-xs font-semibold text-admin-text hover:bg-admin-bg"
                  >
                    Try again
                  </button>
                </div>
              ) : threads.length === 0 ? (
                <AdminEmptyState message="This school does not have any co-op discussion messages yet." />
              ) : (
                threads.map((thread) => {
                  const current = {
                    programId: thread.programId,
                    programName: thread.programName,
                    curriculumId: thread.curriculumId,
                    threadLabel: thread.threadLabel,
                  };
                  const id = threadId(current);

                  return (
                    <AdminListItem
                      key={id}
                      selected={selectedThreadId === id}
                      onClick={() => setSelectedThread(current)}
                      title={thread.threadLabel}
                      subtitle={thread.programName}
                      badge={
                        <AdminStatusBadge
                          label={`${thread.messageCount} message${thread.messageCount === 1 ? "" : "s"}`}
                          variant="neutral"
                        />
                      }
                      footer={
                        thread.lastMessageAt
                          ? formatRelativeTime(thread.lastMessageAt)
                          : undefined
                      }
                    />
                  );
                })
              )}
            </div>
          </>
        }
        detail={
          <CoopDiscussionDetailPanel
            thread={selectedThread}
            messages={messages}
            loading={detailLoading}
            error={detailError}
          />
        }
      />
    </div>
  );
}
