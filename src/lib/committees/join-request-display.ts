import type { CommitteeJoinRequest } from "./types";

export function getCommitteeJoinRequestDisplayName(
  request: Pick<
    CommitteeJoinRequest,
    "guardianName" | "staffName" | "requesterType"
  >,
): string {
  if (request.requesterType === "staff") {
    return request.staffName ?? "Staff member";
  }
  return request.guardianName ?? "Parent";
}
