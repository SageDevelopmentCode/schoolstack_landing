export type CommitteeUnreadSection = "messages" | "tasks" | "resources" | "calendar";

export type CommitteeSectionUnreadCounts = Record<CommitteeUnreadSection, number>;

export type CommitteeUnreadSummaryItem = {
  committeeId: string;
  memberId: string;
  unread: number;
  sections: CommitteeSectionUnreadCounts;
};

export type CommitteeUnreadSummary = {
  totalUnread: number;
  byCommittee: CommitteeUnreadSummaryItem[];
};
