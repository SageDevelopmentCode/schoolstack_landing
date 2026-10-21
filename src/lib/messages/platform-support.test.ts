import assert from "node:assert/strict";
import test from "node:test";
import { buildAdminSectionedListItems } from "./admin-thread-sections";
import { resolveThreadProgramIdForContact, threadVisibleInProgramPortalInbox } from "./message-audience";
import { contactKeyForThread, participantsFromContact } from "./participants-from-contact";
import { validateParticipantSet } from "./participant-signature";
import {
  MUDKITCHEN_SUPPORT_PLACEHOLDER_ID,
  MUDKITCHEN_SUPPORT_TEAM_NAME,
  mudKitchenSupportPlaceholderThread,
  omitPlatformSupportThreads,
  pinMudKitchenSupportThread,
  shouldOmitPlatformSupportThreadForViewer,
  threadIsParentPlatformSupport,
  threadIsStaffPlatformSupport,
} from "./platform-support";
import type { MessageThreadSummary } from "./types";

function thread(
  id: string,
  participants: MessageThreadSummary["participants"],
  overrides: Partial<MessageThreadSummary> = {},
): MessageThreadSummary {
  return {
    id,
    subject: null,
    title: "Conversation",
    color: "#7FA888",
    lastMessagePreview: "Hello",
    lastMessageAt: "2026-10-20T12:00:00.000Z",
    lastMessageTimeLabel: "12:00 PM",
    unreadCount: 0,
    participants,
    ...overrides,
  };
}

const supportParticipants: MessageThreadSummary["participants"] = [
  {
    id: "p1",
    kind: "guardian",
    familyId: null,
    guardianId: "guardian-1",
    staffMemberId: null,
  },
  {
    id: "p2",
    kind: "platform_support",
    familyId: null,
    guardianId: null,
    staffMemberId: null,
  },
];

const staffSupportParticipants: MessageThreadSummary["participants"] = [
  {
    id: "s1",
    kind: "staff_member",
    familyId: null,
    guardianId: null,
    staffMemberId: "staff-1",
  },
  {
    id: "s2",
    kind: "platform_support",
    familyId: null,
    guardianId: null,
    staffMemberId: null,
  },
];

test("validateParticipantSet allows one guardian plus MudKitchen Support", () => {
  validateParticipantSet([
    { kind: "guardian", guardianId: "guardian-1" },
    { kind: "platform_support" },
  ]);
});

test("validateParticipantSet allows one staff member plus MudKitchen Support", () => {
  validateParticipantSet([
    { kind: "staff_member", staffMemberId: "staff-1" },
    { kind: "platform_support" },
  ]);
});

test("validateParticipantSet rejects support threads mixed with staff or the school office", () => {
  assert.throws(() =>
    validateParticipantSet([
      { kind: "guardian", guardianId: "guardian-1" },
      { kind: "platform_support" },
      { kind: "staff_member", staffMemberId: "staff-1" },
    ]),
  );
  assert.throws(() =>
    validateParticipantSet([
      { kind: "guardian", guardianId: "guardian-1" },
      { kind: "platform_support" },
      { kind: "school_office" },
    ]),
  );
});

test("support threads stay visible in the program portal and are not program-scoped", () => {
  assert.equal(
    resolveThreadProgramIdForContact({
      contactKind: "platform_support",
      portalProgramId: "program-1",
    }),
    null,
  );
  assert.equal(
    threadVisibleInProgramPortalInbox({
      threadProgramId: null,
      participants: [{ kind: "platform_support" }],
      programId: "program-1",
    }),
    true,
  );
});

