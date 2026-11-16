import type { MessagesFeedbackEvent } from "@/components/messages/messages-inbox-view-model";
import { MAX_ATTACHMENT_MB_LABEL, MAX_ATTACHMENTS } from "@/lib/messages/parent-messages-feedback";

export type AdminMessagesToast = {
  kind: "success" | "error";
  /** Error toasts use their own ids so a later success never gets swallowed. */
  id: string;
  title: string;
  description?: string;
  /** Repeat the failed step (shown as "Retry"). */
  retry?: () => void;
};

/**
 * Inbox feedback events → admin Garden toasts. Follows the admin feedback
 * contract: the title says what happened, the description says what it means
 * now (or what did *not* change). Plain sends stay quiet; the "Sent ✓" line in
 * the conversation is the confirmation. A conversation that fails to open
 * returns null: the inline notice with "Try again" already covers it, and load
 * failures are never toasted.
 */
export function describeAdminMessagesFeedback(
  event: MessagesFeedbackEvent,
): AdminMessagesToast | null {
  switch (event.type) {
    case "conversation_started":
      return {
        kind: "success",
        id: "admin-messages-conversation-started",
        title: `Conversation with ${event.name} started.`,
        description: "Write your first message below — you're replying as the school office.",
      };
    case "send_failed":
      return {
        kind: "error",
        id: "admin-messages-send-error",
        title: "Message not sent.",
        description: event.restored
          ? `${event.message} Your message is still in the box, so nothing was lost.`
          : `${event.message} Nothing was sent.`,
        retry: event.retry,
      };
    case "edited":
      return {
        kind: "success",
        id: "admin-messages-edited",
        title: "Message updated.",
        description: "Everyone in the conversation sees the new text.",
      };
    case "deleted":
      return {
        kind: "success",
        id: "admin-messages-deleted",
        title: "Message deleted.",
        description: "It's removed for everyone in the conversation.",
      };
    case "delete_failed":
      return {
        kind: "error",
        id: "admin-messages-delete-error",
        title: "Couldn't delete that message.",
        description: `${event.message} The message is still visible to everyone.`,
        retry: event.retry,
      };
    case "load_failed":
      if (event.scope === "thread") return null;
      return event.scope === "contacts"
        ? {
            kind: "error",
            id: "admin-messages-contacts-error",
            title: "Couldn't load parents and staff.",
            description: `${event.message} You can't pick someone to message until this loads.`,
            retry: event.retry,
          }
        : {
            kind: "error",
            id: "admin-messages-start-error",
            title: "Couldn't start that conversation.",
            description: `${event.message} No conversation was created.`,
            retry: event.retry,
          };
    case "files_rejected": {
      const parts: string[] = [];
      if (event.tooLarge.length === 1) {
        parts.push(`“${event.tooLarge[0]}” is over ${MAX_ATTACHMENT_MB_LABEL}.`);
      } else if (event.tooLarge.length > 1) {
        parts.push(`${event.tooLarge.length} files are over ${MAX_ATTACHMENT_MB_LABEL}.`);
      }
      if (event.overLimit.length > 0) {
        parts.push(
          `${event.overLimit.length === 1 ? "1 file wasn’t" : `${event.overLimit.length} files weren’t`} added — you can attach up to ${MAX_ATTACHMENTS} files per message.`,
        );
      }
      return {
        kind: "error",
        id: "admin-messages-files-error",
        title:
          event.tooLarge.length > 0 && event.overLimit.length === 0
            ? "File too large."
            : "Some files weren’t attached.",
        description: parts.join(" "),
      };
    }
  }
}

/** Success ids → the error id they clear (a fixed step dismisses its error toast). */
export const ADMIN_MESSAGES_ERROR_FOR_SUCCESS: Record<string, string> = {
  "admin-messages-conversation-started": "admin-messages-start-error",
  "admin-messages-deleted": "admin-messages-delete-error",
};
