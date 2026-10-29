import type { ExpoPushChannelId } from "@/lib/notifications/expo-push";

export const MOBILE_PUSH_NOTIFICATION_KINDS = [
  "message.new",
  "committee.join_request_admin",
  "committee.join_approved",
  "committee.task_assigned",
  "committee.message_posted",
  "committee.workspace_resource",
  "committee.workspace_event",
  "committee.workspace_task",
  "bulletin.published",
  "gallery.photos_uploaded",
  "attendance.present",
  "attendance.pickup",
] as const;

export type MobilePushNotificationKind =
  (typeof MOBILE_PUSH_NOTIFICATION_KINDS)[number];

export type MobilePushCatalogEntry = {
  kind: MobilePushNotificationKind;
  label: string;
  description: string;
  channel: ExpoPushChannelId;
  /** Who typically receives this push (recipient_portal values). */
  recipientPortals: ("parent" | "teacher" | "admin")[];
};

export const MOBILE_PUSH_CATALOG: MobilePushCatalogEntry[] = [
  {
    kind: "message.new",
    label: "New message",
    description:
      "Sent when someone posts in a portal message thread. Opens the thread in the MudKitchen mobile app (payload kind: message).",
    channel: "messages",
    recipientPortals: ["parent", "teacher", "admin"],
  },
  {
    kind: "committee.join_request_admin",
    label: "Committee join request (admins)",
    description:
      "Notifies school admins on the committee notification channel when someone requests to join a committee. Opens the committees list with join-request intent (payload kind: committee, intent: join_request).",
    channel: "committees",
    recipientPortals: ["admin"],
  },
  {
    kind: "committee.join_approved",
    label: "Committee join approved",
    description:
      "Sent to the requester when a join request is approved. Opens the committee workspace home section (payload kind: committee).",
    channel: "committees",
    recipientPortals: ["parent", "teacher"],
  },
  {
    kind: "committee.task_assigned",
    label: "Committee task assigned",
    description:
      "Sent when a committee task is assigned to a member. Opens the committee tasks section (payload kind: committee).",
    channel: "committees",
    recipientPortals: ["parent", "teacher", "admin"],
  },
  {
    kind: "committee.message_posted",
    label: "Committee message",
    description:
      "Sent to other committee members when someone posts in committee messages. Opens the committee messages section (payload kind: committee).",
    channel: "committees",
    recipientPortals: ["parent", "teacher", "admin"],
  },
  {
    kind: "committee.workspace_resource",
    label: "Committee new resource",
    description:
      "Sent when a resource is added to a committee workspace. Opens the resources section (payload kind: committee).",
    channel: "committees",
    recipientPortals: ["parent", "teacher", "admin"],
  },
  {
    kind: "committee.workspace_event",
    label: "Committee new calendar event",
    description:
      "Sent when a calendar event is added to a committee workspace. Opens the calendar section (payload kind: committee).",
    channel: "committees",
    recipientPortals: ["parent", "teacher", "admin"],
  },
  {
    kind: "committee.workspace_task",
    label: "Committee new task (workspace)",
    description:
      "Sent when a new task is added to a committee workspace (not the same as task assigned). Opens the tasks section (payload kind: committee).",
    channel: "committees",
    recipientPortals: ["parent", "teacher", "admin"],
  },
  {
    kind: "bulletin.published",
    label: "Bulletin post published",
    description:
      "Sent when the school publishes a bulletin post to the configured audience (parents and/or staff). Opens the bulletin post in the mobile app (payload kind: bulletin).",
    channel: "bulletin",
    recipientPortals: ["parent", "teacher"],
  },
  {
    kind: "gallery.photos_uploaded",
    label: "School photos uploaded",
    description:
      "Sent to enrolled families when staff upload photos to the school gallery (web or mobile). Opens the Photos area in the parent mobile app (payload kind: gallery).",
    channel: "gallery",
    recipientPortals: ["parent"],
  },
  {
    kind: "attendance.present",
    label: "Child marked present",
    description:
      "Sent to linked guardians when a teacher or admin marks the child present for the day. Opens attendance in the parent mobile app (payload kind: attendance, intent: present).",
    channel: "attendance",
    recipientPortals: ["parent"],
  },
  {
    kind: "attendance.pickup",
    label: "Child picked up",
    description:
      "Sent to linked guardians when pickup is recorded for a present student. Opens attendance in the parent mobile app (payload kind: attendance, intent: pickup).",
    channel: "attendance",
    recipientPortals: ["parent"],
  },
];

const CATALOG_BY_KIND = new Map(
  MOBILE_PUSH_CATALOG.map((entry) => [entry.kind, entry]),
);

export function isMobilePushNotificationKind(
  value: string,
): value is MobilePushNotificationKind {
  return (MOBILE_PUSH_NOTIFICATION_KINDS as readonly string[]).includes(value);
}

export function getMobilePushCatalogEntry(
  kind: MobilePushNotificationKind,
): MobilePushCatalogEntry {
  const entry = CATALOG_BY_KIND.get(kind);
  if (!entry) {
    throw new Error(`Unknown mobile push notification kind: ${kind}`);
  }
  return entry;
}

export function recipientPortalsLabel(
  portals: MobilePushCatalogEntry["recipientPortals"],
): string {
  const labels: Record<(typeof portals)[number], string> = {
    parent: "Parent",
    teacher: "Teacher",
    admin: "School admin",
  };
  return portals.map((portal) => labels[portal]).join(", ");
}
