import type { MessageThreadSummary } from './types';

export type AdminThreadSection = 'guardian_staff' | 'guardian_office';

export type AdminConversationListItem =
  | { type: 'section'; key: string; label: string; description?: string }
  | { type: 'thread'; thread: MessageThreadSummary };

const SECTION_LABELS: Record<'guardian_staff' | 'other', string> = {
  guardian_staff: 'Parent & teacher conversations',
  other: 'Other',
};

const SECTION_DESCRIPTIONS: Partial<Record<'guardian_staff' | 'other', string>> = {
  guardian_staff:
    'For your review — messages between families and staff, not your school office inbox.',
};

function hasParentSideParticipant(
  participants: MessageThreadSummary['participants'],
): boolean {
  return participants.some(
    (participant) => participant.kind === 'guardian' || participant.kind === 'family',
  );
}

function sortThreadsByRecency(threads: MessageThreadSummary[]): MessageThreadSummary[] {
  return [...threads].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return bTime - aTime;
  });
}

export function getAdminThreadSection(
  thread: MessageThreadSummary,
): AdminThreadSection | null {
  const hasParent = hasParentSideParticipant(thread.participants);
  const hasStaff = thread.participants.some(
    (participant) => participant.kind === 'staff_member',
  );
  const hasOffice = thread.participants.some(
    (participant) => participant.kind === 'school_office',
  );

  if (hasParent && hasStaff && !hasOffice) {
    return 'guardian_staff';
  }

  if (hasParent && hasOffice && !hasStaff) {
    return 'guardian_office';
  }

  return null;
}

export function buildAdminSectionedListItems(
  threads: MessageThreadSummary[],
): AdminConversationListItem[] {
  const guardianStaffThreads = sortThreadsByRecency(
    threads.filter((thread) => getAdminThreadSection(thread) === 'guardian_staff'),
  );
  const guardianOfficeThreads = sortThreadsByRecency(
    threads.filter((thread) => getAdminThreadSection(thread) === 'guardian_office'),
  );
  const otherThreads = sortThreadsByRecency(
    threads.filter((thread) => getAdminThreadSection(thread) === null),
  );

  const items: AdminConversationListItem[] = [];

  if (guardianOfficeThreads.length > 0) {
    for (const thread of guardianOfficeThreads) {
      items.push({ type: 'thread', thread });
    }
  }

  if (guardianStaffThreads.length > 0) {
    items.push({
      type: 'section',
      key: 'section-guardian_staff',
      label: SECTION_LABELS.guardian_staff,
      description: SECTION_DESCRIPTIONS.guardian_staff,
    });
    for (const thread of guardianStaffThreads) {
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
