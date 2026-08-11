import type { MessageContactInput, MessageParticipantInput } from "./types";

export function participantsFromContact(
  contact: MessageContactInput,
  context: {
    familyId?: string | null;
    staffMemberId?: string | null;
  },
): MessageParticipantInput[] {
  if (contact.kind === "school_office") {
    if (!context.familyId) {
      throw new Error("A family is required to message the school office.");
    }
    return [
      { kind: "family", familyId: context.familyId },
      { kind: "school_office" },
    ];
  }

  if (contact.kind === "family") {
    if (!contact.familyId) throw new Error("Family contact is missing familyId.");
    if (context.staffMemberId) {
      return [
        { kind: "family", familyId: contact.familyId },
        { kind: "staff_member", staffMemberId: context.staffMemberId },
      ];
    }
    return [
      { kind: "family", familyId: contact.familyId },
      { kind: "school_office" },
    ];
  }

  if (!contact.staffMemberId) {
    throw new Error("Staff contact is missing staffMemberId.");
  }

  if (context.familyId) {
    return [
      { kind: "family", familyId: context.familyId },
      { kind: "staff_member", staffMemberId: contact.staffMemberId },
    ];
  }

  if (context.staffMemberId) {
    if (context.staffMemberId === contact.staffMemberId) {
      throw new Error("Cannot create a thread with yourself.");
    }
    return [
      { kind: "staff_member", staffMemberId: context.staffMemberId },
      { kind: "staff_member", staffMemberId: contact.staffMemberId },
    ];
  }

  return [
    { kind: "school_office" },
    { kind: "staff_member", staffMemberId: contact.staffMemberId },
  ];
}

export function contactKeyForThread(
  threadParticipants: { kind: string; familyId: string | null; staffMemberId: string | null }[],
  viewer: "parent" | "teacher" | "admin",
  context: { familyId?: string | null; staffMemberId?: string | null },
): string | null {
  const hasOffice = threadParticipants.some((p) => p.kind === "school_office");
  const familyParticipant = threadParticipants.find((p) => p.kind === "family");
  const staffParticipants = threadParticipants.filter((p) => p.kind === "staff_member");

  if (hasOffice && familyParticipant?.familyId) {
    if (viewer === "parent") return "school_office";
    return `family:${familyParticipant.familyId}`;
  }

  if (hasOffice && staffParticipants[0]?.staffMemberId) {
    if (viewer === "teacher") return "school_office";
    return `staff:${staffParticipants[0].staffMemberId}`;
  }

  if (hasOffice) return "school_office";

  if (staffParticipants.length === 2 && !familyParticipant) {
    const other = staffParticipants.find(
      (p) => p.staffMemberId && p.staffMemberId !== context.staffMemberId,
    );
    return other?.staffMemberId ? `staff:${other.staffMemberId}` : null;
  }

  if (viewer === "parent" && staffParticipants[0]?.staffMemberId) {
    return `staff:${staffParticipants[0].staffMemberId}`;
  }

  if (familyParticipant?.familyId) {
    return `family:${familyParticipant.familyId}`;
  }

  return null;
}
