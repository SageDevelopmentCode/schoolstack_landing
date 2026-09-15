import type {
  ClassroomSignup,
  ClassroomSignupResponse,
  ParentClassroomSignupListItem,
} from '@/lib/parent/parent-classroom-signups-types';

export function formatSignupDeadline(deadline: string | null): string | null {
  if (!deadline) return null;
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getSlotFillCount(
  slotId: string,
  responses: ClassroomSignupResponse[],
): number {
  return responses.filter(
    (r) => r.status === 'confirmed' && r.selectedSlotIds.includes(slotId),
  ).length;
}

export function getRoleFillCount(
  roleId: string,
  responses: ClassroomSignupResponse[],
): number {
  return responses.filter(
    (r) => r.status === 'confirmed' && r.selectedRoleIds.includes(roleId),
  ).length;
}

export function isSlotFull(
  slotId: string,
  capacity: number,
  responses: ClassroomSignupResponse[],
): boolean {
  return getSlotFillCount(slotId, responses) >= capacity;
}

export function isRoleFull(
  roleId: string,
  quantityNeeded: number,
  responses: ClassroomSignupResponse[],
): boolean {
  return getRoleFillCount(roleId, responses) >= quantityNeeded;
}

export function classifyParentClassroomSignupListItem(
  signup: ClassroomSignup,
  familyResponse: ClassroomSignupResponse | null,
): ParentClassroomSignupListItem | null {
  const hasConfirmed = familyResponse?.status === 'confirmed';

  if (signup.status === 'open') {
    return {
      signup,
      familyResponse: hasConfirmed ? familyResponse : null,
      listStatus: hasConfirmed ? 'signed_up' : 'needs_response',
    };
  }

  if (signup.status === 'closed' && hasConfirmed) {
    return {
      signup,
      familyResponse,
      listStatus: 'closed',
    };
  }

  return null;
}

export function getSignupActionLabel(listStatus: ParentClassroomSignupListItem['listStatus']): string {
  if (listStatus === 'needs_response') return 'Sign up';
  if (listStatus === 'signed_up') return 'View signup';
  return 'View details';
}
