import type { MessageThreadDetail } from '@/lib/messages/types';

export type MessagesComposeBanner =
  | { variant: 'info'; staffDisplayName: string }
  | { variant: 'warning'; message: string };

function isFamilyStaffThread(thread: MessageThreadDetail): boolean {
  const hasFamily = thread.participants.some((participant) => participant.kind === 'family');
  const hasStaff = thread.participants.some((participant) => participant.kind === 'staff_member');
  const hasOffice = thread.participants.some((participant) => participant.kind === 'school_office');
  return hasFamily && hasStaff && !hasOffice;
}

export function resolveAdminComposeState(
  thread: MessageThreadDetail | null,
  staffDisplayName?: string | null,
): { disabled: boolean; banner: MessagesComposeBanner | null } {
  if (!thread) {
    return { disabled: true, banner: null };
  }

  if (!isFamilyStaffThread(thread)) {
    return { disabled: false, banner: null };
  }

  const displayName = staffDisplayName?.trim();
  if (displayName) {
    return {
      disabled: false,
      banner: { variant: 'info', staffDisplayName: displayName },
    };
  }

  return {
    disabled: true,
    banner: {
      variant: 'warning',
      message:
        'Link a staff profile to reply on teacher threads, or message via the school office inbox.',
    },
  };
}
