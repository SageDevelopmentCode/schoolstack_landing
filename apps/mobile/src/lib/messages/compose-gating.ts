import type { MessageThreadDetail } from '@/lib/messages/types';

function isGuardianStaffThread(thread: MessageThreadDetail): boolean {
  const hasParent = thread.participants.some(
    (participant) => participant.kind === 'guardian' || participant.kind === 'family',
  );
  const hasStaff = thread.participants.some(
    (participant) => participant.kind === 'staff_member',
  );
  const hasOffice = thread.participants.some(
    (participant) => participant.kind === 'school_office',
  );
  return hasParent && hasStaff && !hasOffice;
}

export function resolveAdminComposeState(
  thread: MessageThreadDetail | null,
  readOnly: boolean,
  staffDisplayName?: string | null,
): { disabled: boolean; banner: { variant: 'info' | 'warning'; message: string } | null } {
  if (readOnly || !thread) {
    return { disabled: readOnly, banner: null };
  }

  if (!isGuardianStaffThread(thread)) {
    return { disabled: false, banner: null };
  }

  const displayName = staffDisplayName?.trim();
  if (displayName) {
    return {
      disabled: false,
      banner: {
        variant: 'info',
        message:
          'Parent & teacher conversation — for your review. Replies appear as ' +
          displayName +
          ', not the school office inbox.',
      },
    };
  }

  return {
    disabled: true,
    banner: {
      variant: 'warning',
      message:
        'Parent & teacher conversation — for your review. Link a staff profile to reply, or message families via your school office inbox.',
    },
  };
}
