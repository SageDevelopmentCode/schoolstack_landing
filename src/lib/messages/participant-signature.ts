import type { MessageParticipantInput } from "./types";

function participantToken(participant: MessageParticipantInput): string {
  switch (participant.kind) {
    case "family":
      return `family:${participant.familyId}`;
    case "guardian":
      return `guardian:${participant.guardianId}`;
    case "staff_member":
      return `staff:${participant.staffMemberId}`;
    case "school_office":
      return "school_office";
  }
}

export function buildParticipantSignature(
  participants: MessageParticipantInput[],
): string {
  return [...participants]
    .map(participantToken)
    .sort()
    .join("|");
}

export function validateParticipantSet(participants: MessageParticipantInput[]): void {
  if (participants.length < 2) {
    throw new Error("A thread requires at least two participants.");
  }

  const kinds = participants.map((p) => p.kind);
  const familyCount = kinds.filter((k) => k === "family").length;
  const guardianCount = kinds.filter((k) => k === "guardian").length;
  const staffCount = kinds.filter((k) => k === "staff_member").length;
  const officeCount = kinds.filter((k) => k === "school_office").length;
  const parentSideCount = familyCount + guardianCount;

  if (parentSideCount > 1 || staffCount > 2 || officeCount > 1) {
    throw new Error("Invalid participant combination.");
  }

  if (officeCount === 1 && parentSideCount === 1 && staffCount === 1) {
    throw new Error("School office threads cannot include both a parent and staff.");
  }

  if (officeCount === 1 && staffCount === 1 && parentSideCount === 0) {
    return;
  }

  if (parentSideCount === 1 && staffCount === 1 && officeCount === 0) {
    return;
  }

  if (parentSideCount === 1 && officeCount === 1 && staffCount === 0) {
    return;
  }

  if (parentSideCount === 0 && staffCount === 2 && officeCount === 0) {
    return;
  }

  throw new Error("Unsupported participant combination.");
}
