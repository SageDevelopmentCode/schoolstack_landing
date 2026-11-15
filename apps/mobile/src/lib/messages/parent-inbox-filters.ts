import { contactKeyForThread } from '@/lib/messages/participants-from-contact';
import type {
  MessageContact,
  MessageContactKind,
  MessageThreadSummary,
} from '@/lib/messages/types';

export type ParentInboxTab = 'all' | 'unread';

export function countUnreadThreads(threads: MessageThreadSummary[]): number {
  return threads.filter((thread) => thread.unreadCount > 0).length;
}

/** All / Unread tab filter (web `GardenConversationList`). Keeps the incoming order. */
export function filterThreadsByTab(
  threads: MessageThreadSummary[],
  tab: ParentInboxTab,
): MessageThreadSummary[] {
  if (tab === 'all') return threads;
  return threads.filter((thread) => thread.unreadCount > 0);
}

const GROUP_ORDER: MessageContactKind[] = [
  'school_office',
  'staff_member',
  'guardian',
  'platform_support',
];

const GROUP_LABEL: Record<MessageContactKind, string> = {
  school_office: 'School office',
  staff_member: 'Teachers',
  guardian: 'Families',
  platform_support: 'MudKitchen',
};

export type ContactSection = {
  kind: MessageContactKind;
  title: string;
  data: MessageContact[];
};

/** Same match as the old parent picker: name + subtitle, case-insensitive. */
export function contactMatchesQuery(contact: MessageContact, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return [contact.name, contact.subtitle ?? ''].join(' ').toLowerCase().includes(normalized);
}

/** Contacts grouped by who they are (web `GardenNewConversationDialog`). Empty groups are dropped. */
export function groupContactsByKind(contacts: MessageContact[], query: string): ContactSection[] {
  const filtered = contacts.filter((contact) => contactMatchesQuery(contact, query));
  return GROUP_ORDER.map((kind) => ({
    kind,
    title: GROUP_LABEL[kind],
    data: filtered.filter((contact) => contact.kind === kind),
  })).filter((section) => section.data.length > 0);
}

/** Contact keys that already have a conversation ("Open conversation" vs "Start"). */
export function contactKeysWithThreads(
  threads: MessageThreadSummary[],
  guardianId: string | null,
): Set<string> {
  const keys = new Set<string>();
  for (const thread of threads) {
    const key = contactKeyForThread(thread.participants, 'parent', { guardianId });
    if (key) keys.add(key);
  }
  return keys;
}
