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

  it("returns true for the second reminder after 7 days", () => {
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
                    maybeSingle: async () => ({
                      data: familyMap.get(value) ?? null,
                      error: null,
                    }),
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
                return { error: null };
              }

              if (
                currentCount !== undefined &&
                Number(family.incomplete_admissions_reminder_count) !== currentCount
              ) {
                return { error: null };
              }

              Object.assign(family, patch);
              options.onFamilyUpdate?.(familyId, patch);
              return { error: null };
            };

            const createOrgFilter = () => {
              const result = {
                eq: (countColumn: string, currentCount: number) => {
                  if (countColumn !== "incomplete_admissions_reminder_count") {
                    throw new Error(`Unexpected count column: ${countColumn}`);
                  }
                  return Promise.resolve(applyUpdate(currentCount));
                },
                then: (
                  onFulfilled: (value: { error: null }) => unknown,
                  onRejected?: (reason: unknown) => unknown,
                ) => Promise.resolve(applyUpdate()).then(onFulfilled, onRejected),
                catch: (onRejected: (reason: unknown) => unknown) =>
                  Promise.resolve(applyUpdate()).catch(onRejected),
              };
              return result;
            };

            return {
              eq: (column: string, value: string) => {
                if (column === "id") {
                  familyId = value;
                  return {
                    eq: () => createOrgFilter(),
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
