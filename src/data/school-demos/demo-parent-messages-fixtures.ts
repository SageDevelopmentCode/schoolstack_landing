import type { MessagesInboxData, PortalMessage } from "@/lib/messages/types";
import { DEMO_PARENT_GUARDIAN_ID } from "@/data/school-demos/demo-parent-portal-fixtures";

/*
 * Parent-side inbox for the marketing parent demo (Sarah Mitchell). Read-only:
 * `MessagesInboxLayout readOnly` serves these threads and messages without
 * calling the messages API.
 */

const SARAH = "Sarah Mitchell";

function msg(
  threadId: string,
  index: number,
  body: string,
  sender: { name: string; kind: PortalMessage["senderKind"]; own?: boolean },
  createdAt: string,
  timeLabel: string,
): PortalMessage {
  return {
    id: `${threadId}-msg-${index}`,
    threadId,
    body,
    senderUserId: sender.own ? DEMO_PARENT_GUARDIAN_ID : `${threadId}-sender-${sender.name}`,
    senderKind: sender.kind,
    senderName: sender.name,
    isOwn: Boolean(sender.own),
    createdAt,
    timeLabel,
    editedAt: null,
    deletedAt: null,
    attachments: [],
  };
}

const RIVERA = { name: "Ms. Rivera", kind: "staff_member" as const };
const PATEL = { name: "Mr. Patel", kind: "staff_member" as const };
const OFFICE = { name: "Luff Learning Office", kind: "org_admin" as const };
const ME = { name: SARAH, kind: "guardian" as const, own: true };

export function buildDemoParentMessagesInbox(): MessagesInboxData {
  return {
    threads: [
      {
        id: "parent-thread-rivera",
        subject: null,
        title: "Ms. Rivera",
        subtitle: "Oak Room · Emma's teacher",
        subtitleStudents: [{ id: "child-emma", name: "Emma Mitchell" }],
        color: "#769a61",
        lastMessagePreview: "Emma's watercolor is going in the spring showcase! 🎨",
        lastMessageAt: "2026-11-21T15:20:00.000Z",
        lastMessageTimeLabel: "3:20 PM",
        unreadCount: 1,
        participants: [
          { id: "p-rivera", kind: "staff_member", familyId: null, guardianId: null, staffMemberId: "staff-rivera" },
        ],
      },
      {
        id: "parent-thread-patel",
        subject: null,
        title: "Mr. Patel",
        subtitle: "Maple Room · Jake's teacher",
        subtitleStudents: [{ id: "child-jake", name: "Jake Mitchell" }],
        color: "#8EBDCB",
        lastMessagePreview: "Thanks! I'll pack his rain boots for Monday.",
        lastMessageAt: "2026-11-20T17:05:00.000Z",
        lastMessageTimeLabel: "Yesterday",
        unreadCount: 0,
        participants: [
          { id: "p-patel", kind: "staff_member", familyId: null, guardianId: null, staffMemberId: "staff-patel" },
        ],
      },
      {
        id: "parent-thread-office",
        subject: "October tuition",
        title: "Luff Learning Office",
        subtitle: "School office",
        color: "#A9667C",
        lastMessagePreview: "Your October autopay went through. Receipt is in Tuition & Billing.",
        lastMessageAt: "2026-11-18T14:00:00.000Z",
        lastMessageTimeLabel: "Wed",
        unreadCount: 0,
        participants: [
          { id: "p-office", kind: "school_office", familyId: null, guardianId: null, staffMemberId: null },
        ],
      },
      {
        id: "parent-thread-oak-families",
        subject: "Botanical garden field trip",
        title: "Oak Room families",
        subtitle: "Group · 12 families",
        color: "#C4A484",
        lastMessagePreview: "Ms. Rivera: Chaperones, meet at the front gate at 8:45.",
        lastMessageAt: "2026-11-17T19:30:00.000Z",
        lastMessageTimeLabel: "Tue",
        unreadCount: 0,
        participants: [
          { id: "p-rivera-group", kind: "staff_member", familyId: null, guardianId: null, staffMemberId: "staff-rivera" },
        ],
      },
    ],
    contacts: [],
    viewerContext: {},
  };
}

export function buildDemoParentMessageThreadDetails(): Record<string, PortalMessage[]> {
  return {
    "parent-thread-rivera": [
      msg("parent-thread-rivera", 1, "Hi Sarah! Quick note: Emma spent the whole afternoon on a watercolor of the school garden. She was so focused.", RIVERA, "2026-11-21T14:40:00.000Z", "2:40 PM"),
      msg("parent-thread-rivera", 2, "That's wonderful, thank you for telling me! She's been talking about the garden all week.", ME, "2026-11-21T15:02:00.000Z", "3:02 PM"),
      msg("parent-thread-rivera", 3, "Emma's watercolor is going in the spring showcase! 🎨", RIVERA, "2026-11-21T15:20:00.000Z", "3:20 PM"),
    ],
    "parent-thread-patel": [
      msg("parent-thread-patel", 1, "Heads up: Monday is our creek walk, so Jake will need rain boots and a change of socks.", PATEL, "2026-11-20T16:30:00.000Z", "4:30 PM"),
      msg("parent-thread-patel", 2, "Thanks! I'll pack his rain boots for Monday.", ME, "2026-11-20T17:05:00.000Z", "5:05 PM"),
    ],
    "parent-thread-office": [
      msg("parent-thread-office", 1, "Hi Sarah, your October autopay went through. Receipt is in Tuition & Billing.", OFFICE, "2026-11-18T14:00:00.000Z", "2:00 PM"),
    ],
    "parent-thread-oak-families": [
      msg("parent-thread-oak-families", 1, "Hi Oak Room families! The botanical garden trip is Saturday, May 9. Please sign the permission form in Forms & Documents.", RIVERA, "2026-11-17T18:00:00.000Z", "6:00 PM"),
      msg("parent-thread-oak-families", 2, "Happy to chaperone if you still need one!", ME, "2026-11-17T18:40:00.000Z", "6:40 PM"),
      msg("parent-thread-oak-families", 3, "Chaperones, meet at the front gate at 8:45.", RIVERA, "2026-11-17T19:30:00.000Z", "7:30 PM"),
    ],
  };
}
