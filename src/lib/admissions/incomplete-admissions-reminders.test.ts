import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isEligibleForIncompleteAdmissionsReminder,
  sendIncompleteAdmissionsReminders,
  type IncompleteAdmissionsFamilyWork,
} from "./incomplete-admissions-reminders";

describe("isEligibleForIncompleteAdmissionsReminder", () => {
  const now = new Date("2026-09-16T12:00:00.000Z");

  it("returns true for the first reminder after 72 hours of inactivity", () => {
    assert.equal(
      isEligibleForIncompleteAdmissionsReminder({
        count: 0,
        lastSentAt: null,
        lastActivityAt: "2026-09-12T12:00:00.000Z",
        now,
      }),
      true,
    );
  });

  it("returns false for the first reminder before 72 hours of inactivity", () => {
    assert.equal(
      isEligibleForIncompleteAdmissionsReminder({
        count: 0,
        lastSentAt: null,
        lastActivityAt: "2026-09-15T12:00:00.000Z",
        now,
      }),
      false,
    );
  });

  it("returns true for the second reminder after 7 days and 72 hours of inactivity", () => {
    assert.equal(
      isEligibleForIncompleteAdmissionsReminder({
        count: 1,
        lastSentAt: "2026-09-08T12:00:00.000Z",
        lastActivityAt: "2026-09-01T12:00:00.000Z",
        now,
      }),
      true,
    );
  });

  it("returns false for the second reminder when the family was active within 72 hours", () => {
    assert.equal(
      isEligibleForIncompleteAdmissionsReminder({
        count: 1,
        lastSentAt: "2026-09-08T12:00:00.000Z",
        lastActivityAt: "2026-09-15T12:00:00.000Z",
        now,
      }),
      false,
    );
  });

  it("returns false for the second reminder before 7 days since the first send", () => {
    assert.equal(
      isEligibleForIncompleteAdmissionsReminder({
        count: 1,
        lastSentAt: "2026-09-12T12:00:00.000Z",
        lastActivityAt: "2026-09-01T12:00:00.000Z",
        now,
      }),
      false,
    );
  });

  it("returns false once the family has received two reminders", () => {
    assert.equal(
      isEligibleForIncompleteAdmissionsReminder({
        count: 2,
        lastSentAt: "2026-09-08T12:00:00.000Z",
        lastActivityAt: "2026-09-01T12:00:00.000Z",
        now,
      }),
      false,
    );
  });
});

function createIncompleteReminderSupabase(options: {
  families: Array<Record<string, unknown>>;
  contactApplication?: Record<string, unknown> | null;
  onFamilyUpdate?: (familyId: string, patch: Record<string, unknown>) => void;
  staleReminderCounts?: Record<string, number>;
}) {
  const familyMap = new Map(
    options.families.map((family) => [String(family.id), family]),
  );

  return {
    from(table: string) {
      if (table === "organizations") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { name: "Rooted Meadows", slug: "rooted-meadows" },
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === "applications") {
        return {
          select: () => ({
            eq: (column: string) => {
              const contactQuery = {
                eq: () => ({
                  in: () => ({
                    limit: () => ({
                      maybeSingle: async () => ({
                        data: options.contactApplication ?? null,
                        error: null,
                      }),
                    }),
                  }),
                }),
              };

              if (column === "organization_id" || column === "family_id") {
                return contactQuery;
              }

              throw new Error(`Unexpected applications.eq column: ${column}`);
            },
          }),
        };
      }

      if (table === "families") {
        return {
          select: () => ({
            eq: (column: string, value: string) => {
              if (column === "organization_id") {
                return {
                  gt: async () => ({
                    data: options.families.filter(
                      (family) =>
                        Number(family.incomplete_admissions_reminder_count ?? 0) > 0,
                    ),
                    error: null,
                  }),
                };
              }

              if (column === "id") {
                return {
                  eq: () => ({
                    maybeSingle: async () => {
                      const family = familyMap.get(value);
                      if (!family) {
                        return { data: null, error: null };
                      }

                      const staleCount = options.staleReminderCounts?.[value];
                      if (staleCount === undefined) {
                        return { data: family, error: null };
                      }

                      return {
                        data: {
                          ...family,
                          incomplete_admissions_reminder_count: staleCount,
                        },
                        error: null,
                      };
                    },
                  }),
                };
              }

              throw new Error(`Unexpected families.eq column: ${column}`);
            },
          }),
          update: (patch: Record<string, unknown>) => {
            let familyId = "";

            const applyUpdate = (currentCount?: number) => {
              const family = familyMap.get(familyId);
              if (!family) {
                return { data: [], error: null };
              }

              if (
                currentCount !== undefined &&
                Number(family.incomplete_admissions_reminder_count) !== currentCount
              ) {
                return { data: [], error: null };
              }

              Object.assign(family, patch);
              options.onFamilyUpdate?.(familyId, patch);
              return { data: [{ id: familyId }], error: null };
            };

            const createCountFilter = () => ({
              eq: (countColumn: string, currentCount: number) => {
                if (countColumn !== "incomplete_admissions_reminder_count") {
                  throw new Error(`Unexpected count column: ${countColumn}`);
                }

                const result = applyUpdate(currentCount);
                return {
                  select: async () => result,
                  then: (
                    onFulfilled: (value: { data: Array<{ id: string }>; error: null }) => unknown,
                    onRejected?: (reason: unknown) => unknown,
                  ) => Promise.resolve(result).then(onFulfilled, onRejected),
                  catch: (onRejected: (reason: unknown) => unknown) =>
                    Promise.resolve(result).catch(onRejected),
                };
              },
              then: (
                onFulfilled: (value: { data: Array<{ id: string }>; error: null }) => unknown,
                onRejected?: (reason: unknown) => unknown,
              ) => Promise.resolve(applyUpdate()).then(onFulfilled, onRejected),
              catch: (onRejected: (reason: unknown) => unknown) =>
                Promise.resolve(applyUpdate()).catch(onRejected),
            });

            return {
              eq: (column: string, value: string) => {
                if (column === "id") {
                  familyId = value;
                  return {
                    eq: () => createCountFilter(),
                  };
                }

                throw new Error(`Unexpected families.update.eq column: ${column}`);
              },
            };
          },
        };
      }

      if (table === "guardians") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  first_name: "Maria",
                  last_name: "Lopez",
                  email: "maria@example.com",
                },
                error: null,
              }),
            }),
          }),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
    auth: {
      admin: {
        getUserById: async () => ({ data: { user: null }, error: null }),
      },
    },
  };
}

