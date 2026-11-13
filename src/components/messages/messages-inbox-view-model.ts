import type {
  MessageContact,
  MessageThreadDetail,
  MessageThreadSummary,
} from "@/lib/messages/types";

/**
 * Optional, opt-in feedback events emitted by `MessagesInboxLayout`.
 * The layout still sets its inline `error` exactly as before; a host (the
 * parent Garden page) can turn these into toasts. Teacher/admin pass nothing.
 */
export type MessagesFeedbackEvent =
  | { type: "conversation_started"; name: string }
  | { type: "send_failed"; message: string; restored: boolean }
  | { type: "edited" }
  | { type: "deleted" }
  | { type: "delete_failed"; message: string }
  | {
      type: "load_failed";
      scope: "contacts" | "thread" | "start_conversation";
      message: string;
    }
  | { type: "files_rejected"; tooLarge: string[]; overLimit: string[] };

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
  };
};
