import type { MessageContact, MessageThreadSummary } from '@/lib/messages/types';

export const MUDKITCHEN_SUPPORT_TEAM_NAME = 'MudKitchen Support';
export const MUDKITCHEN_SUPPORT_LEGACY_TEAM_NAME = 'MudKitchen Support Team';

function isMudKitchenSupportThreadTitle(title: string): boolean {
  return (
    title === MUDKITCHEN_SUPPORT_TEAM_NAME || title === MUDKITCHEN_SUPPORT_LEGACY_TEAM_NAME
  );
}
export const MUDKITCHEN_SUPPORT_LOGO_URL = '/images/Logo.png';
export const MUDKITCHEN_SUPPORT_PLACEHOLDER_ID = 'pending-platform_support';
export const MUDKITCHEN_SUPPORT_CONTACT_KEY = 'platform_support';
export const MUDKITCHEN_SUPPORT_COLOR = '#C46A45';
export const MUDKITCHEN_SUPPORT_EMPTY_COPY =
  'Message the MudKitchen team for help with the product.';
export const MUDKITCHEN_SUPPORT_LIST_PREVIEW = 'Message the MudKitchen team';
export const MUDKITCHEN_SUPPORT_TERRACOTTA = '#C46A45';

export type MudKitchenSupportPinScope =
  | { mode: 'parent'; guardianId: string }
  | { mode: 'teacher'; staffMemberId: string };

export function threadHasPlatformSupport(
  participants: ReadonlyArray<{ kind: string }>,
): boolean {
  return participants.some((participant) => participant.kind === 'platform_support');
}

export function threadIsParentPlatformSupport(
  participants: ReadonlyArray<{
    kind: string;
    guardianId?: string | null;
  }>,
): boolean {
  return (
    threadHasPlatformSupport(participants) &&
    participants.some((participant) => participant.kind === 'guardian')
  );
}

export function threadIsStaffPlatformSupport(
  participants: ReadonlyArray<{
    kind: string;
    staffMemberId?: string | null;
  }>,
  staffMemberId: string,
): boolean {
  return (
    threadHasPlatformSupport(participants) &&
    participants.some(
      (participant) =>
        participant.kind === 'staff_member' && participant.staffMemberId === staffMemberId,
    )
  );
}

export function isMudKitchenSupportPlaceholder(threadId: string | null | undefined): boolean {
  return threadId === MUDKITCHEN_SUPPORT_PLACEHOLDER_ID;
}

export function isMudKitchenSupportListThread(
  thread: Pick<MessageThreadSummary, 'id' | 'title' | 'participants'>,
): boolean {
  return (
    isMudKitchenSupportPlaceholder(thread.id) ||
    threadHasPlatformSupport(thread.participants) ||
    isMudKitchenSupportThreadTitle(thread.title)
  );
}

export function mudKitchenSupportPlaceholderThread(): MessageThreadSummary {
  return {
    id: MUDKITCHEN_SUPPORT_PLACEHOLDER_ID,
    subject: null,
    title: MUDKITCHEN_SUPPORT_TEAM_NAME,
    photoUrl: MUDKITCHEN_SUPPORT_LOGO_URL,
    color: '#F8F4EA',
    lastMessagePreview: MUDKITCHEN_SUPPORT_LIST_PREVIEW,
    lastMessageAt: null,
    lastMessageTimeLabel: null,
    unreadCount: 0,
    participants: [],
  };
}

export function mudKitchenSupportContact(): MessageContact {
  return {
    key: MUDKITCHEN_SUPPORT_CONTACT_KEY,
    kind: 'platform_support',
    name: MUDKITCHEN_SUPPORT_TEAM_NAME,
    color: MUDKITCHEN_SUPPORT_COLOR,
    profilePhotoUrl: MUDKITCHEN_SUPPORT_LOGO_URL,
  };
}

function matchesPinScope(thread: MessageThreadSummary, scope: MudKitchenSupportPinScope): boolean {
  if (!threadHasPlatformSupport(thread.participants)) return false;
  if (scope.mode === 'parent') {
    return thread.participants.some(
      (participant) =>
        participant.kind === 'guardian' && participant.guardianId === scope.guardianId,
    );
  }
  return thread.participants.some(
    (participant) =>
      participant.kind === 'staff_member' && participant.staffMemberId === scope.staffMemberId,
  );
}

function isPinnedSupportSummary(
  thread: MessageThreadSummary,
  scope?: MudKitchenSupportPinScope,
): boolean {
  if (scope) return matchesPinScope(thread, scope);
  return (
    threadHasPlatformSupport(thread.participants) ||
    (!isMudKitchenSupportPlaceholder(thread.id) &&
      isMudKitchenSupportThreadTitle(thread.title))
  );
}

export function resolveMudKitchenSupportNavigationThreadId(
  threads: MessageThreadSummary[],
  scope: MudKitchenSupportPinScope,
): string {
  const [pinned] = pinMudKitchenSupportThread(threads, null, scope);
  return pinned.id;
}

export function pinMudKitchenSupportThread(
  threads: MessageThreadSummary[],
  activeSummary?: MessageThreadSummary | null,
  scope?: MudKitchenSupportPinScope,
): MessageThreadSummary[] {
  const withoutPlaceholder = threads.filter(
    (thread) => !isMudKitchenSupportPlaceholder(thread.id),
  );
  const existing = scope
    ? withoutPlaceholder.find((thread) => matchesPinScope(thread, scope))
    : withoutPlaceholder.find((thread) => threadHasPlatformSupport(thread.participants));
  const activeIsSupport =
    activeSummary && isPinnedSupportSummary(activeSummary, scope) ? activeSummary : null;
  const pinnedSource = existing ?? activeIsSupport;
  const rest = withoutPlaceholder.filter((thread) => thread.id !== pinnedSource?.id);
  const pinned = pinnedSource ?? mudKitchenSupportPlaceholderThread();
  return [pinned, ...rest];
}

export function filterStoryInboxThreads(
  threads: MessageThreadSummary[],
  query: string,
): MessageThreadSummary[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return threads;

  const pinnedSupport = threads.find((thread) => isMudKitchenSupportListThread(thread));
  const filtered = threads.filter(
    (thread) =>
      thread.title.toLowerCase().includes(needle) ||
      thread.subtitle?.toLowerCase().includes(needle) ||
      (thread.lastMessagePreview?.toLowerCase().includes(needle) ?? false),
  );

  if (pinnedSupport && !filtered.some((thread) => thread.id === pinnedSupport.id)) {
    return [pinnedSupport, ...filtered];
  }
  return filtered;
}

export function sortThreadsByRecency<T extends { lastMessageAt: string | null }>(
  threads: T[],
): T[] {
  return [...threads].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return bTime - aTime;
  });
}

export function prepareMobileInboxThreads(
  threads: MessageThreadSummary[],
  scope: MudKitchenSupportPinScope | null,
  searchQuery: string,
): MessageThreadSummary[] {
  const pinned = scope
    ? pinMudKitchenSupportThread(threads, null, scope)
    : sortThreadsByRecency(threads);
  if (!scope) {
    return filterStoryInboxThreads(pinned, searchQuery);
  }
  const [first, ...rest] = pinned;
  const sortedRest = sortThreadsByRecency(rest);
  const combined = [first, ...sortedRest];
  return filterStoryInboxThreads(combined, searchQuery);
}
