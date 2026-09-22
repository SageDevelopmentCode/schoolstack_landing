import type { CommitteeMember, CommitteeRole } from "./types";

export const COMMITTEE_ROLE_LABELS: Record<CommitteeRole, string> = {
  member: "Member",
  lead: "Committee Lead",
  faculty_liaison: "Faculty Liaison",
  admin: "Admin",
};

export const SCHOOL_ADMIN_ATTRIBUTION = "School Admin";

export function formatCommitteeRole(role: CommitteeRole): string {
  return COMMITTEE_ROLE_LABELS[role] ?? role;
}

export function formatCommitteeAttribution(
  member: Pick<CommitteeMember, "name" | "role"> | null | undefined,
): string {
  if (!member) return SCHOOL_ADMIN_ATTRIBUTION;
  return `${member.name} · ${formatCommitteeRole(member.role)}`;
}

export function resolveAttributionMember(
  memberId: string | null | undefined,
  members: CommitteeMember[],
): CommitteeMember | null {
  if (!memberId) return null;
  return members.find((member) => member.id === memberId) ?? null;
}

export function canMemberEditItem(
  createdByMemberId: string | null | undefined,
  currentMemberId: string | null | undefined,
  isAdmin: boolean,
): boolean {
  if (isAdmin) return true;
  if (!currentMemberId || !createdByMemberId) return false;
  return createdByMemberId === currentMemberId;
}
