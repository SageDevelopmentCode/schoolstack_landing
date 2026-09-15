export type CommitteeType =
  | 'long_term_role'
  | 'annual_volunteer'
  | 'event'
  | 'hybrid';

export type CommitteeRole = 'member' | 'lead' | 'faculty_liaison' | 'admin';

export type CommitteeStatus = 'draft' | 'active' | 'archived';

export type CommitteeMemberStatus = 'active' | 'invited' | 'removed';

export type CommitteeWorkspaceSection =
  | 'home'
  | 'about'
  | 'resources'
  | 'calendar'
  | 'tasks'
  | 'messages'
  | 'members'
  | 'settings';

export type CommitteeTaskStatus = 'open' | 'claimed' | 'in_progress' | 'done';

export type CommitteeResourceType = 'pdf' | 'doc' | 'link' | 'checklist';

export type CommitteeEventType = 'meeting' | 'deadline' | 'service' | 'event';

export type CommitteeTaskGroupDef = {
  id: string;
  label: string;
};

export type CommitteeTemplateConfig = {
  sections: CommitteeWorkspaceSection[];
  taskGroups?: CommitteeTaskGroupDef[];
  showGradeColumn?: boolean;
  defaultTermLabel?: string;
};

export type CommitteeMember = {
  id: string;
  committeeId: string;
  organizationId: string;
  userId: string | null;
  guardianId: string | null;
  staffMemberId: string | null;
  name: string;
  email: string;
  phone?: string;
  role: CommitteeRole;
  grade?: string;
  bio?: string;
  termStart?: string;
  termEnd?: string;
  status: CommitteeMemberStatus;
};

export type CommitteeResource = {
  id: string;
  title: string;
  type: CommitteeResourceType;
  url?: string;
  storagePath?: string;
  fileName?: string;
  description?: string;
  addedBy?: string;
  allowedDutyRoleIds?: string[];
};

export type CommitteeEvent = {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: CommitteeEventType;
  location?: string;
};

export type CommitteeTask = {
  id: string;
  title: string;
  description?: string;
  group: string;
  status: CommitteeTaskStatus;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  attachmentLabel?: string;
};

export type CommitteeMessage = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
};

export type CommitteeDutyRole = {
  id: string;
  title: string;
  description: string;
  assigneeId?: string;
};

export type Committee = {
  id: string;
  organizationId: string;
  templateId: string | null;
  name: string;
  type: CommitteeType;
  description: string;
  status: CommitteeStatus;
  termLabel: string;
  termStart: string;
  termEnd: string;
  aboutHtml: string;
  config: CommitteeTemplateConfig;
  dutyRoles: CommitteeDutyRole[];
  members: CommitteeMember[];
  resources: CommitteeResource[];
  events: CommitteeEvent[];
  tasks: CommitteeTask[];
  messages: CommitteeMessage[];
};

export type CommitteeJoinRequestStatus =
  | 'pending'
  | 'approved'
  | 'declined'
  | 'withdrawn';

export type ParentCommitteeBrowseItem = {
  id: string;
  name: string;
  description: string;
  termLabel: string;
  type: CommitteeType;
  dutyRoles: { id: string; title: string; description: string }[];
  requestStatus: CommitteeJoinRequestStatus | null;
  requestId: string | null;
  isMember: boolean;
};

export type ParentCommitteeListItem = {
  id: string;
  name: string;
  description: string;
  termLabel: string;
  type: CommitteeType;
  openTaskCount: number;
  nextEventTitle: string | null;
};

export type ParentCommitteesData = {
  browseCommittees: ParentCommitteeBrowseItem[];
  myCommittees: ParentCommitteeListItem[];
};

export const COMMITTEE_SECTION_LABELS: Record<CommitteeWorkspaceSection, string> = {
  home: 'Home',
  about: 'Role & Duties',
  resources: 'Resources',
  calendar: 'Calendar',
  tasks: 'Tasks',
  messages: 'Messages',
  members: 'Members',
  settings: 'Settings',
};

export const TASK_STATUS_LABELS: Record<CommitteeTaskStatus, string> = {
  open: 'Open',
  claimed: 'Claimed',
  in_progress: 'In progress',
  done: 'Done',
};

export type ParentCommitteesTab = 'explore' | 'mine';

export function isCommitteeWorkspaceSection(value: string): value is CommitteeWorkspaceSection {
  return (
    value === 'home' ||
    value === 'about' ||
    value === 'resources' ||
    value === 'calendar' ||
    value === 'tasks' ||
    value === 'messages' ||
    value === 'members' ||
    value === 'settings'
  );
}

export function stripHtmlTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
