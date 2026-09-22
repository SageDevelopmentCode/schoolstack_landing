import type { CommitteeRole } from "./types";

export const COMMITTEE_ROLE_LABELS: Record<CommitteeRole, string> = {
  member: "Member",
  lead: "Lead",
  faculty_liaison: "Faculty liaison",
  admin: "Admin",
};

export const COMMITTEE_ASSIGNABLE_ROLE_OPTIONS: {
  value: CommitteeRole;
  label: string;
}[] = [
  { value: "member", label: COMMITTEE_ROLE_LABELS.member },
  { value: "lead", label: COMMITTEE_ROLE_LABELS.lead },
];
