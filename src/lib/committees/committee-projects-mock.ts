import type { ProgramCoopFamily } from "@/lib/admissions/program-coop-directory";
import type { CommitteeMember } from "@/lib/committees/types";

export type { CommitteeProject, CommitteeProjectStatus } from "@/lib/committees/committee-project-mappers";

export function committeeMembersToCoopFamilies(
  members: CommitteeMember[],
): ProgramCoopFamily[] {
  return members
    .filter((member) => member.status === "active")
    .map((member) => ({
      familyId: member.id,
      familyName: member.name,
      isCurrentFamily: false,
      contactGuardianId: member.guardianId,
      learners: [],
      enrolledAt: null,
    }));
}

export function committeeProjectDisplayName(project: { name: string }): string {
  const trimmed = project.name.trim();
  return trimmed || "Untitled project";
}
