import type { MessageThreadParticipant } from '@/lib/messages/types';

export function contactKeyForThread(
  threadParticipants: Pick<
    MessageThreadParticipant,
    'kind' | 'familyId' | 'guardianId' | 'staffMemberId'
  >[],
  viewer: 'parent' | 'teacher' | 'admin',
  context: { guardianId?: string | null; staffMemberId?: string | null },
): string | null {
  const hasPlatformSupport = threadParticipants.some((p) => p.kind === 'platform_support');
  const guardianParticipant = threadParticipants.find((p) => p.kind === 'guardian');

  if (hasPlatformSupport) {
    if (viewer === 'parent' || viewer === 'teacher') return 'platform_support';
    if (guardianParticipant?.guardianId) {
      return `platform_support:guardian:${guardianParticipant.guardianId}`;
    }
    const staffParticipant = threadParticipants.find((p) => p.kind === 'staff_member');
    if (staffParticipant?.staffMemberId) {
      return `platform_support:staff:${staffParticipant.staffMemberId}`;
    }
    return 'platform_support';
  }

  const hasOffice = threadParticipants.some((p) => p.kind === 'school_office');
  const legacyFamilyParticipant = threadParticipants.find((p) => p.kind === 'family');
  const staffParticipants = threadParticipants.filter((p) => p.kind === 'staff_member');
  const guardianParticipants = threadParticipants.filter((p) => p.kind === 'guardian');

  if (
    guardianParticipants.length === 2 &&
    !hasOffice &&
    staffParticipants.length === 0 &&
    !legacyFamilyParticipant
  ) {
    const other = guardianParticipants.find(
      (participant) =>
        participant.guardianId && participant.guardianId !== context.guardianId,
    );
    return other?.guardianId ? `guardian:${other.guardianId}` : null;
  }

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
