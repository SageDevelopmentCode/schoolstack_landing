import type { MessageThreadSummary } from "./types";

export const MUDKITCHEN_SUPPORT_TEAM_NAME = "MudKitchen Support Team";
export const MUDKITCHEN_SUPPORT_LOGO_URL = "/images/Logo.png";
export const MUDKITCHEN_SUPPORT_PLACEHOLDER_ID = "pending-platform_support";
export const MUDKITCHEN_SUPPORT_CONTACT_KEY = "platform_support";
export const MUDKITCHEN_SUPPORT_COLOR = "#C46A45";
export const MUDKITCHEN_SUPPORT_EMPTY_COPY =
  "Message the MudKitchen team for help with the product.";
export const MUDKITCHEN_SUPPORT_LIST_PREVIEW = "Message the MudKitchen team";

export type MudKitchenSupportPinScope =
  | { mode: "parent"; guardianId: string }
  | { mode: "teacher"; staffMemberId: string };

export function threadHasPlatformSupport(
  participants: ReadonlyArray<{ kind: string }>,
): boolean {
  return participants.some((participant) => participant.kind === "platform_support");
}

export function threadIsParentPlatformSupport(
  participants: ReadonlyArray<{
    kind: string;
    guardianId?: string | null;
  }>,
): boolean {
  return (
    threadHasPlatformSupport(participants) &&
    participants.some((participant) => participant.kind === "guardian")
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
        participant.kind === "staff_member" &&
        participant.staffMemberId === staffMemberId,
    )
  );
}

export function isMudKitchenSupportPlaceholder(threadId: string | null | undefined): boolean {
  return threadId === MUDKITCHEN_SUPPORT_PLACEHOLDER_ID;
}

export function isMudKitchenSupportListThread(
  thread: Pick<MessageThreadSummary, "id" | "title" | "participants">,
): boolean {
  return (
    isMudKitchenSupportPlaceholder(thread.id) ||
    threadHasPlatformSupport(thread.participants) ||
    thread.title === MUDKITCHEN_SUPPORT_TEAM_NAME
  );
}

export function mudKitchenSupportPlaceholderThread(): MessageThreadSummary {
  return {
    id: MUDKITCHEN_SUPPORT_PLACEHOLDER_ID,
    subject: null,
    title: MUDKITCHEN_SUPPORT_TEAM_NAME,
    subtitle: "Help with MudKitchen",
    photoUrl: MUDKITCHEN_SUPPORT_LOGO_URL,
    color: "#F8F4EA",
    lastMessagePreview: MUDKITCHEN_SUPPORT_LIST_PREVIEW,
    lastMessageAt: null,
    lastMessageTimeLabel: null,
    unreadCount: 0,
    participants: [],
  };
}

function matchesPinScope(
  thread: MessageThreadSummary,
  scope: MudKitchenSupportPinScope,
): boolean {
  if (!threadHasPlatformSupport(thread.participants)) return false;
  if (scope.mode === "parent") {
    return thread.participants.some(
      (participant) =>
        participant.kind === "guardian" && participant.guardianId === scope.guardianId,
    );
  }
  return thread.participants.some(
    (participant) =>
      participant.kind === "staff_member" &&
      participant.staffMemberId === scope.staffMemberId,
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
      thread.title === MUDKITCHEN_SUPPORT_TEAM_NAME)
  );
}

/**
 * Web parent/teacher inbox only. Keeps MudKitchen Support at the top and supplies a
 * local placeholder until the first message creates a real thread.
 */
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
    activeSummary && isPinnedSupportSummary(activeSummary, scope)
      ? activeSummary
      : null;
  const pinnedSource = existing ?? activeIsSupport;
  const rest = withoutPlaceholder.filter((thread) => thread.id !== pinnedSource?.id);
  const pinned = pinnedSource ?? mudKitchenSupportPlaceholderThread();
  return [pinned, ...rest];
}

export function baseThreadsForInboxList(
  viewer: "parent" | "teacher" | "admin",
  listedThreads: MessageThreadSummary[],
  threads: MessageThreadSummary[],
): MessageThreadSummary[] {
  return viewer === "parent" || viewer === "teacher" ? listedThreads : threads;
}

export function filterStoryInboxThreads(
  threads: MessageThreadSummary[],
  query: string,
  storyVariant: boolean,
): MessageThreadSummary[] {
  const needle = query.trim().toLowerCase();
  if (!storyVariant || !needle) return threads;

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

export function omitPlatformSupportThreads<
  T extends { participants: ReadonlyArray<{ kind: string }> },
>(threads: T[]): T[] {
  return threads.filter((thread) => !threadHasPlatformSupport(thread.participants));
}

export function shouldOmitPlatformSupportThreadForViewer(
  participants: ReadonlyArray<{
    kind: string;
    guardianId?: string | null;
    staffMemberId?: string | null;
  }>,
  viewer: "parent" | "teacher" | "admin",
  staffMemberId?: string | null,
): boolean {
  if (!threadHasPlatformSupport(participants)) return false;
  if (viewer === "parent") return false;
  if (viewer === "admin") return true;
  if (viewer === "teacher") {
    if (threadIsParentPlatformSupport(participants)) return true;
    if (!staffMemberId) return true;
    return !threadIsStaffPlatformSupport(participants, staffMemberId);
  }
  return true;
}
