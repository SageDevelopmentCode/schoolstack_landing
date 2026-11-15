import {
  TASK_STATUS_LABELS,
  type CommitteeEvent,
  type CommitteeEventType,
  type CommitteeJoinRequestStatus,
  type CommitteeTask,
  type CommitteeTaskStatus,
  type ParentCommitteeBrowseItem,
  type ParentCommitteesTab,
} from '@/lib/parent/parent-committees-types';

/*
 * Pure view helpers for the Garden committees screens (parent + teacher).
 * Copy comes from the Story screens; nothing is invented.
 */

type ChipTone = 'success' | 'warning' | 'alert' | 'info' | 'neutral';

export function committeesTitle(tab: ParentCommitteesTab): string {
  return tab === 'explore' ? 'Explore committees' : 'Your committees';
}

export function committeesSubtitle(
  tab: ParentCommitteesTab,
  exploreCount: number,
  myCount: number,
): string {
  if (tab === 'explore') {
    if (exploreCount === 0) return 'No volunteer committees are open right now.';
    return `${exploreCount === 1 ? '1 committee' : `${exploreCount} committees`} open for volunteers`;
  }
  if (myCount === 0) return 'Approved committee workspaces will appear here.';
  return myCount === 1 ? '1 active workspace' : `${myCount} active workspaces`;
}

export function unreadLabel(count: number): string {
  return count === 1 ? '1 unread update' : `${count} unread updates`;
}

export function formatUnreadBadge(count: number): string {
  return count > 99 ? '99+' : String(count);
}

export const REQUEST_STATUS_CHIP: Record<CommitteeJoinRequestStatus, { label: string; tone: ChipTone }> = {
  pending: { label: 'Request pending', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  declined: { label: 'Declined', tone: 'alert' },
  withdrawn: { label: 'Withdrawn', tone: 'info' },
};

export function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

/* ------------------------------------------------------------------ */
/* Joining                                                             */
/* ------------------------------------------------------------------ */

export type JoinStep = { id: 'request' | 'review' | 'join'; title: string; meta: string; state: 'done' | 'current' | 'todo' };

/** "How joining works", with the current step derived from the request status. */
export function buildJoinSteps(
  committee: Pick<ParentCommitteeBrowseItem, 'requestStatus' | 'isMember'>,
): JoinStep[] {
  const status = committee.requestStatus;
  const sent = status === 'pending' || status === 'approved' || committee.isMember;
  const reviewed = status === 'approved' || committee.isMember;
  return [
    {
      id: 'request',
      title: 'Send a request',
      meta: status === 'declined' ? 'Your last request was declined. You can send a new one.' : 'Pick a role if you have a preference.',
      state: sent ? 'done' : 'current',
    },
    {
      id: 'review',
      title: 'School reviews it',
      meta: status === 'pending' ? 'Your request is waiting for school review.' : 'Your request will be reviewed by the school.',
      state: reviewed ? 'done' : sent ? 'current' : 'todo',
    },
    {
      id: 'join',
      title: 'Join the workspace',
      meta: 'You get access to the committee workspace after approval.',
      state: committee.isMember ? 'done' : reviewed ? 'current' : 'todo',
    },
  ];
}

/** The request form shows when not a member and there is no live request. */
export function canRequestToJoin(
  committee: Pick<ParentCommitteeBrowseItem, 'requestStatus' | 'isMember'>,
): boolean {
  return !committee.isMember && (!committee.requestStatus || committee.requestStatus === 'declined');
}

/* ------------------------------------------------------------------ */
/* Tasks                                                               */
/* ------------------------------------------------------------------ */

export const TASK_STATUSES: CommitteeTaskStatus[] = ['open', 'claimed', 'in_progress', 'done'];

export { TASK_STATUS_LABELS };

export const TASK_STATUS_TONE: Record<CommitteeTaskStatus, ChipTone> = {
  open: 'neutral',
  claimed: 'info',
  in_progress: 'warning',
  done: 'success',
};

export function countTasksByStatus(tasks: CommitteeTask[]): Record<CommitteeTaskStatus, number> {
  const counts: Record<CommitteeTaskStatus, number> = { open: 0, claimed: 0, in_progress: 0, done: 0 };
  for (const task of tasks) counts[task.status] += 1;
  return counts;
}

export function taskSavedToast(
  previous: CommitteeTask | null,
  next: { title: string; status: CommitteeTaskStatus },
): { title: string; description: string } {
  if (!previous) return { title: 'Task created', description: `"${next.title}" is on the board.` };
  if (next.status === 'done' && previous.status !== 'done') {
    return { title: 'Task marked done', description: `Nice work on "${next.title}".` };
  }
  if (next.status !== previous.status) {
    return { title: 'Task saved', description: `"${next.title}" moved to ${TASK_STATUS_LABELS[next.status]}.` };
  }
  return { title: 'Task saved', description: `"${next.title}" is up to date.` };
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

export const EVENT_TYPES: CommitteeEventType[] = ['meeting', 'deadline', 'service', 'event'];

export const EVENT_TYPE_LABELS: Record<CommitteeEventType, string> = {
  meeting: 'Meeting',
  deadline: 'Deadline',
  service: 'Service',
  event: 'Event',
};

/** Upcoming events (today or later), soonest first. */
export function upcomingEvents(events: CommitteeEvent[], todayKey: string): CommitteeEvent[] {
  return events
    .filter((event) => event.date >= todayKey)
    .sort((a, b) => (a.date === b.date ? (a.time ?? '').localeCompare(b.time ?? '') : a.date.localeCompare(b.date)));
}

export function todayDateKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
