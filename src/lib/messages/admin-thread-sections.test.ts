import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAdminSectionedListItems,
  getAdminThreadSection,
} from "./admin-thread-sections";
import type { MessageThreadSummary } from "./types";

function buildThread(
  participants: MessageThreadSummary["participants"],
  overrides: Partial<MessageThreadSummary> = {},
): MessageThreadSummary {
  return {
    id: "thread-1",
    subject: null,
    title: "Julius Cecilia",
    color: "#7FA888",
    lastMessagePreview: "Yo!",
    lastMessageAt: "2026-08-09T09:26:00.000Z",
    lastMessageTimeLabel: "9:26 AM",
    unreadCount: 0,
    participants,
    ...overrides,
  };
}

test("getAdminThreadSection classifies guardian-staff and guardian-office threads", () => {
  const guardianStaff = buildThread([
    { id: "p1", kind: "guardian", familyId: null, guardianId: "guardian-1", staffMemberId: null },
    { id: "p2", kind: "staff_member", familyId: null, guardianId: null, staffMemberId: "staff-1" },
  ]);
  const guardianOffice = buildThread([
    { id: "p3", kind: "guardian", familyId: null, guardianId: "guardian-1", staffMemberId: null },
    { id: "p4", kind: "school_office", familyId: null, guardianId: null, staffMemberId: null },
  ]);

  assert.equal(getAdminThreadSection(guardianStaff), "guardian_staff");
  assert.equal(getAdminThreadSection(guardianOffice), "guardian_office");
});

test("buildAdminSectionedListItems groups threads under section headers", () => {
  const guardianStaff = buildThread(
    [
      { id: "p1", kind: "guardian", familyId: null, guardianId: "guardian-1", staffMemberId: null },
      { id: "p2", kind: "staff_member", familyId: null, guardianId: null, staffMemberId: "staff-1" },
    ],
    { id: "thread-staff", lastMessageAt: "2026-08-09T10:00:00.000Z" },
  );
  const guardianOffice = buildThread(
    [
      { id: "p3", kind: "guardian", familyId: null, guardianId: "guardian-1", staffMemberId: null },
      { id: "p4", kind: "school_office", familyId: null, guardianId: null, staffMemberId: null },
    ],
    { id: "thread-office", lastMessageAt: "2026-08-09T09:00:00.000Z" },
  );

  const items = buildAdminSectionedListItems([guardianOffice, guardianStaff]);

  assert.deepEqual(
    items.map((item) => (item.type === "section" ? item.label : item.thread.id)),
    [
      "thread-office",
      "Parent & teacher conversations",
      "thread-staff",
    ],
  );

  const sectionItem = items.find((item) => item.type === "section");
  assert.equal(
    sectionItem?.type === "section" && sectionItem.description,
    "For your review — messages between families and staff, not your school office inbox.",
  );
});
