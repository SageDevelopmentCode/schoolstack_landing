import type { MessageThreadParticipant } from '@/lib/messages/types';

export function contactKeyForThread(
  threadParticipants: Pick<
    MessageThreadParticipant,
    'kind' | 'familyId' | 'guardianId' | 'staffMemberId'
  >[],
  viewer: 'parent' | 'teacher' | 'admin',
  context: { guardianId?: string | null; staffMemberId?: string | null },
): string | null {
  const hasOffice = threadParticipants.some((p) => p.kind === 'school_office');
  const guardianParticipant = threadParticipants.find((p) => p.kind === 'guardian');
  const legacyFamilyParticipant = threadParticipants.find((p) => p.kind === 'family');
  const staffParticipants = threadParticipants.filter((p) => p.kind === 'staff_member');

  if (hasOffice && guardianParticipant?.guardianId) {
    if (viewer === 'parent') return 'school_office';
    return `guardian:${guardianParticipant.guardianId}`;
  }

  if (hasOffice && legacyFamilyParticipant?.familyId) {
    if (viewer === 'parent') return 'school_office';
    return `family:${legacyFamilyParticipant.familyId}`;
  }

  if (hasOffice && staffParticipants[0]?.staffMemberId) {
    if (viewer === 'teacher') return 'school_office';
    return `staff:${staffParticipants[0].staffMemberId}`;
  }

  if (hasOffice) return 'school_office';

  if (
    staffParticipants.length === 2 &&
    !guardianParticipant &&
    !legacyFamilyParticipant
  ) {
    const other = staffParticipants.find(
      (p) => p.staffMemberId && p.staffMemberId !== context.staffMemberId,
    );
    return other?.staffMemberId ? `staff:${other.staffMemberId}` : null;
  }

  if (viewer === 'parent' && staffParticipants[0]?.staffMemberId) {
    return `staff:${staffParticipants[0].staffMemberId}`;
  }

  if (guardianParticipant?.guardianId) {
    if (
      viewer === 'admin' &&
      !hasOffice &&
      staffParticipants.length === 1 &&
      staffParticipants[0]?.staffMemberId
    ) {
      return `guardian:${guardianParticipant.guardianId}:staff:${staffParticipants[0].staffMemberId}`;
    }
    return `guardian:${guardianParticipant.guardianId}`;
  }

  if (legacyFamilyParticipant?.familyId) {
    return `family:${legacyFamilyParticipant.familyId}`;
  }

  return null;
}
