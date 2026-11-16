import type { MessagesFeedbackEvent } from "@/components/messages/messages-inbox-view-model";
import {
  MAX_MESSAGE_ATTACHMENTS,
  MAX_MESSAGE_ATTACHMENT_BYTES,
} from "@/lib/messages/message-attachment-storage";

/** "10 MB" from the real attachment limit (never hard-coded copy). */
export const MAX_ATTACHMENT_MB_LABEL = `${Math.round(
  MAX_MESSAGE_ATTACHMENT_BYTES / (1024 * 1024),
)} MB`;
export const MAX_ATTACHMENTS = MAX_MESSAGE_ATTACHMENTS;

export type ParentMessagesToast = {
  kind: "success" | "error";
  id: string;
  title: string;
  description?: string;
};

/**
 * Turns inbox feedback events into parent Garden toasts. Normal sends stay
 * quiet (the "Sent ✓" line in the conversation is the confirmation); toasts
 * are for things a parent must notice or that happen out of view.
 */
export function describeParentMessagesFeedback(
  event: MessagesFeedbackEvent,
): ParentMessagesToast {
  switch (event.type) {
    case "conversation_started":
      return {
        kind: "success",
        id: "messages-conversation-started",
        title: `Conversation with ${event.name} is ready`,
        description: "Write your first message below and press Enter to send.",
      };
    case "send_failed":
      return {
        kind: "error",
        id: "messages-send-failed",
        title: "Message not sent",
        description: event.restored
          ? `${event.message} Your message is back in the box — try again when you’re ready.`
          : event.message,
      };
    case "edited":
      return { kind: "success", id: "messages-edited", title: "Message updated" };
    case "deleted":
      return { kind: "success", id: "messages-deleted", title: "Message deleted" };
    case "delete_failed":
      return {
        kind: "error",
        id: "messages-delete-failed",
        title: "Couldn’t delete that message",
        description: event.message,
      };
    case "load_failed": {
      const title =
        event.scope === "contacts"
          ? "Couldn’t load who you can message"
          : event.scope === "start_conversation"
            ? "Couldn’t start that conversation"
            : "Couldn’t open that conversation";
      return {
        kind: "error",
        id: `messages-load-failed-${event.scope}`,
        title,
        description: event.message,
      };
    }
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
        id: "messages-files-rejected",
        title:
          event.tooLarge.length > 0 && event.overLimit.length === 0
            ? "File too large"
            : "Some files weren’t attached",
        description: parts.join(" "),
      };
    }
  }
}

