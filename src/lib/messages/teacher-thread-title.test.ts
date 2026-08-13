import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveTeacherFamilyThreadTitle,
  resolveThreadTitle,
  type ParticipantDisplayContext,
} from "./mappers";
import type { PortalMessageRow } from "./mappers";

function buildContext(
  overrides: Partial<ParticipantDisplayContext> = {},
): ParticipantDisplayContext {
  return {
    families: new Map([["family-1", { name: "Cecilia Family" }]]),
    staffMembers: new Map(),
    guardians: new Map([
      ["guardian-julius", { firstName: "Julius", lastName: "Cecilia" }],
      ["guardian-jane", { firstName: "Jane", lastName: "Cecilia" }],
    ]),
    familyPrimaryGuardianIds: new Map([["family-1", "guardian-julius"]]),
    familyFirstGuardianIds: new Map([["family-1", "guardian-julius"]]),
    familyEnrolledStudents: new Map([
      [
        "family-1",
        [
          {
            id: "student-julia",
            firstName: "Julia",
            lastName: "Cecilia",
            grade: "2",
            dateOfBirth: null,
            status: "active",
            familyId: "family-1",
            familyName: "Cecilia Family",
            primaryContactName: "Julius Cecilia",
            primaryContactEmail: null,
            programNames: [],
            enrolledAt: "2026-01-01",
            assignedTeacherId: "staff-1",
            assignedTeacherName: "Julius Staff",
            profilePhotoUrl: null,
          },
        ],
      ],
    ]),
    schoolOfficeLabel: "School Office",
    currentUserId: "user-1",
    ...overrides,
  };
}

function guardianMessage(
  guardianId: string,
  createdAt: string,
): PortalMessageRow {
  return {
    id: "msg-1",
    thread_id: "thread-1",
    organization_id: "org-1",
    body: "Yo!",
    sender_user_id: "user-parent",
    sender_kind: "guardian",
    sender_guardian_id: guardianId,
    sender_staff_member_id: null,
    created_at: createdAt,
  };
}

test("resolveTeacherFamilyThreadTitle prefers the messaging guardian from thread history", () => {
  const context = buildContext();
  const messages = [
    guardianMessage("guardian-julius", "2026-08-09T09:00:00.000Z"),
    {
      ...guardianMessage("guardian-jane", "2026-08-09T09:05:00.000Z"),
      sender_user_id: "user-parent-2",
    },
    {
      id: "msg-2",
      thread_id: "thread-1",
      organization_id: "org-1",
      body: "Thanks!",
      sender_user_id: "user-teacher",
      sender_kind: "staff_member" as const,
      sender_guardian_id: null,
      sender_staff_member_id: "staff-1",
      created_at: "2026-08-09T09:10:00.000Z",
    },
  ];

  assert.equal(
    resolveTeacherFamilyThreadTitle("family-1", context, messages.at(-1), messages),
    "Jane Cecilia",
  );
});

test("resolveTeacherFamilyThreadTitle falls back to primary guardian when no guardian messages exist", () => {
  const context = buildContext();

  assert.equal(
    resolveTeacherFamilyThreadTitle("family-1", context),
    "Julius Cecilia",
  );
});

test("resolveThreadTitle uses guardian name for admin family-staff threads", () => {
  const context = buildContext({
    staffMembers: new Map([
      [
        "staff-1",
        {
          firstName: "Julius",
          lastName: "Staff",
          roleTitle: "Primary Staff",
        },
      ],
    ]),
  });

  const display = resolveThreadTitle(
    [
      {
        id: "participant-family",
        kind: "family",
        familyId: "family-1",
        staffMemberId: null,
      },
      {
        id: "participant-staff",
        kind: "staff_member",
        familyId: null,
        staffMemberId: "staff-1",
      },
    ],
    context,
    "admin",
  );

  assert.equal(display.title, "Julius Cecilia, Julius Staff");
  assert.equal(display.subtitle, undefined);
  assert.equal(display.listAvatars?.length, 2);
  assert.equal(display.listAvatars?.[0]?.name, "Julius Cecilia");
  assert.equal(display.listAvatars?.[1]?.name, "Julius Staff");
  assert.notEqual(display.title, "Cecilia Family");
});