test("parent contact key for a support thread does not collide with the school office", () => {
  assert.equal(
    contactKeyForThread(supportParticipants, "parent", { guardianId: "guardian-1" }),
    "platform_support",
  );
  assert.equal(
    contactKeyForThread(staffSupportParticipants, "teacher", { staffMemberId: "staff-1" }),
    "platform_support",
  );
  assert.deepEqual(
    participantsFromContact(
      { key: "platform_support", kind: "platform_support", name: MUDKITCHEN_SUPPORT_TEAM_NAME },
      { guardianId: "guardian-1" },
    ),
    [
      { kind: "guardian", guardianId: "guardian-1" },
      { kind: "platform_support" },
    ],
  );
  assert.deepEqual(
    participantsFromContact(
      { key: "platform_support", kind: "platform_support", name: MUDKITCHEN_SUPPORT_TEAM_NAME },
      { staffMemberId: "staff-1" },
    ),
    [
      { kind: "staff_member", staffMemberId: "staff-1" },
      { kind: "platform_support" },
    ],
  );
});

test("web parent list pins a real support thread and otherwise shows a local placeholder", () => {
  const office = thread("office", [
    {
      id: "o1",
      kind: "guardian",
      familyId: null,
      guardianId: "guardian-1",
      staffMemberId: null,
    },
    {
      id: "o2",
      kind: "school_office",
      familyId: null,
      guardianId: null,
      staffMemberId: null,
    },
  ]);
  const support = thread("support", supportParticipants, {
    title: MUDKITCHEN_SUPPORT_TEAM_NAME,
    lastMessageAt: "2026-01-01T00:00:00.000Z",
  });

  const pinned = pinMudKitchenSupportThread([office, support], null, {
    mode: "parent",
    guardianId: "guardian-1",
  });
  assert.equal(pinned[0]?.id, "support");
  assert.equal(pinned[1]?.id, "office");

  const placeholder = pinMudKitchenSupportThread([office], null, {
    mode: "parent",
    guardianId: "guardian-1",
  });
  assert.equal(placeholder[0]?.id, MUDKITCHEN_SUPPORT_PLACEHOLDER_ID);
  assert.equal(placeholder[0]?.title, MUDKITCHEN_SUPPORT_TEAM_NAME);
  assert.equal(placeholder[0]?.photoUrl, "/images/Logo.png");
  assert.equal(mudKitchenSupportPlaceholderThread().participants.length, 0);
});

test("teacher pin prefers the matching staff support thread over a parent support thread", () => {
  const parentSupport = thread("parent-support", supportParticipants, {
    title: MUDKITCHEN_SUPPORT_TEAM_NAME,
    lastMessageAt: "2026-02-01T00:00:00.000Z",
  });
  const staffSupport = thread("staff-support", staffSupportParticipants, {
    title: MUDKITCHEN_SUPPORT_TEAM_NAME,
    lastMessageAt: "2026-01-01T00:00:00.000Z",
  });

  const pinned = pinMudKitchenSupportThread(
    [parentSupport, staffSupport],
    null,
    { mode: "teacher", staffMemberId: "staff-1" },
  );
  assert.equal(pinned[0]?.id, "staff-support");
});

test("teacher list visibility hides parent support but keeps own staff support thread", () => {
  assert.equal(threadIsParentPlatformSupport(supportParticipants), true);
  assert.equal(threadIsStaffPlatformSupport(staffSupportParticipants, "staff-1"), true);
  assert.equal(
    shouldOmitPlatformSupportThreadForViewer(supportParticipants, "teacher", "staff-1"),
    true,
  );
  assert.equal(
    shouldOmitPlatformSupportThreadForViewer(staffSupportParticipants, "teacher", "staff-1"),
    false,
  );
});

test("school inbox helpers drop MudKitchen Support threads", () => {
  const office = thread("office", [
    {
      id: "o1",
      kind: "guardian",
      familyId: null,
      guardianId: "guardian-1",
      staffMemberId: null,
    },
    {
      id: "o2",
      kind: "school_office",
      familyId: null,
      guardianId: null,
      staffMemberId: null,
    },
  ]);
  const support = thread("support", supportParticipants);

  assert.deepEqual(
    omitPlatformSupportThreads([office, support]).map((item) => item.id),
    ["office"],
  );

  const items = buildAdminSectionedListItems([office, support]);
  assert.deepEqual(
    items.map((item) => (item.type === "thread" ? item.thread.id : item.label)),
    ["office"],
  );
});
