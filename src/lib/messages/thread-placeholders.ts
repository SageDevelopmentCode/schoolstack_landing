import type {
  MessageContact,
  MessageThreadDetail,
  MessageThreadSummary,
  PortalMessage,
} from "@/lib/messages/types";

export function threadDetailFromSummary(
  summary: MessageThreadSummary,
  existingMessages: PortalMessage[] = [],
): MessageThreadDetail {
  return {
    ...summary,
    messages: existingMessages,
  };
}

export function threadSummaryFromDetail(
  detail: MessageThreadDetail,
): MessageThreadSummary {
  const { messages: _messages, ...summary } = detail;
  return summary;
}

export function upsertThreadSummary(
  threads: MessageThreadSummary[],
  summary: MessageThreadSummary,
): MessageThreadSummary[] {
  const index = threads.findIndex((thread) => thread.id === summary.id);
  if (index === -1) {
    return [summary, ...threads];
  }
  const next = [...threads];
  next[index] = { ...next[index], ...summary };
  return next;
}

export function threadDetailFromContact(
  contact: MessageContact,
  threadId?: string,
): MessageThreadDetail {
  return {
    id: threadId ?? `pending-${contact.key}`,
    subject: null,
    title: contact.name,
    subtitle: contact.subtitle,
    subtitleStudents: contact.subtitleStudents,
    subtitleStudentSummaries: contact.subtitleStudentSummaries,
    color: contact.color,
    lastMessagePreview: null,
    lastMessageAt: null,
    lastMessageTimeLabel: null,
    unreadCount: 0,
    participants: [],
    messages: [],
  };
}
