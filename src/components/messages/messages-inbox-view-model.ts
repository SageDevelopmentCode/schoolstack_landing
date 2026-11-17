import type { AdminConversationListItem } from "@/lib/messages/admin-thread-sections";
import type {
  MessageContact,
  MessageThreadDetail,
  MessageThreadSummary,
} from "@/lib/messages/types";

/**
 * Optional, opt-in feedback events emitted by `MessagesInboxLayout`.
 * The layout still sets its inline `error` exactly as before; a host (the
 * parent and admin Garden pages) can turn these into toasts. Teacher passes nothing.
 * `retry`, when present, repeats the failed step (admin toasts offer it as "Retry").
 */
export type MessagesFeedbackEvent =
  | { type: "conversation_started"; name: string }
  | { type: "send_failed"; message: string; restored: boolean; retry?: () => void }
  | { type: "edited" }
  | { type: "deleted" }
  | { type: "delete_failed"; message: string; retry?: () => void }
  | {
      type: "load_failed";
      scope: "contacts" | "thread" | "start_conversation";
      message: string;
      retry?: () => void;
    }
  | { type: "files_rejected"; tooLarge: string[]; overLimit: string[] };

/** Banner above the composer (admin reviewing a parent ↔ teacher thread). */
export type MessagesInboxComposeBanner = { variant: "info" | "warning"; message: string };

/**
 * Admin-only extras for the Garden inbox (variant="admin-garden"). Absent for
 * parents, so the parent view renders exactly as before.
 */
export type MessagesInboxAdminModel = {
  /** Section rows (office inbox first, then "Parent & teacher conversations"). */
  listItems: AdminConversationListItem[];
  composeBanner: MessagesInboxComposeBanner | null;
  /** Replying is blocked for this thread (banner says why). */
  composeDisabled: boolean;
  openBroadcast: () => void;
  broadcastDisabled: boolean;
};

export type MessagesFeedbackHandler = (event: MessagesFeedbackEvent) => void;

/**
 * Everything a presentation-only inbox view needs. `MessagesInboxLayout`
 * owns all state, fetching and handlers; a variant view (e.g. parent-garden)
 * only renders this model, so business logic is never forked.
 */
export type MessagesInboxViewModel = {
  viewer: "parent" | "teacher" | "admin";
  schoolName: string;
  readOnly: boolean;

  loadingInbox: boolean;
  isRefetchingInbox: boolean;
  error: string | null;

  /** Threads for the list, already search-filtered (and active thread injected). */
  threads: MessageThreadSummary[];
  /** Unfiltered listed threads (support pinned), for unread totals. */
  allThreads: MessageThreadSummary[];
  activeThread: MessageThreadDetail | null;
  activeThreadId: string | null;
  mobileView: "list" | "chat";
  loadingMessages: boolean;

  inboxSearch: string;

  contacts: MessageContact[];
  loadingContacts: boolean;
  contactKeysWithThreads: ReadonlySet<string | null>;
  newConversationOpen: boolean;
  newMessageDisabled: boolean;
  emptyInboxDescription: string;

  input: string;
  stagedFiles: File[];
  sending: boolean;

  deleteTargetId: string | null;
  deletingMessage: boolean;
  attachmentDiscardDialogOpen: boolean;
  attachmentRouteLeaveDialogOpen: boolean;

  admin?: MessagesInboxAdminModel;

  actions: {
    selectThread: (key: string) => void;
    setSearch: (value: string) => void;
    openNewConversation: () => void;
    closeNewConversation: () => void;
    selectNewConversationContact: (contact: MessageContact) => void;
    setInput: (value: string) => void;
    setStagedFiles: (files: File[]) => void;
    send: () => void;
    backToList: () => void;
    editMessage?: (messageId: string, body: string) => Promise<void>;
    requestDelete?: (messageId: string) => void;
    confirmDelete: () => void;
    cancelDelete: () => void;
    confirmDiscardAttachments: () => void;
    cancelDiscardAttachments: () => void;
    confirmRouteLeave: () => void;
    cancelRouteLeave: () => void;
    dismissError: () => void;
    retry: () => void;
    notify: MessagesFeedbackHandler;
    /** Staff only: open a student's profile from the thread's student names. */
    openStudent?: (studentId: string) => void;
  };
};
