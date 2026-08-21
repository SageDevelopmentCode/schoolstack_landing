"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { buildAdminSectionedListItems } from "@/lib/messages/admin-thread-sections";
import { contactKeyForThread } from "@/lib/messages/participants-from-contact";
import {
  threadDetailFromContact,
  threadDetailFromSummary,
} from "@/lib/messages/thread-placeholders";
import { useMessagesRefresh } from "@/lib/messages/messages-refresh-context";
import { useVisibilityPolling } from "@/lib/hooks/use-visibility-polling";
import { registerWebPushSubscription } from "@/lib/messages/web-push-client";
import type {
  MessageContact,
  MessageThreadDetail,
  MessageThreadSummary,
  MessagesInboxData,
  PortalMessage,
} from "@/lib/messages/types";
import MessagesConversationList from "./MessagesConversationList";
import MessagesConversationListSkeleton from "./MessagesConversationListSkeleton";
import MessagesEmptyState from "./MessagesEmptyState";
import MessagesNewConversationModal from "./MessagesNewConversationModal";
import MessagesThreadView, {
  type MessagesComposeBanner,
} from "./MessagesThreadView";
import type { MessagesLayoutVariant } from "./MessagesAvatar";
import SkeletonBlock from "@/components/school-admin/skeletons/SkeletonBlock";
import TeacherStudentDetailPanel from "@/components/school-teacher/TeacherStudentDetailPanel";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { AdminEnrolledStudentSummary } from "@/lib/school-admin/enrolled-students";
import type { MessageStudentSummary } from "@/lib/messages/types";

export type MessagesApiConfig = {
  basePath: string;
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  familyId?: string;
  viewer: "parent" | "teacher" | "admin";
};

export type MessagesTeacherPortalConfig = {
  organizationId: string;
  organizationSlug: string;
  staffMemberId: string;
  branding: OrganizationBranding;
};

function toEnrolledStudentSummary(
  summary: MessageStudentSummary,
): AdminEnrolledStudentSummary {
  return summary;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Request failed.");
  }
  return data as T;
}