const familyWork = new Map<string, IncompleteAdmissionsFamilyWork>([
  [
    "family-1",
    {
      familyId: "family-1",
      draftApplications: [
        {
          id: "app-1",
          formTitle: "2026 Application",
          updatedAt: "2026-09-10T12:00:00.000Z",
          applyUrl: "https://example.com/school/rooted-meadows/apply",
        },
      ],
      incompleteEnrollments: [],
    },
  ],
]);

describe("sendIncompleteAdmissionsReminders", () => {
  it("sends one reminder and increments the family reminder count", async () => {
    const familyUpdates: Array<{ familyId: string; patch: Record<string, unknown> }> =
      [];
    const sentTo: string[] = [];
    const discordPayloads: Array<Record<string, unknown>> = [];
    const now = new Date("2026-09-16T12:00:00.000Z");

    const families = [
      {
        id: "family-1",
        incomplete_admissions_reminder_count: 0,
        incomplete_admissions_reminder_sent_at: null,
      },
    ];

    const supabase = createIncompleteReminderSupabase({
      families,
      contactApplication: {
        primary_guardian_id: "guardian-1",
        created_by_user_id: null,
      },
      onFamilyUpdate: (familyId, patch) => {
        familyUpdates.push({ familyId, patch });
      },
    });

    const sent = await sendIncompleteAdmissionsReminders(supabase as never, "org-1", {
      now,
      isIncompleteAdmissionsRemindersEnabled: async () => true,
      sendEmail: async ({ to }) => {
        sentTo.push(to);
        return { ok: true };
      },
      notifyDiscord: async (payload) => {
        discordPayloads.push(payload);
      },
      resolveApplicationNotificationEmails: async () => ["admissions@rootedmeadows.com"],
      loadFamilyNotificationEmails: async () => ["maria@example.com"],
      resolveApplicantContact: async () => ({
        email: "maria@example.com",
        emails: ["maria@example.com"],
        displayName: "Maria Lopez",
      }),
      loadIncompleteAdmissionsWork: async () => familyWork,
    });

    assert.equal(sent, 1);
    assert.deepEqual(sentTo, ["maria@example.com"]);
    assert.equal(familyUpdates.length, 1);
    assert.equal(familyUpdates[0]?.patch.incomplete_admissions_reminder_count, 1);
    assert.equal(
      familyUpdates[0]?.patch.incomplete_admissions_reminder_sent_at,
      now.toISOString(),
    );
    assert.equal(discordPayloads.length, 1);
    assert.equal(discordPayloads[0]?.familyId, "family-1");
    assert.equal(discordPayloads[0]?.reminderNumber, 1);
    assert.deepEqual(discordPayloads[0]?.draftApplicationTitles, [
      "2026 Application",
    ]);
    assert.deepEqual(discordPayloads[0]?.incompleteEnrollmentItems, []);
  });

  it("returns 0 when org reminders are disabled", async () => {
    const sentTo: string[] = [];
    const now = new Date("2026-09-16T12:00:00.000Z");

    const supabase = createIncompleteReminderSupabase({
      families: [
        {
          id: "family-1",
          incomplete_admissions_reminder_count: 0,
          incomplete_admissions_reminder_sent_at: null,
        },
      ],
    });

    const sent = await sendIncompleteAdmissionsReminders(supabase as never, "org-1", {
      now,
      isIncompleteAdmissionsRemindersEnabled: async () => false,
      sendEmail: async ({ to }) => {
        sentTo.push(to);
        return { ok: true };
      },
      notifyDiscord: async () => {},
      loadIncompleteAdmissionsWork: async () => familyWork,
    });

    assert.equal(sent, 0);
    assert.deepEqual(sentTo, []);
  });

  it("skips send when the optimistic claim updates zero rows", async () => {
    const sentTo: string[] = [];
    const now = new Date("2026-09-16T12:00:00.000Z");

    const families = [
      {
        id: "family-1",
        incomplete_admissions_reminder_count: 1,
        incomplete_admissions_reminder_sent_at: "2026-09-08T12:00:00.000Z",
      },
    ];

    const supabase = createIncompleteReminderSupabase({
      families,
      staleReminderCounts: { "family-1": 0 },
      contactApplication: {
        primary_guardian_id: "guardian-1",
        created_by_user_id: null,
      },
    });

    const sent = await sendIncompleteAdmissionsReminders(supabase as never, "org-1", {
      now,
      isIncompleteAdmissionsRemindersEnabled: async () => true,
      sendEmail: async ({ to }) => {
        sentTo.push(to);
        return { ok: true };
      },
      notifyDiscord: async () => {},
      resolveApplicationNotificationEmails: async () => ["admissions@rootedmeadows.com"],
      loadFamilyNotificationEmails: async () => ["maria@example.com"],
      resolveApplicantContact: async () => ({
        email: "maria@example.com",
        emails: ["maria@example.com"],
        displayName: "Maria Lopez",
      }),
      loadIncompleteAdmissionsWork: async () => familyWork,
    });

    assert.equal(sent, 0);
    assert.deepEqual(sentTo, []);
    assert.equal(families[0]?.incomplete_admissions_reminder_count, 1);
  });

  it("reverts the claim when all reminder emails fail to send", async () => {
    const familyUpdates: Array<{ familyId: string; patch: Record<string, unknown> }> =
      [];
    const now = new Date("2026-09-16T12:00:00.000Z");

    const families = [
      {
        id: "family-1",
        incomplete_admissions_reminder_count: 0,
        incomplete_admissions_reminder_sent_at: null,
      },
    ];

    const supabase = createIncompleteReminderSupabase({
      families,
      contactApplication: {
        primary_guardian_id: "guardian-1",
        created_by_user_id: null,
      },
      onFamilyUpdate: (familyId, patch) => {
        familyUpdates.push({ familyId, patch });
      },
    });

    const sent = await sendIncompleteAdmissionsReminders(supabase as never, "org-1", {
      now,
      isIncompleteAdmissionsRemindersEnabled: async () => true,
      sendEmail: async () => ({ ok: false }),
      notifyDiscord: async () => {},
      resolveApplicationNotificationEmails: async () => ["admissions@rootedmeadows.com"],
      loadFamilyNotificationEmails: async () => ["maria@example.com"],
      resolveApplicantContact: async () => ({
        email: "maria@example.com",
        emails: ["maria@example.com"],
        displayName: "Maria Lopez",
      }),
      loadIncompleteAdmissionsWork: async () => familyWork,
    });

    assert.equal(sent, 0);
    assert.equal(families[0]?.incomplete_admissions_reminder_count, 0);
    assert.equal(families[0]?.incomplete_admissions_reminder_sent_at, null);
    assert.equal(familyUpdates.length, 2);
    assert.equal(familyUpdates[0]?.patch.incomplete_admissions_reminder_count, 1);
    assert.equal(familyUpdates[1]?.patch.incomplete_admissions_reminder_count, 0);
    assert.equal(familyUpdates[1]?.patch.incomplete_admissions_reminder_sent_at, null);
  });

  it("resets reminder count when a family has no incomplete work", async () => {
    const familyUpdates: Array<{ familyId: string; patch: Record<string, unknown> }> =
      [];
    const now = new Date("2026-09-16T12:00:00.000Z");

    const families = [
      {
        id: "family-1",
        incomplete_admissions_reminder_count: 1,
        incomplete_admissions_reminder_sent_at: "2026-09-08T12:00:00.000Z",
      },
    ];

    const supabase = createIncompleteReminderSupabase({
      families,
      onFamilyUpdate: (familyId, patch) => {
        familyUpdates.push({ familyId, patch });
      },
    });

    const sent = await sendIncompleteAdmissionsReminders(supabase as never, "org-1", {
      now,
      isIncompleteAdmissionsRemindersEnabled: async () => true,
      sendEmail: async () => ({ ok: true }),
      notifyDiscord: async () => {},
      resolveApplicationNotificationEmails: async () => ["admissions@rootedmeadows.com"],
      loadIncompleteAdmissionsWork: async () => new Map(),
    });

    assert.equal(sent, 0);
    assert.equal(familyUpdates.length, 1);
    assert.equal(familyUpdates[0]?.patch.incomplete_admissions_reminder_count, 0);
    assert.equal(
      familyUpdates[0]?.patch.incomplete_admissions_reminder_sent_at,
      null,
    );
  });
});
