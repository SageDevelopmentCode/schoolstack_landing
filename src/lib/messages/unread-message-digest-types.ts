export type UnreadMessageDigestResult = {
  threadsConsidered: number;
  digestsSent: number;
  digestFailures: number;
  parentDigestsSent: number;
  teacherDigestsSent: number;
};

export type UnreadDigestDiscordDelivery = {
  recipientPortal: "parent" | "teacher";
  recipientEmails: string[];
  recipientLabel: string;
  familyId?: string;
  staffUserId?: string;
  totalUnread: number;
  threads: Array<{
    senderName: string;
    unreadCount: number;
    preview: string;
  }>;
};