function mergeMessages(
  existing: PortalMessage[],
  incoming: PortalMessage[],
): PortalMessage[] {
  const map = new Map<string, PortalMessage>();
  for (const message of existing) {
    map.set(message.id, message);
  }
  for (const message of incoming) {
    map.set(message.id, message);
  }
  return [...map.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function isFamilyStaffThread(thread: MessageThreadSummary | MessageThreadDetail): boolean {
  const hasFamily = thread.participants.some((participant) => participant.kind === "family");
  const hasStaff = thread.participants.some(
    (participant) => participant.kind === "staff_member",
  );
  const hasOffice = thread.participants.some(
    (participant) => participant.kind === "school_office",
  );
  return hasFamily && hasStaff && !hasOffice;
}

function resolveAdminComposeState(
  viewer: MessagesApiConfig["viewer"],
  thread: MessageThreadDetail | null,
  readOnly: boolean,
  staffDisplayName?: string | null,
): { disabled: boolean; banner: MessagesComposeBanner | null } {
  if (viewer !== "admin" || readOnly || !thread) {
    return { disabled: readOnly, banner: null };
  }

  if (!isFamilyStaffThread(thread)) {
    return { disabled: false, banner: null };
  }

  const displayName = staffDisplayName?.trim();
  if (displayName) {
    return {
      disabled: false,
      banner: { variant: "info", staffDisplayName: displayName },
    };
  }

  return {
    disabled: true,
    banner: {
      variant: "warning",
      message:
        "Link a staff profile to reply on teacher threads, or message via the school office inbox.",
    },
  };
}

export default function MessagesInboxLayout({
  api,
  initialInbox,
  readOnly = false,
  C,
  variant = "card",
  teacherPortal = null,
}: {
  api: MessagesApiConfig;
  initialInbox?: MessagesInboxData;
  readOnly?: boolean;
  C: AdminThemeTokens;
  variant?: MessagesLayoutVariant;
  teacherPortal?: MessagesTeacherPortalConfig | null;
}) {
  const searchParams = useSearchParams();
  const [threads, setThreads] = useState<MessageThreadSummary[]>(initialInbox?.threads ?? []);
  const [contacts, setContacts] = useState<MessageContact[]>(initialInbox?.contacts ?? []);
  const [viewerContext, setViewerContext] = useState(initialInbox?.viewerContext);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<MessageThreadDetail | null>(null);
  const [input, setInput] = useState("");
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(!initialInbox);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [pushPromptDismissed, setPushPromptDismissed] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<AdminEnrolledStudentSummary | null>(
    null,
  );
  const deepLinkHandled = useRef(false);
  const pendingOptimisticIds = useRef<Set<string>>(new Set());

  const query = useMemo(
    () =>
      new URLSearchParams({
        organizationId: api.organizationId,
        schoolName: api.schoolName,
      }).toString(),
    [api.organizationId, api.schoolName],
  );

  const loadInbox = useCallback(async () => {
    try {
      const data = await fetchJson<MessagesInboxData>(
        `${api.basePath}/threads?${query}`,
      );
      setThreads(data.threads);
      setContacts(data.contacts);
      setViewerContext(data.viewerContext);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages.");
    } finally {
      setLoadingInbox(false);
    }
  }, [api.basePath, query]);

  const clearThreadUnread = useCallback((threadId: string) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId ? { ...thread, unreadCount: 0 } : thread,
      ),
    );
  }, []);

  const loadThread = useCallback(
    async (threadId: string, options?: { silent?: boolean }) => {
      if (!options?.silent) setLoadingMessages(true);
      try {
        const data = await fetchJson<{ thread: MessageThreadDetail }>(
          `${api.basePath}/threads/${threadId}?${query}`,
        );
        setActiveThread((prev) => {
          if (!prev || prev.id !== threadId) return data.thread;
          const optimistic = prev.messages.filter((message) => message.pending);
          return {
            ...data.thread,
            messages: mergeMessages(data.thread.messages, optimistic),
          };
        });
        setActiveThreadId(threadId);
        setError(null);
        void loadInbox();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load conversation.");
      } finally {
        if (!options?.silent) setLoadingMessages(false);
      }
    },
    [api.basePath, loadInbox, query],
  );

  const selectThread = useCallback(
    async (thread: MessageThreadSummary) => {
      setMobileView("chat");
      setActiveThreadId(thread.id);
      setActiveThread((prev) =>
        threadDetailFromSummary(thread, prev?.id === thread.id ? prev.messages : []),
      );
      clearThreadUnread(thread.id);
      setLoadingMessages(true);
      try {
        await loadThread(thread.id, { silent: true });
      } finally {
        setLoadingMessages(false);
      }
    },
    [clearThreadUnread, loadThread],
  );

  const openContact = useCallback(
    async (contact: MessageContact) => {
      const existing = threads.find((thread) => {
        const key = contactKeyForThread(thread.participants, api.viewer, {
          familyId: api.familyId,
        });
        return key === contact.key;
      });

      if (existing) {
        await selectThread(existing);
        return;
      }

      if (readOnly) return;

      setMobileView("chat");
      setActiveThread(threadDetailFromContact(contact));
      setActiveThreadId(`pending-${contact.key}`);
      setLoadingMessages(true);
      try {
        const data = await fetchJson<{ threadId: string }>(`${api.basePath}/threads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId: api.organizationId,
            familyId: api.familyId,
            contact,
          }),
        });
        setActiveThreadId(data.threadId);
        await loadThread(data.threadId, { silent: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start conversation.");
        setActiveThread(null);
        setActiveThreadId(null);
        setMobileView("list");
      } finally {
        setLoadingMessages(false);
      }
    },
    [
      api.basePath,
      api.familyId,
      api.organizationId,
      api.viewer,
      loadThread,
      readOnly,
      selectThread,
      threads,
    ],
  );

  const handleSelect = useCallback(
    async (key: string) => {
      const thread = threads.find((item) => item.id === key);
      if (thread) {
        await selectThread(thread);
        return;
      }

      const contact = contacts.find((item) => item.key === key);
      if (contact) {
        await openContact(contact);
      }
    },
    [contacts, openContact, selectThread, threads],
  );

  const handleNewConversationSelect = useCallback(
    async (contact: MessageContact) => {
      setNewConversationOpen(false);
      await openContact(contact);
    },
    [openContact],
  );

  const handleSend = useCallback(async () => {
    if (!activeThreadId || readOnly) return;
    const body = input.trim();
    if (!body && stagedFiles.length === 0) return;

    const optimisticId = `pending-${crypto.randomUUID()}`;
    const optimisticMessage: PortalMessage = {
      id: optimisticId,
      threadId: activeThreadId,
      body,
      senderUserId: "self",
      senderKind: api.viewer === "parent" ? "guardian" : "staff_member",
      senderName: "You",
      isOwn: true,
      createdAt: new Date().toISOString(),
      timeLabel: "Now",
      attachments: stagedFiles.map((file, index) => ({
        id: `pending-file-${index}`,
        fileName: file.name,
        mimeType: file.type || null,
        sizeBytes: file.size,
      })),
      pending: true,
    };

    pendingOptimisticIds.current.add(optimisticId);
    setActiveThread((prev) =>
      prev
        ? { ...prev, messages: [...prev.messages, optimisticMessage] }
        : prev,
    );

    const filesToSend = [...stagedFiles];
    setInput("");
    setStagedFiles([]);
    setSending(true);

    try {
      let response: Response;
      if (filesToSend.length > 0) {
        const formData = new FormData();
        formData.set("organizationId", api.organizationId);
        formData.set("organizationSlug", api.organizationSlug);
        formData.set("schoolName", api.schoolName);
        formData.set("body", body);
        for (const file of filesToSend) {
          formData.append("files", file);
        }
        response = await fetch(`${api.basePath}/threads/${activeThreadId}/messages`, {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch(`${api.basePath}/threads/${activeThreadId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId: api.organizationId,
            organizationSlug: api.organizationSlug,
            schoolName: api.schoolName,
            body,
          }),
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to send message.");
      }

      const serverMessage = data.message as PortalMessage;
      pendingOptimisticIds.current.delete(optimisticId);
      setActiveThread((prev) => {
        if (!prev) return prev;
        const withoutPending = prev.messages.filter((message) => message.id !== optimisticId);
        return {
          ...prev,
          messages: mergeMessages(withoutPending, [serverMessage]),
        };
      });
      await loadThread(activeThreadId, { silent: true });
    } catch (err) {
      pendingOptimisticIds.current.delete(optimisticId);
      setActiveThread((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.filter((message) => message.id !== optimisticId),
            }
          : prev,
      );
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  }, [
    activeThreadId,
    api.basePath,
    api.organizationId,
    api.organizationSlug,
    api.schoolName,
    api.viewer,
    input,
    loadThread,
    readOnly,
    stagedFiles,
  ]);

  const onThreadMessage = useCallback(
    (threadId: string) => {
      if (threadId === activeThreadId) {
        void loadThread(threadId, { silent: true });
      }
    },
    [activeThreadId, loadThread],
  );

  const messagesRefresh = useMessagesRefresh();
  const realtimeConnected = messagesRefresh?.realtimeConnected ?? false;

  useEffect(() => {
    if (!messagesRefresh || readOnly) return undefined;
    return messagesRefresh.registerInboxConsumer({
      activeThreadId,
      onInboxChange: loadInbox,
      onThreadMessage,
    });
  }, [activeThreadId, loadInbox, messagesRefresh, onThreadMessage, readOnly]);

  const pollInbox = useCallback(() => {
    void loadInbox();
    if (activeThreadId) void loadThread(activeThreadId, { silent: true });
  }, [activeThreadId, loadInbox, loadThread]);

  useVisibilityPolling(pollInbox, 300_000, !readOnly && !realtimeConnected);

  useEffect(() => {
    if (!initialInbox) {
      queueMicrotask(() => {
        void loadInbox();
      });
    }
  }, [initialInbox, loadInbox]);

  useEffect(() => {
    const threadParam = searchParams.get("thread");
    if (!threadParam || deepLinkHandled.current || loadingInbox) return;
    deepLinkHandled.current = true;
    setMobileView("chat");
    setLoadingMessages(true);
    void loadThread(threadParam).finally(() => setLoadingMessages(false));
  }, [loadThread, loadingInbox, searchParams]);

  useEffect(() => {
    if (readOnly || pushPromptDismissed) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "default") return;

    const key = `messages-push-prompt:${api.organizationId}`;
    if (localStorage.getItem(key)) return;

    const timer = window.setTimeout(() => {
      void registerWebPushSubscription(api.organizationId).then((ok) => {
        localStorage.setItem(key, ok ? "granted" : "dismissed");
        if (!ok) setPushPromptDismissed(true);
      });
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [api.organizationId, pushPromptDismissed, readOnly]);

  const contactKeysWithThreads = new Set(
    threads
      .map((thread) =>
        contactKeyForThread(thread.participants, api.viewer, {
          familyId: api.familyId,
        }),
      )
      .filter(Boolean),
  );

  const embedded = variant === "embedded";
  const adminComposeState = useMemo(
    () =>
      resolveAdminComposeState(
        api.viewer,
        activeThread,
        readOnly,
        viewerContext?.staffDisplayName,
      ),
    [activeThread, api.viewer, readOnly, viewerContext?.staffDisplayName],
  );

  const teacherStaffMemberId =
    teacherPortal?.staffMemberId ?? viewerContext?.staffMemberId ?? null;

  const handleStudentClick = useCallback(
    (studentId: string) => {
      if (api.viewer !== "teacher" || !teacherStaffMemberId) return;

      const summary =
        activeThread?.subtitleStudentSummaries?.find(
          (student) => student.id === studentId,
        ) ??
        threads
          .find((thread) =>
            thread.subtitleStudentSummaries?.some((student) => student.id === studentId),
          )
          ?.subtitleStudentSummaries?.find((student) => student.id === studentId) ??
        contacts
          .find((contact) =>
            contact.subtitleStudentSummaries?.some((student) => student.id === studentId),
          )
          ?.subtitleStudentSummaries?.find((student) => student.id === studentId);

      if (!summary) return;
      setSelectedStudent(toEnrolledStudentSummary(summary));
    },
    [activeThread, api.viewer, contacts, teacherStaffMemberId, threads],
  );

  const listItems = useMemo(() => {
    if (embedded && api.viewer === "admin") {
      return buildAdminSectionedListItems(threads);
    }

    if (embedded) {
      return threads.map((thread) => ({ type: "thread" as const, thread }));
    }

    return [
      ...threads.map((thread) => ({ type: "thread" as const, thread })),
      ...contacts
        .filter((contact) => !contactKeysWithThreads.has(contact.key))
        .map((contact) => ({ type: "contact" as const, contact })),
    ];
  }, [api.viewer, contactKeysWithThreads, contacts, embedded, threads]);

  const newConversationContacts = contacts.filter(
    (contact) => !contactKeysWithThreads.has(contact.key),
  );

  const activeKey = activeThreadId;
  const reducedMotion = useReducedMotion() ?? false;

  if (loadingInbox) {
    if (embedded) {
      return (
        <div
          className="flex flex-1 min-h-0 h-full flex-col overflow-hidden"
          style={{ backgroundColor: C.bg }}
        >
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <div
              className="flex w-full flex-col flex-shrink-0 border-r md:w-80 lg:w-96"
              style={{ borderColor: C.border, backgroundColor: C.bg }}
            >
              <div
                className="flex items-center justify-between border-b px-4 py-3.5"
                style={{ borderColor: C.border }}
              >
                <SkeletonBlock C={C} className="h-5 w-24" />
                <SkeletonBlock C={C} className="h-8 w-16 rounded-full" />
              </div>
              <MessagesConversationListSkeleton C={C} embedded />
            </div>
            <div className="hidden flex-1 md:block" style={{ backgroundColor: C.bg }} />
          </div>
        </div>
      );
    }

    return (
      <div
        className={`flex overflow-hidden ${
          embedded ? "flex-1 min-h-0" : "flex-1 min-h-[480px] h-[calc(100vh-220px)] max-h-[720px] border rounded-xl"
        }`}
        style={{
          borderColor: embedded ? undefined : C.border,
          backgroundColor: C.bg,
        }}
      >
        <div
          className="flex w-72 flex-shrink-0 flex-col border-r"
          style={{ borderColor: C.border }}
        >
          <div className="border-b p-3" style={{ borderColor: C.border }}>
            <SkeletonBlock C={C} className="h-4 w-20" />
          </div>
          <MessagesConversationListSkeleton C={C} />
        </div>
        <div className="flex-1" style={{ backgroundColor: C.bg }} />
      </div>
    );
  }

  if (!loadingInbox && threads.length === 0 && contacts.length === 0) {
    return (
      <MessagesEmptyState
        title="No messages yet"
        description="When your school enables messaging, conversations will appear here."
        C={C}
        variant={variant}
      />
    );
  }

  return (
    <div
      className={`flex flex-col overflow-hidden ${
        embedded
          ? "flex-1 min-h-0 h-full"
          : "flex-1 min-h-[480px] h-[calc(100vh-220px)] max-h-[720px] border rounded-xl"
      }`}
      style={{
        borderColor: embedded ? undefined : C.border,
        backgroundColor: C.bg,
      }}
    >
      {error && (
        <div className="px-4 py-2 text-sm border-b" style={{ color: "#b45309", borderColor: C.border, backgroundColor: "#fffbeb" }}>
          {error}
        </div>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div
          className={`border-r flex flex-col flex-shrink-0 ${
            mobileView === "chat" ? "hidden md:flex" : "flex"
          } w-full ${embedded ? "md:w-80 lg:w-96" : "md:w-72"}`}
          style={{ borderColor: C.border, backgroundColor: C.bg }}
        >
          {embedded ? (
            <div
              className="flex items-center justify-between border-b px-4 py-3.5"
              style={{ borderColor: C.border }}
            >
              <p className="text-base font-semibold" style={{ color: C.textPrimary }}>
                Messages
              </p>
              <motion.button
                type="button"
                onClick={() => setNewConversationOpen(true)}
                disabled={newConversationContacts.length === 0}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium cursor-pointer transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: C.accent, color: "#ffffff" }}
                aria-label="Start a new conversation"
                whileHover={reducedMotion ? undefined : { scale: 1.02 }}
                whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              >
                <Plus className="h-4 w-4" />
                New
              </motion.button>
            </div>
          ) : (
            <div className="border-b px-4 py-4" style={{ borderColor: C.border }}>
              <p className="text-base font-semibold" style={{ color: C.textPrimary }}>
                Messages
              </p>
            </div>
          )}
          <MessagesConversationList
            items={listItems}
            activeKey={activeKey}
            onSelect={handleSelect}
            C={C}
            showContactsHeader={!embedded}
            variant={variant}
            hideStudentSubtitle={api.viewer === "teacher" && embedded}
          />
        </div>

        <div
          className={`flex flex-col flex-1 min-w-0 ${
            mobileView === "list" ? "hidden md:flex" : "flex"
          }`}
        >
          {!embedded ? (
            <div className="md:hidden border-b px-3 py-2" style={{ borderColor: C.border }}>
              <button
                type="button"
                onClick={() => setMobileView("list")}
                className="inline-flex items-center gap-1 text-sm cursor-pointer"
                style={{ color: C.textSecondary }}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          ) : null}

          <MessagesThreadView
            thread={activeThread}
            input={input}
            onInputChange={setInput}
            files={stagedFiles}
            onFilesChange={setStagedFiles}
            onSend={handleSend}
            sending={sending}
            readOnly={readOnly || adminComposeState.disabled}
            composeBanner={adminComposeState.banner}
            C={C}
            variant={variant}
            onBack={embedded ? () => setMobileView("list") : undefined}
            loadingMessages={loadingMessages}
            onStudentClick={
              api.viewer === "teacher" && teacherStaffMemberId
                ? handleStudentClick
                : undefined
            }
          />
        </div>
      </div>

      {embedded ? (
        <MessagesNewConversationModal
          open={newConversationOpen}
          contacts={newConversationContacts}
          onClose={() => setNewConversationOpen(false)}
          onSelect={handleNewConversationSelect}
          C={C}
        />
      ) : null}

      <AnimatePresence>
        {selectedStudent && teacherPortal && teacherStaffMemberId ? (
          <TeacherStudentDetailPanel
            key={selectedStudent.id}
            student={selectedStudent}
            organizationId={teacherPortal.organizationId}
            staffMemberId={teacherStaffMemberId}
            branding={teacherPortal.branding}
            schoolSlug={teacherPortal.organizationSlug}
            detailAccess="messageableFamily"
            onClose={() => setSelectedStudent(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
