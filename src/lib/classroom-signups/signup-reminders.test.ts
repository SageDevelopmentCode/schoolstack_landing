import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  familiesToRemind,
  reminderCooldownRemainingMs,
  sendClassroomSignupReminder,
  validateReminderMessage,
  SIGNUP_REMINDER_COOLDOWN_MS,
} from "./signup-reminders";
import { formatReminderRetryAfter } from "./signup-reminder-rules";
import type { ClassroomSignup, ClassroomSignupResponse } from "./types";

const admin = {} as SupabaseClient;

function signup(): ClassroomSignup {
  return {
    id: "signup-1",
    organizationId: "org-1",
    createdByStaffMemberId: "staff-1",
    teacherName: "Ms. Lee",
    title: "Reading buddies",
    description: "",
    signupType: "open_ended",
    audience: "classrooms",
    classroomId: null,
    classroomIds: ["room-1"],
    classroomName: "Oak Room",
    familyCount: 3,
    status: "open",
    responseDeadline: null,
    config: {},
    publishedAt: null,
    closedAt: null,
    createdAt: "2026-11-01T00:00:00Z",
    updatedAt: "2026-11-01T00:00:00Z",
  } as unknown as ClassroomSignup;
}

function response(familyId: string, status: "confirmed" | "cancelled" = "confirmed"): ClassroomSignupResponse {
  return { familyId, status } as unknown as ClassroomSignupResponse;
}

test("only families that haven't confirmed are reminded", () => {
  assert.deepEqual(
    familiesToRemind(["a", "b", "c", "b"], [response("a"), response("c", "cancelled")]),
    ["b", "c"],
  );
});

test("cooldown counts down from the last reminder", () => {
  const now = new Date("2026-11-16T12:00:00Z");
  assert.equal(reminderCooldownRemainingMs(null, now), 0);
  assert.equal(reminderCooldownRemainingMs("2026-11-16T10:00:00Z", now), 0);
  assert.equal(reminderCooldownRemainingMs("2026-11-16T11:30:00Z", now), SIGNUP_REMINDER_COOLDOWN_MS / 2);
  assert.equal(formatReminderRetryAfter(30 * 60 * 1000), "in 30 minutes");
  assert.equal(formatReminderRetryAfter(10_000), "in 1 minute");
});

test("message must have text and fit", () => {
  assert.equal(validateReminderMessage("  ").ok, false);
  assert.equal(validateReminderMessage("x".repeat(1001)).ok, false);
  assert.deepEqual(validateReminderMessage("  Please help! "), { ok: true, message: "Please help!" });
});

const baseInput = {
  organizationId: "org-1",
  signup: signup(),
  message: "Please sign up!",
  teacherName: "Ms. Lee",
  staffMemberId: "staff-1",
  actor: { userId: "user-1", email: "lee@example.com", name: "Ms. Lee" },
  now: new Date("2026-11-16T12:00:00Z"),
};

test("sends email + push to unresponded families and logs the activity", async () => {
  const emailed: string[] = [];
  const pushed: string[] = [];
  const logged: unknown[] = [];
  const result = await sendClassroomSignupReminder(
    admin,
    { ...baseInput, responses: [response("fam-a")] },
    {
      findLastReminderAt: async () => null,
      resolveAudienceFamilyIds: async () => ["fam-a", "fam-b", "fam-c"],
      loadOrganization: async () => ({ name: "Rooted Meadows", slug: "rooted" }),
      loadFamilyNotificationEmails: async (_admin, familyId) =>
        familyId === "fam-b" ? ["B@example.com", "shared@example.com"] : ["shared@example.com"],
      sendEmail: async (payload) => {
        emailed.push(payload.to);
        return { ok: payload.to !== "shared@example.com" };
      },
      resolvePushRecipients: async (_admin, familyIds) => {
        assert.deepEqual(familyIds, ["fam-b", "fam-c"]);
        return [{ userId: "guardian-b", portal: "parent", email: null }];
      },
      sendPush: async (_admin, payload) => {
        pushed.push(payload.userIds[0]);
        assert.equal(payload.notificationKind, "classroom_signup.reminder");
        assert.deepEqual(payload.data, { kind: "classroom_signup", portal: "parent", organizationSlug: "rooted", signupId: "signup-1" });
      },
      logActivity: async (_admin, event) => {
        logged.push(event.action);
        return null;
      },
      logSettledNotificationFailures: async () => {},
    },
  );

  assert.deepEqual(result, { status: "sent", familiesNotified: 2, emailsAttempted: 2, emailsSent: 1, pushRecipients: 1 });
  assert.deepEqual(emailed, ["b@example.com", "shared@example.com"]);
  assert.deepEqual(pushed, ["guardian-b"]);
  assert.deepEqual(logged, ["classroom_signup.reminder_sent"]);
});

test("refuses while the cooldown is running and sends nothing", async () => {
  let sent = false;
  const result = await sendClassroomSignupReminder(
    admin,
    { ...baseInput, responses: [] },
    {
      findLastReminderAt: async () => "2026-11-16T11:45:00Z",
      resolveAudienceFamilyIds: async () => {
        sent = true;
        return [];
      },
    },
  );
  assert.equal(result.status, "cooldown");
  assert.equal(result.status === "cooldown" ? result.retryAfterMs : 0, 45 * 60 * 1000);
  assert.equal(sent, false);
});

test("nobody to remind when every family already signed up", async () => {
  const result = await sendClassroomSignupReminder(
    admin,
    { ...baseInput, responses: [response("fam-a")] },
    {
      findLastReminderAt: async () => null,
      resolveAudienceFamilyIds: async () => ["fam-a"],
    },
  );
  assert.deepEqual(result, { status: "nobody_to_remind" });
});
