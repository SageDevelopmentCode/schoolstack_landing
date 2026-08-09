import { formatMessageTime } from "./format";
import type {
  MessageParticipantKind,
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
  staffMembers: Map<string, { firstName: string; lastName: string; roleTitle?: string | null }>;
  schoolOfficeLabel: string;
  currentUserId: string;
};

export function mapParticipantRow(
  row: MessageThreadParticipantRow,
): MessageThreadParticipant {
  return {
    id: String(row.id),
    kind: row.participant_kind,
    familyId: row.family_id ? String(row.family_id) : null,
    staffMemberId: row.staff_member_id ? String(row.staff_member_id) : null,
  };
}

export function resolveThreadTitle(
  participants: MessageThreadParticipant[],
  context: ParticipantDisplayContext,
  viewer: "parent" | "teacher" | "admin",
): { title: string; subtitle?: string; color: string } {
  const familyParticipant = participants.find((p) => p.kind === "family");
  const staffParticipants = participants.filter((p) => p.kind === "staff_member");
  const hasOffice = participants.some((p) => p.kind === "school_office");

  if (hasOffice && familyParticipant?.familyId) {
    const family = context.families.get(familyParticipant.familyId);
    if (viewer === "parent") {
      return {
        title: context.schoolOfficeLabel,
        subtitle: "Admin",
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
      color: "#4A6354",
    };
  }

  if (staffParticipants.length === 2 && !familyParticipant) {
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

  if (familyParticipant?.familyId && staffParticipants.length === 1) {
    const family = context.families.get(familyParticipant.familyId);
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
        color: "#7FA888",
      };
    }

    return {
      title: family?.name ?? "Family",
      subtitle: staffName,
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

  if (row.sender_kind === "org_admin") {
    senderName = context.schoolOfficeLabel;
  } else if (row.sender_kind === "guardian" && row.sender_guardian_id) {
    senderName = "Parent";
  } else if (row.sender_kind === "staff_member" && row.sender_staff_member_id) {
    const staff = context.staffMembers.get(row.sender_staff_member_id);
    senderName = staff
      ? [staff.firstName, staff.lastName].filter(Boolean).join(" ")
      : "Staff";
  }

  return {
    id: String(row.id),
    threadId: String(row.thread_id),
    body: row.body,
    senderUserId: String(row.sender_user_id),
    senderKind: row.sender_kind,
    senderName,
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
): MessageThreadSummary {
  const display = resolveThreadTitle(participants, context, viewer);

  return {
    id: String(thread.id),
    subject: thread.subject,
    title: display.title,
    subtitle: display.subtitle,
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
