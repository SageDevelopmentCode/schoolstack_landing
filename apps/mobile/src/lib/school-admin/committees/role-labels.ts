import type { CommitteeRole } from '@/lib/parent/parent-committees-types';

export const COMMITTEE_ROLE_LABELS: Record<CommitteeRole, string> = {
  member: 'Member',
  lead: 'Committee Lead',
  faculty_liaison: 'Faculty Liaison',
  admin: 'Admin',
};

export const COMMITTEE_ASSIGNABLE_ROLE_OPTIONS: { value: CommitteeRole; label: string }[] = [
  { value: 'member', label: COMMITTEE_ROLE_LABELS.member },
  { value: 'lead', label: COMMITTEE_ROLE_LABELS.lead },
  { value: 'faculty_liaison', label: COMMITTEE_ROLE_LABELS.faculty_liaison },
  { value: 'admin', label: COMMITTEE_ROLE_LABELS.admin },
];
