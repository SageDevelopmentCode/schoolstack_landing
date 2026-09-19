import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  sendTeacherParentFormPublishedNotifications,
  sendTeacherParentFormResponseSignedNotification,
} from "./teacher-parent-form-notifications";
import type { TeacherParentForm } from "./types";

const baseForm: TeacherParentForm = {
  id: "form-1",
  title: "Field Trip Permission Slip",
  description: "",
  formType: "builder",
  status: "active",
  classroomIds: ["classroom-1"],
  classroomNames: ["Grade 1"],
  dueDate: "2026-09-30",
  requireSignature: true,
  totalFamilies: 1,
  signedFamilies: 0,
  createdAt: "2026-09-16T00:00:00.000Z",
  updatedAt: "2026-09-16T00:00:00.000Z",
};

const publishedInput = {
  organizationId: "org-1",
  form: baseForm,
  publisherName: "Ms. Taylor Reyes",
  staffMemberId: "staff-1",
  actorUserId: "user-1",
  actorName: "Ms. Taylor Reyes",
  actorEmail: "taylor@example.com",
};

const signedInput = {
  organizationId: "org-1",
  formId: "form-1",
  formTitle: "Field Trip Permission Slip",
  staffMemberId: "staff-1",
  familyId: "family-1",
  familyName: "Sparhawk Family",
  actorUserId: "parent-user-1",
  actorName: "Maria Lopez",
  actorEmail: "maria@example.com",
};

describe("sendTeacherParentFormPublishedNotifications", () => {
  it("sends email to all family notification emails", async () => {
    const sentTo: string[] = [];

    await sendTeacherParentFormPublishedNotifications(
      {} as SupabaseClient,
      publishedInput,
      {
        resolveFormAudienceFamilies: async () => [
          {
            familyId: "family-1",
            studentIds: ["student-1"],
            studentNames: ["Olivia Sparhawk"],
          },
        ],
        loadOrganizationContext: async () => ({
          schoolName: "Rooted Meadows",
          schoolSlug: "rooted-meadows",
        }),
        loadFamilyNotificationEmails: async () => [
          "parent@example.com",
          "spouse@example.com",
        ],
        sendPublishedEmail: async ({ to }) => {
          sentTo.push(to);
          return { ok: true };
        },
        logSettledNotificationFailures: async () => {},
      },
    );

    assert.deepEqual(sentTo, ["parent@example.com", "spouse@example.com"]);
  });

  it("skips email when a family has no notification emails", async () => {
    const sentTo: string[] = [];

    await sendTeacherParentFormPublishedNotifications(
      {} as SupabaseClient,
      publishedInput,
      {
        resolveFormAudienceFamilies: async () => [
          {
            familyId: "family-1",
            studentIds: ["student-1"],
            studentNames: ["Olivia Sparhawk"],
          },
          {
            familyId: "family-2",
            studentIds: ["student-2"],
            studentNames: ["Noah Sparhawk"],
          },
        ],
        loadOrganizationContext: async () => ({
          schoolName: "Rooted Meadows",
          schoolSlug: "rooted-meadows",
        }),
        loadFamilyNotificationEmails: async (_admin, familyId) =>
          familyId === "family-1" ? ["parent@example.com"] : [],
        sendPublishedEmail: async ({ to }) => {
          sentTo.push(to);
          return { ok: true };
        },
        logSettledNotificationFailures: async () => {},
      },
    );

    assert.deepEqual(sentTo, ["parent@example.com"]);
  });

  it("logs settled email failures without throwing", async () => {
    const loggedOperations: string[] = [];

    await sendTeacherParentFormPublishedNotifications(
      {} as SupabaseClient,
      publishedInput,
      {
        resolveFormAudienceFamilies: async () => [
          {
            familyId: "family-1",
            studentIds: ["student-1"],
            studentNames: ["Olivia Sparhawk"],
          },
        ],
        loadOrganizationContext: async () => ({
          schoolName: "Rooted Meadows",
          schoolSlug: "rooted-meadows",
        }),
        loadFamilyNotificationEmails: async () => ["parent@example.com"],
        sendPublishedEmail: async () => {
          throw new Error("smtp down");
        },
        logSettledNotificationFailures: async (_admin, input) => {
          loggedOperations.push(input.operation);
        },
      },
    );

    assert.deepEqual(loggedOperations, ["teacher_parent_form_published_email"]);
  });
});

describe("sendTeacherParentFormResponseSignedNotification", () => {
  it("sends email to the form creator", async () => {
    const sentTo: string[] = [];

    await sendTeacherParentFormResponseSignedNotification(
      {} as SupabaseClient,
      signedInput,
      {
        loadOrganizationContext: async () => ({
          schoolName: "Rooted Meadows",
          schoolSlug: "rooted-meadows",
        }),
        loadStaffNotificationEmail: async () => "taylor@example.com",
        sendSignedEmail: async ({ to }) => {
          sentTo.push(to);
          return { ok: true };
        },
        logSettledNotificationFailures: async () => {},
      },
    );

    assert.deepEqual(sentTo, ["taylor@example.com"]);
  });

  it("skips email when the form creator has no email", async () => {
    const sentTo: string[] = [];

    await sendTeacherParentFormResponseSignedNotification(
      {} as SupabaseClient,
      signedInput,
      {
        loadOrganizationContext: async () => ({
          schoolName: "Rooted Meadows",
          schoolSlug: "rooted-meadows",
        }),
        loadStaffNotificationEmail: async () => null,
        sendSignedEmail: async ({ to }) => {
          sentTo.push(to);
          return { ok: true };
        },
        logSettledNotificationFailures: async () => {},
      },
    );

    assert.deepEqual(sentTo, []);
  });

  it("logs settled email failures without throwing", async () => {
    const loggedOperations: string[] = [];

    await sendTeacherParentFormResponseSignedNotification(
      {} as SupabaseClient,
      signedInput,
      {
        loadOrganizationContext: async () => ({
          schoolName: "Rooted Meadows",
          schoolSlug: "rooted-meadows",
        }),
        loadStaffNotificationEmail: async () => "taylor@example.com",
        sendSignedEmail: async () => {
          throw new Error("smtp down");
        },
        logSettledNotificationFailures: async (_admin, input) => {
          loggedOperations.push(input.operation);
        },
      },
    );

    assert.deepEqual(loggedOperations, [
      "teacher_parent_form_response_signed_email",
    ]);
  });
});
