import type { MessageThreadParticipant } from '@/lib/messages/types';

export function contactKeyForThread(
  threadParticipants: Pick<
    MessageThreadParticipant,
    'kind' | 'familyId' | 'staffMemberId'
  >[],
  viewer: 'parent' | 'teacher' | 'admin',
  context: { familyId?: string | null; staffMemberId?: string | null },
): string | null {
  const hasOffice = threadParticipants.some((p) => p.kind === 'school_office');
  const familyParticipant = threadParticipants.find((p) => p.kind === 'family');
  const staffParticipants = threadParticipants.filter((p) => p.kind === 'staff_member');

  if (hasOffice && familyParticipant?.familyId) {
    if (viewer === 'parent') return 'school_office';
    return `family:${familyParticipant.familyId}`;
  }

  if (hasOffice && staffParticipants[0]?.staffMemberId) {
    if (viewer === 'teacher') return 'school_office';
    return `staff:${staffParticipants[0].staffMemberId}`;
  }

  if (hasOffice) return 'school_office';

  if (staffParticipants.length === 2 && !familyParticipant) {
    const other = staffParticipants.find(
      (p) => p.staffMemberId && p.staffMemberId !== context.staffMemberId,
    );
    return other?.staffMemberId ? `staff:${other.staffMemberId}` : null;
  }

  if (viewer === 'parent' && staffParticipants[0]?.staffMemberId) {
    return `staff:${staffParticipants[0].staffMemberId}`;
  }

  if (familyParticipant?.familyId) {
    return `family:${familyParticipant.familyId}`;
  }

  return null;
}
