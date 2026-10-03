import type {
  CommitteeSectionUnreadCounts,
  CommitteeUnreadSection,
  CommitteeUnreadSummary,
} from '@/lib/committees/committee-unread-types';

export const WORKSPACE_DIGEST_SECTION_LABELS: Record<CommitteeUnreadSection, string> = {
  messages: 'Messages',
  tasks: 'Tasks',
  resources: 'Resources',
  calendar: 'Calendar',
};

const SECTION_ORDER: CommitteeUnreadSection[] = ['messages', 'tasks', 'resources', 'calendar'];

export type CommitteeUnreadMaps = {
  unreadByCommitteeId: Record<string, number>;
  unreadSectionLabelsByCommitteeId: Record<string, string[]>;
};

export function buildUnreadMaps(summary: CommitteeUnreadSummary): CommitteeUnreadMaps {
  const unreadByCommitteeId: Record<string, number> = {};
  const unreadSectionLabelsByCommitteeId: Record<string, string[]> = {};

  for (const row of summary.byCommittee) {
    unreadByCommitteeId[row.committeeId] = row.unread;
    const labels = SECTION_ORDER
      .filter((section) => row.sections[section] > 0)
      .map((section) => WORKSPACE_DIGEST_SECTION_LABELS[section]);
    if (labels.length > 0) {
      unreadSectionLabelsByCommitteeId[row.committeeId] = labels;
    }
  }

  return { unreadByCommitteeId, unreadSectionLabelsByCommitteeId };
}

export function sectionUnreadForCommittee(
  summary: CommitteeUnreadSummary,
  committeeId: string,
): CommitteeSectionUnreadCounts | undefined {
  const row = summary.byCommittee.find((item) => item.committeeId === committeeId);
  return row?.sections;
}
