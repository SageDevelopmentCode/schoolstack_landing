import type { MessageThreadSummary } from '@/lib/messages/types';

export type AdminThreadSection = 'family_staff' | 'family_office';

export type AdminConversationListItem =
  | { type: 'section'; key: string; label: string }
  | { type: 'thread'; thread: MessageThreadSummary };

const SECTION_LABELS: Record<'family_staff' | 'other', string> = {
  family_staff: 'Family & teachers',
  other: 'Other',
};

function sortThreadsByRecency(threads: MessageThreadSummary[]): MessageThreadSummary[] {
  return [...threads].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return bTime - aTime;
  });
}

export function getAdminThreadSection(thread: MessageThreadSummary): AdminThreadSection | null {
  const hasFamily = thread.participants.some((participant) => participant.kind === 'family');
  const hasStaff = thread.participants.some((participant) => participant.kind === 'staff_member');
  const hasOffice = thread.participants.some((participant) => participant.kind === 'school_office');

  if (hasFamily && hasStaff && !hasOffice) {
    return 'family_staff';
  }

  if (hasFamily && hasOffice && !hasStaff) {
    return 'family_office';
  }

  return null;
}

export function buildAdminSectionedListItems(
  threads: MessageThreadSummary[],
): AdminConversationListItem[] {
  const familyStaffThreads = sortThreadsByRecency(
    threads.filter((thread) => getAdminThreadSection(thread) === 'family_staff'),
  );
  const familyOfficeThreads = sortThreadsByRecency(
    threads.filter((thread) => getAdminThreadSection(thread) === 'family_office'),
  );
  const otherThreads = sortThreadsByRecency(
    threads.filter((thread) => getAdminThreadSection(thread) === null),
  );

  const items: AdminConversationListItem[] = [];

  if (familyOfficeThreads.length > 0) {
    for (const thread of familyOfficeThreads) {
      items.push({ type: 'thread', thread });
    }
  }

  if (familyStaffThreads.length > 0) {
    items.push({
      type: 'section',
      key: 'section-family_staff',
      label: SECTION_LABELS.family_staff,
    });
    for (const thread of familyStaffThreads) {
      items.push({ type: 'thread', thread });
    }
  }

  if (otherThreads.length > 0) {
    items.push({
      type: 'section',
      key: 'section-other',
      label: SECTION_LABELS.other,
    });
    for (const thread of otherThreads) {
      items.push({ type: 'thread', thread });
    }
  }

  return items;
}
