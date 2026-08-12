export type MessageParticipantKind = "family" | "staff_member" | "school_office";

export type PortalMessageSenderKind = "guardian" | "staff_member" | "org_admin";

export type MessageParticipantInput =
  | { kind: "family"; familyId: string }
  | { kind: "staff_member"; staffMemberId: string }
  | { kind: "school_office" };

export type MessageContactKind = "family" | "staff_member" | "school_office";

export type MessageStudentRef = {
  id: string;
  name: string;
};

export type MessageStudentSummary = {
  id: string;
  firstName: string;
  lastName: string;
  grade: string | null;
  dateOfBirth: string | null;
  status: string;
  familyId: string;
  familyName: string | null;
  primaryContactName: string | null;
  primaryContactEmail: string | null;
  programNames: string[];
  enrolledAt: string;
  assignedTeacherId: string | null;
  assignedTeacherName: string | null;
  profilePhotoUrl: string | null;
};

export type MessageContact = {
  key: string;
  kind: MessageContactKind;
  familyId?: string;
  staffMemberId?: string;
  name: string;
  subtitle?: string;
  subtitleStudents?: MessageStudentRef[];
  subtitleStudentSummaries?: MessageStudentSummary[];
  color: string;
};

export type MessageContactInput = Omit<MessageContact, "color"> & {
  color?: string;
};

export type MessageThreadParticipant = {
  id: string;
  kind: MessageParticipantKind;
  familyId: string | null;
  staffMemberId: string | null;
};

export type PortalMessage = {
  id: string;
  threadId: string;
  body: string;
  senderUserId: string;
  senderKind: PortalMessageSenderKind;
  senderName: string;
  isOwn: boolean;
  createdAt: string;
  timeLabel: string;
  attachments: MessageAttachment[];
  pending?: boolean;
};

export type MessageAttachment = {
  id: string;
  fileName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  url?: string | null;
};

export type MessageThreadListAvatar = {
  name: string;
  color: string;
};

export type MessageThreadSummary = {
  id: string;
  subject: string | null;
  title: string;
  subtitle?: string;
  subtitleStudents?: MessageStudentRef[];
  subtitleStudentSummaries?: MessageStudentSummary[];
  listAvatars?: MessageThreadListAvatar[];
  color: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  lastMessageTimeLabel: string | null;
  unreadCount: number;
  participants: MessageThreadParticipant[];
};

export type MessageThreadDetail = MessageThreadSummary & {
  messages: PortalMessage[];
};

export type MessagesViewerContext = {
  staffMemberId?: string | null;
  staffDisplayName?: string | null;
};

export type MessagesInboxData = {
  threads: MessageThreadSummary[];
  contacts: MessageContact[];
  viewerContext?: MessagesViewerContext;
};
