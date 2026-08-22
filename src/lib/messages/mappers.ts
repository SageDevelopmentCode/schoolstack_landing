import { colorForKey, formatMessageTime } from "./format";
import {
  formatEnrolledStudentName,
  formatEnrolledStudentSubtitle,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import type {
  MessageParticipantKind,
  MessageStudentRef,
  MessageStudentSummary,
  MessageThreadListAvatar,
  MessageThreadParticipant,
  MessageThreadSummary,
  PortalMessage,
  PortalMessageSenderKind,
} from "./types";

export type MessageThreadRow = {
  id: string;
  organization_id: string;
  subject: string | null;
  participant_signature: string;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MessageThreadParticipantRow = {
  id: string;
  thread_id: string;
  organization_id: string;
  participant_kind: MessageParticipantKind;
  family_id: string | null;
  guardian_id: string | null;
  staff_member_id: string | null;
};

export type PortalMessageRow = {
  id: string;
  thread_id: string;
  organization_id: string;
  body: string;
  sender_user_id: string;
  sender_kind: PortalMessageSenderKind;
  sender_guardian_id: string | null;
  sender_staff_member_id: string | null;
  created_at: string;
};

export type ParticipantDisplayContext = {
  families: Map<string, { name: string }>;
  staffMembers: Map<
    string,
    {
      firstName: string;
      lastName: string;
      roleTitle?: string | null;
      profilePhotoUrl?: string | null;
    }
  >;
  guardians: Map<
    string,
    {
      firstName: string;
      lastName: string;
      familyId?: string | null;
      profilePhotoUrl?: string | null;
    }
  >;
  familyPrimaryGuardianIds: Map<string, string>;
  familyFirstGuardianIds: Map<string, string>;
  familyEnrolledStudents: Map<string, AdminEnrolledStudentSummary[]>;
  schoolOfficeLabel: string;
  currentUserId: string;
};

export function toMessageStudentRefs(
  summaries: AdminEnrolledStudentSummary[],
): MessageStudentRef[] {
  return summaries.map((summary) => ({
    id: summary.id,
    name: formatEnrolledStudentName(summary),
  }));
}

export function toMessageStudentSummaries(
  summaries: AdminEnrolledStudentSummary[],
): MessageStudentSummary[] {
  return summaries.map((summary) => ({
    id: summary.id,
    firstName: summary.firstName,
    lastName: summary.lastName,
    grade: summary.grade,
    dateOfBirth: summary.dateOfBirth,
    status: summary.status,
    familyId: summary.familyId,
    familyName: summary.familyName,
    primaryContactName: summary.primaryContactName,
    primaryContactEmail: summary.primaryContactEmail,
    programNames: summary.programNames,
    enrolledAt: summary.enrolledAt,
    assignedTeacherId: summary.assignedTeacherId,
    assignedTeacherName: summary.assignedTeacherName,
    profilePhotoUrl: summary.profilePhotoUrl,
  }));
}

export function resolveGuardianDisplayName(
  guardianId: string,
  context: ParticipantDisplayContext,
): string | null {
  const guardian = context.guardians.get(guardianId);
  if (!guardian) return null;
  return [guardian.firstName, guardian.lastName].filter(Boolean).join(" ") || null;
}

export function guardianPhotoUrl(
  guardianId: string,
  context: ParticipantDisplayContext,
): string | null {
  return context.guardians.get(guardianId)?.profilePhotoUrl ?? null;
}

export function familyGuardianPhotoUrl(
  familyId: string,
  context: ParticipantDisplayContext,
  lastMessage?: PortalMessageRow | null,
  messages?: PortalMessageRow[] | null,
): string | null {
  const messagingGuardianId = findLastGuardianMessageSenderId(lastMessage, messages);
  if (messagingGuardianId) {
    const messagingPhoto = guardianPhotoUrl(messagingGuardianId, context);
    if (messagingPhoto) return messagingPhoto;
  }

  const primaryGuardianId = context.familyPrimaryGuardianIds.get(familyId);
  if (primaryGuardianId) {
    const primaryPhoto = guardianPhotoUrl(primaryGuardianId, context);
    if (primaryPhoto) return primaryPhoto;
  }

  const firstGuardianId = context.familyFirstGuardianIds.get(familyId);
  if (firstGuardianId) {
    return guardianPhotoUrl(firstGuardianId, context);
  }

  return null;
}

function findLastGuardianMessageSenderId(
  lastMessage: PortalMessageRow | null | undefined,
  messages: PortalMessageRow[] | null | undefined,
): string | null {
  if (messages && messages.length > 0) {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const row = messages[index];
      if (row.sender_kind === "guardian" && row.sender_guardian_id) {
        return String(row.sender_guardian_id);
      }
    }
    return null;
  }

  if (lastMessage?.sender_kind === "guardian" && lastMessage.sender_guardian_id) {
    return String(lastMessage.sender_guardian_id);
  }

  return null;
}

export function resolveTeacherFamilyThreadTitle(
  familyId: string,
  context: ParticipantDisplayContext,
  lastMessage?: PortalMessageRow | null,
  messages?: PortalMessageRow[] | null,
): string {
  const messagingGuardianId = findLastGuardianMessageSenderId(lastMessage, messages);
  if (messagingGuardianId) {
    const messagingName = resolveGuardianDisplayName(messagingGuardianId, context);
    if (messagingName) return messagingName;
  }

  const primaryGuardianId = context.familyPrimaryGuardianIds.get(familyId);
  if (primaryGuardianId) {
    const primaryName = resolveGuardianDisplayName(primaryGuardianId, context);
    if (primaryName) return primaryName;
  }

  const firstGuardianId = context.familyFirstGuardianIds.get(familyId);
  if (firstGuardianId) {
    const firstName = resolveGuardianDisplayName(firstGuardianId, context);
    if (firstName) return firstName;
  }

  return context.families.get(familyId)?.name ?? "Family";
}

export function appendStudentLabel(existing: string | undefined, name: string): string {
  if (!name) return existing ?? "";
  if (!existing) return name;
  if (existing.includes(name)) return existing;
  return `${existing} · ${name}`;
}

export function mapParticipantRow(
  row: MessageThreadParticipantRow,
): MessageThreadParticipant {
  return {
    id: String(row.id),
    kind: row.participant_kind,
    familyId: row.family_id ? String(row.family_id) : null,
    guardianId: row.guardian_id ? String(row.guardian_id) : null,
    staffMemberId: row.staff_member_id ? String(row.staff_member_id) : null,
  };
}

function guardianFamilyId(
  guardianId: string,
  context: ParticipantDisplayContext,
): string | null {
  return context.guardians.get(guardianId)?.familyId ?? null;
}

function resolveGuardianThreadTitle(
  guardianId: string,
  context: ParticipantDisplayContext,
): string {
  return resolveGuardianDisplayName(guardianId, context) ?? "Parent";
}

export function resolveThreadTitle(
  participants: MessageThreadParticipant[],
  context: ParticipantDisplayContext,
  viewer: "parent" | "teacher" | "admin",
  lastMessage?: PortalMessageRow | null,
  threadMessages?: PortalMessageRow[] | null,
): {
  title: string;
  subtitle?: string;
  subtitleStudents?: MessageStudentRef[];
  subtitleStudentSummaries?: MessageStudentSummary[];
  listAvatars?: MessageThreadListAvatar[];
  photoUrl?: string | null;
  color: string;
} {
  const guardianParticipant = participants.find((p) => p.kind === "guardian");
  const legacyFamilyParticipant = participants.find((p) => p.kind === "family");
  const staffParticipants = participants.filter((p) => p.kind === "staff_member");
  const hasOffice = participants.some((p) => p.kind === "school_office");

  if (hasOffice && guardianParticipant?.guardianId) {
    const guardianId = guardianParticipant.guardianId;
    const guardianName = resolveGuardianThreadTitle(guardianId, context);
    if (viewer === "parent") {
      return {
        title: context.schoolOfficeLabel,
        subtitle: "Admin",
        color: "#4A6354",
      };
    }
    if (viewer === "admin") {
      return {
        title: guardianName,
        photoUrl: guardianPhotoUrl(guardianId, context),
        color: "#4A6354",
      };
    }
    return {
      title: guardianName,
      subtitle: context.schoolOfficeLabel,
      color: "#4A6354",
    };
  }

  if (hasOffice && legacyFamilyParticipant?.familyId) {
    const family = context.families.get(legacyFamilyParticipant.familyId);
    if (viewer === "parent") {
      return {
        title: context.schoolOfficeLabel,
        subtitle: "Admin",
        color: "#4A6354",
      };
    }
    if (viewer === "admin") {
      return {
        title: resolveTeacherFamilyThreadTitle(
          legacyFamilyParticipant.familyId,
          context,
          lastMessage,
          threadMessages,
        ),
        photoUrl: familyGuardianPhotoUrl(
          legacyFamilyParticipant.familyId,
          context,
          lastMessage,
          threadMessages,
        ),
        color: "#4A6354",
      };
    }
    return {
      title: family?.name ?? "Family",
      subtitle: context.schoolOfficeLabel,
      color: "#4A6354",
    };
  }

  if (hasOffice && staffParticipants.length === 1) {
    const staff = staffParticipants[0]?.staffMemberId
      ? context.staffMembers.get(staffParticipants[0].staffMemberId)
      : null;
    const staffName = staff
      ? [staff.firstName, staff.lastName].filter(Boolean).join(" ")
      : "Staff";

    if (viewer === "teacher") {
      return {
        title: context.schoolOfficeLabel,
        subtitle: "Admin",
        color: "#4A6354",
      };
    }

    return {
      title: staffName,
      subtitle: context.schoolOfficeLabel,
      photoUrl: staff?.profilePhotoUrl ?? null,
      color: "#4A6354",
    };
  }

  if (staffParticipants.length === 2 && !guardianParticipant && !legacyFamilyParticipant) {
    const names = staffParticipants.map((participant) => {
      const staff = participant.staffMemberId
        ? context.staffMembers.get(participant.staffMemberId)
        : null;
      if (!staff) return "Staff";
      return [staff.firstName, staff.lastName].filter(Boolean).join(" ");
    });
    return {
      title: names.join(" & "),
      subtitle: "Staff",
      color: "#5E7C68",
    };
  }

  if (guardianParticipant?.guardianId && staffParticipants.length === 1) {
    const guardianId = guardianParticipant.guardianId;
    const familyId = guardianFamilyId(guardianId, context);
    const staff = staffParticipants[0]?.staffMemberId
      ? context.staffMembers.get(staffParticipants[0].staffMemberId)
      : null;
    const staffName = staff
      ? [staff.firstName, staff.lastName].filter(Boolean).join(" ")
      : "Teacher";
    const guardianName = resolveGuardianThreadTitle(guardianId, context);
    const guardianPhoto = guardianPhotoUrl(guardianId, context);

    if (viewer === "parent") {
      return {
        title: staffName,
        subtitle: staff?.roleTitle ?? "Teacher",
        photoUrl: staff?.profilePhotoUrl ?? null,
        color: "#7FA888",
      };
    }

    if (viewer === "teacher") {
      const enrolledStudents =
        familyId ? (context.familyEnrolledStudents.get(familyId) ?? []) : [];
      return {
        title: guardianName,
        subtitle:
          enrolledStudents.length > 0
            ? formatEnrolledStudentSubtitle(enrolledStudents)
            : undefined,
        subtitleStudents: toMessageStudentRefs(enrolledStudents),
        subtitleStudentSummaries: toMessageStudentSummaries(enrolledStudents),
        photoUrl: guardianPhoto,
        color: "#7FA888",
      };
    }

    const staffParticipant = staffParticipants[0];
    const staffMemberId = staffParticipant?.staffMemberId ?? null;

    return {
      title: `${guardianName}, ${staffName}`,
      subtitle: undefined,
      listAvatars: [
        {
          name: guardianName,
          color: colorForKey(guardianId),
          profilePhotoUrl: guardianPhoto,
        },
        {
          name: staffName,
          color: colorForKey(staffMemberId ?? staffName),
          profilePhotoUrl: staff?.profilePhotoUrl ?? null,
        },
      ],
      color: "#7FA888",
    };
  }

  if (legacyFamilyParticipant?.familyId && staffParticipants.length === 1) {
    const familyId = legacyFamilyParticipant.familyId;
    const staff = staffParticipants[0]?.staffMemberId
      ? context.staffMembers.get(staffParticipants[0].staffMemberId)
      : null;
    const staffName = staff
      ? [staff.firstName, staff.lastName].filter(Boolean).join(" ")
      : "Teacher";

    if (viewer === "parent") {
      return {
        title: staffName,
        subtitle: staff?.roleTitle ?? "Teacher",
        photoUrl: staff?.profilePhotoUrl ?? null,
        color: "#7FA888",
      };
    }

    if (viewer === "teacher") {
      const enrolledStudents = context.familyEnrolledStudents.get(familyId) ?? [];
      return {
        title: resolveTeacherFamilyThreadTitle(
          familyId,
          context,
          lastMessage,
          threadMessages,
        ),
        subtitle:
          enrolledStudents.length > 0
            ? formatEnrolledStudentSubtitle(enrolledStudents)
            : undefined,
        subtitleStudents: toMessageStudentRefs(enrolledStudents),
        subtitleStudentSummaries: toMessageStudentSummaries(enrolledStudents),
        photoUrl: familyGuardianPhotoUrl(
          familyId,
          context,
          lastMessage,
          threadMessages,
        ),
        color: "#7FA888",
      };
    }

    const staffParticipant = staffParticipants[0];
    const staffMemberId = staffParticipant?.staffMemberId ?? null;
    const guardianName = resolveTeacherFamilyThreadTitle(
      familyId,
      context,
      lastMessage,
      threadMessages,
    );
    const guardianPhoto = familyGuardianPhotoUrl(
      familyId,
      context,
      lastMessage,
      threadMessages,
    );

    return {
      title: `${guardianName}, ${staffName}`,
      subtitle: undefined,
      listAvatars: [
        {
          name: guardianName,
          color: colorForKey(familyId),
          profilePhotoUrl: guardianPhoto,
        },
        {
          name: staffName,
          color: colorForKey(staffMemberId ?? staffName),
          profilePhotoUrl: staff?.profilePhotoUrl ?? null,
        },
      ],
      color: "#7FA888",
    };
  }

  return { title: "Conversation", color: "#827096" };
}

export function mapMessageRow(
  row: PortalMessageRow,
  context: ParticipantDisplayContext,
): PortalMessage {
  let senderName = "Unknown";
  let profilePhotoUrl: string | null = null;

  if (row.sender_kind === "org_admin") {
    senderName = context.schoolOfficeLabel;
  } else if (row.sender_kind === "guardian" && row.sender_guardian_id) {
    const guardian = context.guardians.get(row.sender_guardian_id);
    senderName = guardian
      ? [guardian.firstName, guardian.lastName].filter(Boolean).join(" ")
      : "Parent";
    profilePhotoUrl = guardian?.profilePhotoUrl ?? null;
  } else if (row.sender_kind === "guardian") {
    senderName = "Parent";
  } else if (row.sender_kind === "staff_member" && row.sender_staff_member_id) {
    const staff = context.staffMembers.get(row.sender_staff_member_id);
    senderName = staff
      ? [staff.firstName, staff.lastName].filter(Boolean).join(" ")
      : "Staff";
    profilePhotoUrl = staff?.profilePhotoUrl ?? null;
  }

  return {
    id: String(row.id),
    threadId: String(row.thread_id),
    body: row.body,
    senderUserId: String(row.sender_user_id),
    senderKind: row.sender_kind,
    senderName,
    profilePhotoUrl,
    isOwn: row.sender_user_id === context.currentUserId,
    createdAt: row.created_at,
    timeLabel: formatMessageTime(row.created_at),
    attachments: [],
  };
}

export function mapThreadSummary(
  thread: MessageThreadRow,
  participants: MessageThreadParticipant[],
  context: ParticipantDisplayContext,
  viewer: "parent" | "teacher" | "admin",
  lastMessage: PortalMessageRow | null,
  unreadCount: number,
  threadMessages?: PortalMessageRow[] | null,
): MessageThreadSummary {
  const display = resolveThreadTitle(
    participants,
    context,
    viewer,
    lastMessage,
    threadMessages,
  );

  return {
    id: String(thread.id),
    subject: thread.subject,
    title: display.title,
    subtitle: display.subtitle,
    subtitleStudents: display.subtitleStudents,
    subtitleStudentSummaries: display.subtitleStudentSummaries,
    listAvatars: display.listAvatars,
    photoUrl: display.photoUrl,
    color: display.color,
    lastMessagePreview: lastMessage?.body ?? null,
    lastMessageAt: thread.last_message_at,
    lastMessageTimeLabel: thread.last_message_at
      ? formatMessageTime(thread.last_message_at)
      : null,
    unreadCount,
    participants,
  };
}
