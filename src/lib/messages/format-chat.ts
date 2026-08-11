import type { PortalMessage } from "@/lib/messages/types";

export type MessageDayGroup = {
  dayKey: string;
  dayLabel: string;
  messages: PortalMessage[];
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function formatChatDayLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const today = startOfDay(now);
  const messageDay = startOfDay(date);
  const diffMs = today.getTime() - messageDay.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function groupMessagesByDay(messages: PortalMessage[]): MessageDayGroup[] {
  const groups: MessageDayGroup[] = [];

  for (const message of messages) {
    const date = new Date(message.createdAt);
    const key = Number.isNaN(date.getTime()) ? "unknown" : dayKey(date);
    const last = groups[groups.length - 1];

    if (last && last.dayKey === key) {
      last.messages.push(message);
      continue;
    }

    groups.push({
      dayKey: key,
      dayLabel: formatChatDayLabel(message.createdAt),
      messages: [message],
    });
  }

  return groups;
}

export type RenderMessageItem =
  | { type: "day"; dayLabel: string; dayKey: string }
  | {
      type: "message";
      message: PortalMessage;
      showSenderName: boolean;
      isGroupedWithPrevious: boolean;
    };

export function buildMessageRenderItems(messages: PortalMessage[]): RenderMessageItem[] {
  const items: RenderMessageItem[] = [];
  const dayGroups = groupMessagesByDay(messages);

  for (const group of dayGroups) {
    items.push({ type: "day", dayLabel: group.dayLabel, dayKey: group.dayKey });

    for (let index = 0; index < group.messages.length; index += 1) {
      const message = group.messages[index];
      const previous = index > 0 ? group.messages[index - 1] : null;
      const sameSenderAsPrevious =
        previous != null &&
        previous.senderUserId === message.senderUserId &&
        previous.isOwn === message.isOwn;

      items.push({
        type: "message",
        message,
        showSenderName: !message.isOwn && !sameSenderAsPrevious,
        isGroupedWithPrevious: sameSenderAsPrevious,
      });
    }
  }

  return items;
}
