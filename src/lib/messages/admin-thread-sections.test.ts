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

test("getAdminThreadSection classifies family-staff and family-office threads", () => {
  const familyStaff = buildThread([
    { id: "p1", kind: "family", familyId: "family-1", staffMemberId: null },
    { id: "p2", kind: "staff_member", familyId: null, staffMemberId: "staff-1" },
  ]);
  const familyOffice = buildThread([
    { id: "p3", kind: "family", familyId: "family-1", staffMemberId: null },
    { id: "p4", kind: "school_office", familyId: null, staffMemberId: null },
  ]);

  assert.equal(getAdminThreadSection(familyStaff), "family_staff");
  assert.equal(getAdminThreadSection(familyOffice), "family_office");
});

test("buildAdminSectionedListItems groups threads under section headers", () => {
  const familyStaff = buildThread(
    [
      { id: "p1", kind: "family", familyId: "family-1", staffMemberId: null },
      { id: "p2", kind: "staff_member", familyId: null, staffMemberId: "staff-1" },
    ],
    { id: "thread-staff", lastMessageAt: "2026-08-09T10:00:00.000Z" },
  );
  const familyOffice = buildThread(
    [
      { id: "p3", kind: "family", familyId: "family-1", staffMemberId: null },
      { id: "p4", kind: "school_office", familyId: null, staffMemberId: null },
    ],
    { id: "thread-office", lastMessageAt: "2026-08-09T09:00:00.000Z" },
  );

  const items = buildAdminSectionedListItems([familyOffice, familyStaff]);

  assert.deepEqual(
    items.map((item) => (item.type === "section" ? item.label : item.thread.id)),
    [
      "thread-office",
      "Family & teachers",
      "thread-staff",
    ],
  );
});
