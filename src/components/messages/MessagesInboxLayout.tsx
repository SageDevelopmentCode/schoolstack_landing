"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2, Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { buildAdminSectionedListItems } from "@/lib/messages/admin-thread-sections";
import { contactKeyForThread } from "@/lib/messages/participants-from-contact";
import {
  threadDetailFromContact,
  threadDetailFromSummary,
  threadSummaryFromDetail,
  upsertThreadSummary,
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
import ParentMessagesInboxHeader from "@/components/school-parent/messages/ParentMessagesInboxHeader";
import AdminMessagesInboxHeader from "@/components/school-admin/messages/AdminMessagesInboxHeader";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  isAdminStoryMessagesVariant,
  isSplitPaneMessagesVariant,
  isStoryMessagesVariant,
} from "@/lib/messages/messages-layout-variant";
import { parentMessagesViewTransition } from "@/components/school-parent/messages/parent-messages-view-transition";
import TeacherStudentDetailPanel from "@/components/school-teacher/TeacherStudentDetailPanel";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { AdminEnrolledStudentSummary } from "@/lib/school-admin/enrolled-students";
import type { MessageStudentSummary } from "@/lib/messages/types";
import { initialInboxLoadingState } from "@/lib/messages/thread-list-helpers";

export type MessagesApiConfig = {
  basePath: string;
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  familyId?: string;
  guardianId?: string;
  programId?: string;
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
  return {
    ...summary,
    classroomIds: [],
    hasStandingHealthItems: false,
  };
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

function isGuardianStaffThread(thread: MessageThreadSummary | MessageThreadDetail): boolean {
  const hasParent = thread.participants.some(
    (participant) => participant.kind === "guardian" || participant.kind === "family",
  );
  const hasStaff = thread.participants.some(
    (participant) => participant.kind === "staff_member",
  );
  const hasOffice = thread.participants.some(
    (participant) => participant.kind === "school_office",
  );
  return hasParent && hasStaff && !hasOffice;
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

  if (!isGuardianStaffThread(thread)) {
    return { disabled: false, banner: null };
  }

  const displayName = staffDisplayName?.trim();
  if (displayName) {
    return {
      disabled: false,
      banner: {
        variant: "info",
        message:
          "Parent & teacher conversation — for your review. Replies appear as " +
          displayName +
          ", not the school office inbox.",
      },
    };
  }

  return {
    disabled: true,
    banner: {
      variant: "warning",
      message:
        "Parent & teacher conversation — for your review. Link a staff profile to reply, or message families via your school office inbox.",
    },
  };
}

export type MessagesInboxActions = {
  openNewConversation: () => void;
  canStartNewConversation: boolean;
};

export default function MessagesInboxLayout({
  api,
  initialInbox,
  readOnly = false,
  deferContactsLoad = false,
  C,
  variant = "card",
  theme,
  teacherPortal = null,
  onRegisterActions,
}: {
  api: MessagesApiConfig;
  initialInbox?: MessagesInboxData;
  readOnly?: boolean;
  deferContactsLoad?: boolean;
  C: AdminThemeTokens;
  variant?: MessagesLayoutVariant;
  theme?: ParentThemeTokens;
  teacherPortal?: MessagesTeacherPortalConfig | null;
  onRegisterActions?: (actions: MessagesInboxActions) => void;
}) {
  const searchParams = useSearchParams();
  const [threads, setThreads] = useState<MessageThreadSummary[]>(initialInbox?.threads ?? []);
  const [contacts, setContacts] = useState<MessageContact[]>(initialInbox?.contacts ?? []);
  const [viewerContext, setViewerContext] = useState(initialInbox?.viewerContext);
  const [prevInitialInbox, setPrevInitialInbox] = useState(initialInbox);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<MessageThreadDetail | null>(null);
  const [input, setInput] = useState("");
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(() =>
    initialInboxLoadingState(initialInbox),
  );
  const [isRefetchingInbox, setIsRefetchingInbox] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [pushPromptDismissed, setPushPromptDismissed] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<AdminEnrolledStudentSummary | null>(
    null,
  );
  const [inboxSearch, setInboxSearch] = useState("");
  const handledThreadParam = useRef<string | null>(null);
  const pendingOptimisticIds = useRef<Set<string>>(new Set());
  const hasLoadedThreadsRef = useRef((initialInbox?.threads.length ?? 0) > 0);

  if (initialInbox !== prevInitialInbox) {
    setPrevInitialInbox(initialInbox);
    if (initialInbox && !initialInbox.threadsDeferred) {
      setThreads(initialInbox.threads);
      if (initialInbox.contacts.length > 0) {
        setContacts(initialInbox.contacts);
      }
      if (initialInbox.viewerContext) {
        setViewerContext(initialInbox.viewerContext);
      }
      setLoadingInbox(false);
    }
  }

  const query = useMemo(() => {
    const params = new URLSearchParams({
      organizationId: api.organizationId,
      schoolName: api.schoolName,
    });
    if (api.programId) {
      params.set("programId", api.programId);
    }
    return params.toString();
  }, [api.organizationId, api.programId, api.schoolName]);

  const loadInbox = useCallback(async (options?: { silent?: boolean }) => {
    if (hasLoadedThreadsRef.current) {
      if (!options?.silent) {
        setIsRefetchingInbox(true);
      }
    } else {
      setLoadingInbox(true);
    }

    try {
      const data = await fetchJson<MessagesInboxData>(
        `${api.basePath}/threads?${query}`,
      );
      setThreads(data.threads);
      if (!deferContactsLoad) {
        setContacts(data.contacts);
      }
      setViewerContext(data.viewerContext);
      hasLoadedThreadsRef.current = data.threads.length > 0;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages.");
    } finally {
      setLoadingInbox(false);
      setIsRefetchingInbox(false);
    }
  }, [api.basePath, deferContactsLoad, query]);

  const loadContacts = useCallback(async () => {
    if (!deferContactsLoad || contacts.length > 0 || loadingContacts) return;

    setLoadingContacts(true);
    try {
      const data = await fetchJson<{ contacts: MessageContact[] }>(
        `${api.basePath}/contacts?${query}`,
      );
      setContacts(data.contacts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contacts.");
    } finally {
      setLoadingContacts(false);
    }
  }, [api.basePath, contacts.length, deferContactsLoad, loadingContacts, query]);

  const handleOpenNewConversation = useCallback(async () => {
    if (deferContactsLoad) {
      await loadContacts();
    }
    setNewConversationOpen(true);
  }, [deferContactsLoad, loadContacts]);

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
        setThreads((prev) =>
          upsertThreadSummary(prev, threadSummaryFromDetail(data.thread)),
        );
        setError(null);
        void loadInbox({ silent: true });
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
          guardianId: api.guardianId,
          staffMemberId:
            teacherPortal?.staffMemberId ?? viewerContext?.staffMemberId ?? null,
        });
        if (key !== contact.key) return false;
        if (!api.programId) {
          return !thread.programId;
        }
        if (contact.kind === "school_office") {
          return !thread.programId;
        }
        return thread.programId === api.programId;
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
            programId: api.programId ?? null,
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
      api.guardianId,
      api.organizationId,
      api.programId,
      api.viewer,
      loadThread,
      readOnly,
      selectThread,
      teacherPortal?.staffMemberId,
      threads,
      viewerContext?.staffMemberId,
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
    hasLoadedThreadsRef.current = threads.length > 0;
  }, [threads]);

  useEffect(() => {
    if (initialInbox?.threadsDeferred) return;
    queueMicrotask(() => {
      void loadInbox();
    });
  }, [initialInbox?.threadsDeferred, loadInbox]);

  useEffect(() => {
    const threadParam = searchParams.get("thread");
    if (!threadParam || loadingInbox) return;
    if (handledThreadParam.current === threadParam) return;
    handledThreadParam.current = threadParam;
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
          guardianId: api.guardianId,
          staffMemberId:
            teacherPortal?.staffMemberId ?? viewerContext?.staffMemberId ?? null,
        }),
      )
      .filter(Boolean),
  );

  const embedded = variant === "embedded";
  const storyVariant = isStoryMessagesVariant(variant);
  const adminStory = isAdminStoryMessagesVariant(variant);
  const splitPane = isSplitPaneMessagesVariant(variant);

  const threadsForList = useMemo(() => {
    let base = threads;
    if (
      activeThread &&
      !activeThread.id.startsWith("pending-") &&
      !base.some((thread) => thread.id === activeThread.id)
    ) {
      base = [threadSummaryFromDetail(activeThread), ...base];
    }

    const query = inboxSearch.trim().toLowerCase();
    if (!storyVariant || !query) return base;
    return base.filter(
      (thread) =>
        thread.title.toLowerCase().includes(query) ||
        thread.subtitle?.toLowerCase().includes(query) ||
        thread.lastMessagePreview?.toLowerCase().includes(query),
    );
  }, [activeThread, inboxSearch, storyVariant, threads]);

  useEffect(() => {
    onRegisterActions?.({
      openNewConversation: () => {
        void handleOpenNewConversation();
      },
      canStartNewConversation: deferContactsLoad || contacts.length > 0,
    });
  }, [contacts.length, deferContactsLoad, handleOpenNewConversation, onRegisterActions]);

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
    if (adminStory && api.viewer === "admin") {
      return buildAdminSectionedListItems(threadsForList);
    }

    if (splitPane) {
      return threadsForList.map((thread) => ({ type: "thread" as const, thread }));
    }

    return [
      ...threadsForList.map((thread) => ({ type: "thread" as const, thread })),
      ...contacts
        .filter((contact) => !contactKeysWithThreads.has(contact.key))
        .map((contact) => ({ type: "contact" as const, contact })),
    ];
  }, [adminStory, api.viewer, contactKeysWithThreads, contacts, splitPane, threadsForList]);

  const activeKey = activeThreadId;
  const reducedMotion = useReducedMotion() ?? false;

  if (loadingInbox) {
    if (splitPane) {
      return (
        <div
          className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
          style={{
            backgroundColor: storyVariant ? theme?.white ?? C.bg : C.bg,
          }}
        >
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <div
              className={`flex w-full flex-shrink-0 flex-col border-r ${
                storyVariant ? "md:w-[340px]" : "md:w-80 lg:w-96"
              }`}
              style={{
                borderColor: storyVariant ? theme?.line ?? C.border : C.border,
                backgroundColor: storyVariant ? theme?.white ?? C.bg : C.bg,
              }}
            >
              {storyVariant ? (
                <div className="border-b px-4 py-4" style={{ borderColor: theme?.line ?? C.border }}>
                  <div
                    className="mb-3 h-3 w-28 animate-pulse rounded"
                    style={{ backgroundColor: theme?.line ?? C.border }}
                  />
                  <div
                    className="mb-2 h-6 w-32 animate-pulse rounded"
                    style={{ backgroundColor: theme?.line ?? C.border }}
                  />
                  <div
                    className="h-4 w-full animate-pulse rounded"
                    style={{ backgroundColor: theme?.line ?? C.border }}
                  />
                </div>
              ) : (
                <div
                  className="flex items-center justify-between border-b px-4 py-3.5"
                  style={{ borderColor: C.border }}
                >
                  <SkeletonBlock C={C} className="h-5 w-24" />
                  <SkeletonBlock C={C} className="h-8 w-16 rounded-full" />
                </div>
              )}
              <MessagesConversationListSkeleton C={C} embedded={splitPane} />
            </div>
            <div
              className="hidden flex-1 md:block"
              style={{
                backgroundColor: storyVariant
                  ? "#EFF5F0"
                  : C.bg,
              }}
            />
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

  const emptyInboxDescription =
    api.viewer === "parent" && api.programId
      ? "No conversations yet. Message a co-op family from the home page, or start a new conversation with the school office."
      : api.viewer === "parent"
        ? "No conversations yet. Start a new conversation with the school office or your child's teachers."
        : "No conversations yet. Start a new conversation to reach families and colleagues.";

  if (
    !loadingInbox &&
    threads.length === 0 &&
    contacts.length === 0 &&
    !initialInbox?.threadsDeferred &&
    !deferContactsLoad
  ) {
    return (
      <MessagesEmptyState
        title="No messages yet"
        description={emptyInboxDescription}
        C={C}
        theme={theme}
        variant={variant}
      />
    );
  }

  return (
    <div
      className={`flex flex-col overflow-hidden ${
        splitPane
          ? "h-full min-h-0 flex-1"
          : "flex-1 min-h-[480px] h-[calc(100vh-220px)] max-h-[720px] border rounded-xl"
      }`}
      style={
        storyVariant && theme
          ? {
              backgroundColor: theme.white,
            }
          : {
              borderColor: splitPane ? undefined : C.border,
              backgroundColor: C.bg,
              border: splitPane ? undefined : `1px solid ${C.border}`,
            }
      }
    >
      {error && (
        <div
          className="border-b px-4 py-2 text-sm"
          style={
            storyVariant && theme
              ? {
                  color: theme.warning,
                  borderColor: theme.line,
                  backgroundColor: theme.warningBg,
                }
              : { color: "#b45309", borderColor: C.border, backgroundColor: "#fffbeb" }
          }
        >
          {error}
        </div>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div
          className={`border-r flex flex-col flex-shrink-0 ${
            mobileView === "chat" ? "hidden md:flex" : "flex"
          } w-full ${
            storyVariant ? "md:w-[340px]" : splitPane ? "md:w-80 lg:w-96" : "md:w-72"
          }`}
          style={{
            borderColor: theme?.line ?? C.border,
            backgroundColor: storyVariant ? theme?.white ?? C.bg : C.bg,
          }}
        >
          {variant === "parent-story" && theme ? (
            <ParentMessagesInboxHeader
              theme={theme}
              searchQuery={inboxSearch}
              onSearchChange={setInboxSearch}
              onNewMessage={() => {
                void handleOpenNewConversation();
              }}
              newMessageDisabled={deferContactsLoad ? loadingContacts : contacts.length === 0}
              readOnly={readOnly}
            />
          ) : adminStory && theme ? (
            <AdminMessagesInboxHeader
              theme={theme}
              searchQuery={inboxSearch}
              onSearchChange={setInboxSearch}
              onNewMessage={() => {
                void handleOpenNewConversation();
              }}
              newMessageDisabled={deferContactsLoad ? loadingContacts : contacts.length === 0}
            />
          ) : splitPane ? (
            <div
              className="flex items-center justify-between border-b px-4 py-3.5"
              style={{ borderColor: C.border }}
            >
              <p className="text-base font-semibold" style={{ color: C.textPrimary }}>
                Messages
              </p>
              <motion.button
                type="button"
                onClick={() => {
                  void handleOpenNewConversation();
                }}
                disabled={deferContactsLoad ? loadingContacts : contacts.length === 0}
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
          <div className="relative flex min-h-0 flex-1 flex-col">
            {isRefetchingInbox ? (
              <div
                className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-white/60 pt-6"
                aria-hidden="true"
              >
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: C.textSecondary }} />
              </div>
            ) : null}
            <MessagesConversationList
              items={listItems}
              activeKey={activeKey}
              onSelect={handleSelect}
              C={C}
              theme={theme}
              showContactsHeader={!splitPane}
              variant={variant}
              hideStudentSubtitle={api.viewer === "teacher" && (embedded || storyVariant)}
            />
          </div>
        </div>

        <motion.div
          className={`flex w-full flex-col flex-1 min-w-0 min-h-0 ${
            mobileView === "list" ? "hidden md:flex" : "flex"
          }`}
          key={storyVariant ? (activeThreadId ?? "empty") : undefined}
          {...(storyVariant
            ? {
                initial: parentMessagesViewTransition.initial,
                animate: parentMessagesViewTransition.animate,
                transition: parentMessagesViewTransition.transition,
              }
            : {})}
        >
          {!splitPane ? (
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
            theme={theme}
            variant={variant}
            schoolName={api.schoolName}
            onBack={splitPane ? () => setMobileView("list") : undefined}
            loadingMessages={loadingMessages}
            onStudentClick={
              api.viewer === "teacher" && teacherStaffMemberId
                ? handleStudentClick
                : undefined
            }
          />
        </motion.div>
      </div>

      {splitPane ? (
        <MessagesNewConversationModal
          open={newConversationOpen}
          contacts={contacts}
          loadingContacts={loadingContacts}
          onClose={() => setNewConversationOpen(false)}
          onSelect={handleNewConversationSelect}
          C={C}
          theme={theme}
          variant={variant}
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
