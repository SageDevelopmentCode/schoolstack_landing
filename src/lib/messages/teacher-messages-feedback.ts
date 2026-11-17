import type { MessagesFeedbackEvent } from "@/components/messages/messages-inbox-view-model";
import {
  ADMIN_MESSAGES_ERROR_FOR_SUCCESS,
  describeAdminMessagesFeedback,
  type AdminMessagesToast,
} from "@/lib/messages/admin-messages-feedback";

export type TeacherMessagesToast = AdminMessagesToast;

function teacherId(adminId: string): string {
  return adminId.replace(/^admin-messages-/, "teacher-messages-");
}

/**
 * Inbox feedback events → staff Garden toasts. Same contract as admin (title
 * says what happened, description what it means now, Retry on errors, plain
 * sends stay quiet, a conversation that fails to open is shown inline only),
 * with staff wording: teachers write as themselves, not the school office.
 */
export function describeTeacherMessagesFeedback(
  event: MessagesFeedbackEvent,
): TeacherMessagesToast | null {
  if (event.type === "conversation_started") {
    return {
      kind: "success",
      id: "teacher-messages-conversation-started",
      title: `Conversation with ${event.name} started.`,
      description: "Write your first message below and press Enter to send.",
    };
  }
  if (event.type === "load_failed" && event.scope === "contacts") {
    return {
      kind: "error",
      id: "teacher-messages-contacts-error",
      title: "Couldn't load families and colleagues.",
      description: `${event.message} You can't pick someone to message until this loads.`,
      retry: event.retry,
    };
  }
  const toast = describeAdminMessagesFeedback(event);
  return toast ? { ...toast, id: teacherId(toast.id) } : null;
}

/** Success ids → the error id they clear (a fixed step dismisses its error toast). */
export const TEACHER_MESSAGES_ERROR_FOR_SUCCESS: Record<string, string> = Object.fromEntries(
  Object.entries(ADMIN_MESSAGES_ERROR_FOR_SUCCESS).map(([success, error]) => [teacherId(success), teacherId(error)]),
);
