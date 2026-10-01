import type { CommitteeUnreadSection } from "@/lib/committees/committee-unread-types";

export function isCommitteeSectionEligibleForUnreadDigest(input: {
  latestEntityAt: string | null;
  lastReadAt: string | null;
  lastDigestNotifiedAt: string | null;
}): boolean {
  if (!input.latestEntityAt) {
    return false;
  }

  const latest = new Date(input.latestEntityAt).getTime();
  if (Number.isNaN(latest)) {
    return false;
  }

  const readCutoff = input.lastReadAt
    ? new Date(input.lastReadAt).getTime()
    : Number.NEGATIVE_INFINITY;
  if (Number.isNaN(readCutoff) || latest <= readCutoff) {
    return false;
  }

  const digestCutoff = input.lastDigestNotifiedAt
    ? new Date(input.lastDigestNotifiedAt).getTime()
    : Number.NEGATIVE_INFINITY;
  if (Number.isNaN(digestCutoff) || latest <= digestCutoff) {
    return false;
  }

  return true;
}

export function digestEligibleSectionCounts(input: {
  latestAt: Partial<Record<CommitteeUnreadSection, string | null>>;
  readAt: Partial<Record<CommitteeUnreadSection, string | null>>;
  digestNotifiedAt: Partial<Record<CommitteeUnreadSection, string | null>>;
}): Record<CommitteeUnreadSection, number> {
  const sections: CommitteeUnreadSection[] = [
    "messages",
    "tasks",
    "resources",
    "calendar",
  ];

  const counts: Record<CommitteeUnreadSection, number> = {
    messages: 0,
    tasks: 0,
    resources: 0,
    calendar: 0,
  };

  for (const section of sections) {
    counts[section] = isCommitteeSectionEligibleForUnreadDigest({
      latestEntityAt: input.latestAt[section] ?? null,
      lastReadAt: input.readAt[section] ?? null,
      lastDigestNotifiedAt: input.digestNotifiedAt[section] ?? null,
    })
      ? 1
      : 0;
  }

  return counts;
}
