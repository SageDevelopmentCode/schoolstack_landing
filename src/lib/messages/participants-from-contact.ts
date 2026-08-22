import type { MessageContactInput, MessageParticipantInput } from "./types";

export function participantsFromContact(
  contact: MessageContactInput,
  context: {
    guardianId?: string | null;
    staffMemberId?: string | null;
  },
): MessageParticipantInput[] {
  if (contact.kind === "school_office") {
    if (!context.guardianId) {
      throw new Error("A guardian profile is required to message the school office.");
    }
    return [
      { kind: "guardian", guardianId: context.guardianId },
      { kind: "school_office" },
    ];
  }

  if (contact.kind === "guardian") {
    if (!contact.guardianId) throw new Error("Guardian contact is missing guardianId.");
    if (context.staffMemberId) {
      return [
        { kind: "guardian", guardianId: contact.guardianId },
        { kind: "staff_member", staffMemberId: context.staffMemberId },
      ];
    }
    return [
      { kind: "guardian", guardianId: contact.guardianId },
      { kind: "school_office" },
    ];
  }

  if (!contact.staffMemberId) {
    throw new Error("Staff contact is missing staffMemberId.");
  }

  if (context.guardianId) {
    return [
      { kind: "guardian", guardianId: context.guardianId },
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
  threadParticipants: {
    kind: string;
    familyId: string | null;
    guardianId: string | null;
    staffMemberId: string | null;
  }[],
  viewer: "parent" | "teacher" | "admin",
  context: {
    guardianId?: string | null;
    staffMemberId?: string | null;
  },
): string | null {
  const hasOffice = threadParticipants.some((p) => p.kind === "school_office");
  const guardianParticipant = threadParticipants.find((p) => p.kind === "guardian");
  const legacyFamilyParticipant = threadParticipants.find((p) => p.kind === "family");
  const staffParticipants = threadParticipants.filter((p) => p.kind === "staff_member");

  if (hasOffice && guardianParticipant?.guardianId) {
    if (viewer === "parent") return "school_office";
    return `guardian:${guardianParticipant.guardianId}`;
  }

  if (hasOffice && legacyFamilyParticipant?.familyId) {
    if (viewer === "parent") return "school_office";
    return `family:${legacyFamilyParticipant.familyId}`;
  }

  if (hasOffice && staffParticipants[0]?.staffMemberId) {
    if (viewer === "teacher") return "school_office";
    return `staff:${staffParticipants[0].staffMemberId}`;
  }

  if (hasOffice) return "school_office";

  if (staffParticipants.length === 2 && !guardianParticipant && !legacyFamilyParticipant) {
    const other = staffParticipants.find(
      (p) => p.staffMemberId && p.staffMemberId !== context.staffMemberId,
    );
    return other?.staffMemberId ? `staff:${other.staffMemberId}` : null;
  }

  if (viewer === "parent" && staffParticipants[0]?.staffMemberId) {
    return `staff:${staffParticipants[0].staffMemberId}`;
  }

  if (guardianParticipant?.guardianId) {
    if (
      viewer === "admin" &&
      !hasOffice &&
      staffParticipants.length === 1 &&
      staffParticipants[0]?.staffMemberId
    ) {
      return `guardian:${guardianParticipant.guardianId}:staff:${staffParticipants[0].staffMemberId}`;
    }
    return `guardian:${guardianParticipant.guardianId}`;
  }

  if (legacyFamilyParticipant?.familyId) {
    return `family:${legacyFamilyParticipant.familyId}`;
  }

  return null;
}
