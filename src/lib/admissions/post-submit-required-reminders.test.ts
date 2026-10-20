import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sendPostSubmitRequiredReminders } from "./post-submit-required-reminders";

const postSubmitConfig = {
  actions: [
    {
      id: "observation",
      type: "schedule_observation_day",
      enabled: true,
      required: true,
      title: "Observation day",
    },
  ],
};

function createReminderSupabase(options: {
  applications: Array<Record<string, unknown>>;
  onApplicationUpdate?: (
    applicationId: string,
    patch: Record<string, unknown>,
  ) => void;
}) {
  const applicationMap = new Map(
    options.applications.map((application) => [
      String(application.id),
      application,
    ]),
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
        const builder = {
          select: (_columns: string) => {
            const chain = {
              eq: (column: string, value: string) => {
                if (column === "organization_id") {
                  const orgChain = {
                    neq: () => ({
                      not: () => ({
                        not: async () => ({
                          data: [...applicationMap.values()],
                          error: null,
                        }),
                      }),
                    }),
                    eq: (innerColumn: string, innerValue: string) => {
                      if (innerColumn === "family_id") {
                        return {
                          in: (inColumn: string, ids: string[]) => {
                            if (inColumn !== "id") {
                              throw new Error(`Unexpected in column: ${inColumn}`);
                            }
                            const row = ids
                              .map((id) => applicationMap.get(id))
                              .find(Boolean);
                            return {
                              limit: () => ({
                                maybeSingle: async () => ({
                                  data: row ?? null,
                                  error: null,
                                }),
                              }),
                            };
                          },
                        };
                      }

                      if (innerColumn === "id") {
                        return {
                          eq: () => ({
                            eq: () => ({
                              select: () => ({
                                data: applicationMap.has(innerValue)
                                  ? [{ id: innerValue }]
                                  : [],
                                error: null,
                              }),
                            }),
                          }),
                        };
                      }

                      throw new Error(`Unexpected eq column: ${innerColumn}`);
                    },
                    in: (inColumn: string, ids: string[]) => {
                      if (inColumn !== "id") {
                        throw new Error(`Unexpected in column: ${inColumn}`);
                      }
                      const row = ids
                        .map((id) => applicationMap.get(id))
                        .find(Boolean);
                      return {
                        limit: () => ({
                          maybeSingle: async () => ({
                            data: row ?? null,
                            error: null,
                          }),
                        }),
                      };
                    },
                  };
                  return orgChain;
                }
                throw new Error(`Unexpected eq column: ${column}`);
              },
            };
            return chain;
          },
          update: (patch: Record<string, unknown>) => ({
            eq: (column: string, value: string) => {
              const next = {
                eq: (nextColumn: string, nextValue: unknown) => {
                  if (nextColumn === "post_submit_reminder_count") {
                    const application = applicationMap.get(value);
                    if (
                      !application ||
                      Number(application.post_submit_reminder_count) !==
                        Number(nextValue)
                    ) {
                      return {
                        select: async () => ({ data: [], error: null }),
                      };
                    }

                    application.post_submit_reminder_count =
                      patch.post_submit_reminder_count;
                    application.post_submit_reminder_sent_at =
                      patch.post_submit_reminder_sent_at;
                    options.onApplicationUpdate?.(value, patch);

                    return {
                      select: async () => ({ data: [{ id: value }], error: null }),
                    };
                  }

                  if (nextColumn === "organization_id") {
                    return {
                      eq: (_countColumn: string, countValue: unknown) => {
                        const application = applicationMap.get(value);
                        const matchesCount =
                          application &&
                          Number(application.post_submit_reminder_count) ===
                            Number(countValue);

                        if (matchesCount && "post_submit_reminder_count" in patch) {
                          application.post_submit_reminder_count =
                            patch.post_submit_reminder_count;
                          application.post_submit_reminder_sent_at =
                            patch.post_submit_reminder_sent_at;
                          options.onApplicationUpdate?.(value, patch);

                          return {
                            select: async () => ({
                              data: [{ id: value }],
                              error: null,
                            }),
                          };
                        }

                        if (matchesCount) {
                          application.post_submit_reminder_count =
                            patch.post_submit_reminder_count;
                          application.post_submit_reminder_sent_at =
                            patch.post_submit_reminder_sent_at;
                          options.onApplicationUpdate?.(value, patch);
                          return {
                            eq: async () => ({ error: null }),
                          };
                        }

                        return {
                          select: async () => ({ data: [], error: null }),
                          eq: async () => ({ error: null }),
                        };
                      },
                    };
                  }

                  throw new Error(`Unexpected update eq: ${nextColumn}`);
                },
              };
              return next;
            },
          }),
        };
        return builder;
      }

      throw new Error(`Unexpected table: ${table}`);
    },
  };
}

describe("sendPostSubmitRequiredReminders", () => {
  it("sends the first reminder and increments the application counter", async () => {
    const application = {
      id: "app-1",
      family_id: "family-1",
      submitted_at: "2026-10-18T15:00:00.000Z",
      responses: { student_first_name: "Levi" },
      post_submit_reminder_count: 0,
      post_submit_reminder_sent_at: null,
      application_form_versions: {
        title: "Rooted Meadows 2026 Application",
        post_submit_config: postSubmitConfig,
      },
    };

    const emails: string[] = [];
    const supabase = createReminderSupabase({ applications: [application] });

    const sent = await sendPostSubmitRequiredReminders(
      supabase as never,
      "org-1",
      {
        now: new Date("2026-10-19T12:00:00.000Z"),
        getOrganizationTimezone: async () => "America/Chicago",
        listScheduledVisitsForApplications: async () => [],
        loadFamilyNotificationEmails: async () => ["parent@example.com"],
        resolveApplicantContact: async () => ({
          email: "parent@example.com",
          emails: ["parent@example.com"],
          displayName: "Amanda Landeen",
        }),
        sendEmail: async (payload) => {
          emails.push(payload.to);
          assert.match(payload.subject, /Reminder: complete your required admissions step/);
          assert.match(payload.html, /Observation day/);
          return { ok: true };
        },
        notifyDiscord: async () => {},
      },
    );

    assert.equal(sent, 1);
    assert.deepEqual(emails, ["parent@example.com"]);
    assert.equal(application.post_submit_reminder_count, 1);
    assert.ok(application.post_submit_reminder_sent_at);
  });

  it("reverts the claim when sendEmail throws", async () => {
    const previousSentAt = "2026-10-18T16:00:00.000Z";
    const application = {
      id: "app-1",
      family_id: "family-1",
      submitted_at: "2026-10-16T15:00:00.000Z",
      responses: { student_first_name: "Levi" },
      post_submit_reminder_count: 1,
      post_submit_reminder_sent_at: previousSentAt,
      application_form_versions: {
        title: "Rooted Meadows 2026 Application",
        post_submit_config: postSubmitConfig,
      },
    };

    const applicationUpdates: Array<{
      applicationId: string;
      patch: Record<string, unknown>;
    }> = [];
    const supabase = createReminderSupabase({
      applications: [application],
      onApplicationUpdate: (applicationId, patch) => {
        applicationUpdates.push({ applicationId, patch });
      },
    });

    await assert.rejects(
      () =>
        sendPostSubmitRequiredReminders(supabase as never, "org-1", {
          now: new Date("2026-10-19T12:00:00.000Z"),
          getOrganizationTimezone: async () => "America/Chicago",
          listScheduledVisitsForApplications: async () => [],
          loadFamilyNotificationEmails: async () => ["parent@example.com"],
          resolveApplicantContact: async () => ({
            email: "parent@example.com",
            emails: ["parent@example.com"],
            displayName: "Amanda Landeen",
          }),
          sendEmail: async () => {
            throw new Error("SMTP unavailable");
          },
          notifyDiscord: async () => {},
        }),
      /SMTP unavailable/,
    );

    assert.equal(application.post_submit_reminder_count, 1);
    assert.equal(application.post_submit_reminder_sent_at, previousSentAt);
    assert.equal(applicationUpdates.length, 2);
    assert.equal(applicationUpdates[0]?.patch.post_submit_reminder_count, 2);
    assert.equal(applicationUpdates[1]?.patch.post_submit_reminder_count, 1);
    assert.equal(
      applicationUpdates[1]?.patch.post_submit_reminder_sent_at,
      previousSentAt,
    );
  });

  it("reverts the claim when all reminder emails fail to send", async () => {
    const previousSentAt = "2026-10-18T16:00:00.000Z";
    const application = {
      id: "app-1",
      family_id: "family-1",
      submitted_at: "2026-10-16T15:00:00.000Z",
      responses: { student_first_name: "Levi" },
      post_submit_reminder_count: 1,
      post_submit_reminder_sent_at: previousSentAt,
      application_form_versions: {
        title: "Rooted Meadows 2026 Application",
        post_submit_config: postSubmitConfig,
      },
    };

    const applicationUpdates: Array<{
      applicationId: string;
      patch: Record<string, unknown>;
    }> = [];
    const supabase = createReminderSupabase({
      applications: [application],
      onApplicationUpdate: (applicationId, patch) => {
        applicationUpdates.push({ applicationId, patch });
      },
    });

    const sent = await sendPostSubmitRequiredReminders(supabase as never, "org-1", {
      now: new Date("2026-10-19T12:00:00.000Z"),
      getOrganizationTimezone: async () => "America/Chicago",
      listScheduledVisitsForApplications: async () => [],
      loadFamilyNotificationEmails: async () => ["parent@example.com"],
      resolveApplicantContact: async () => ({
        email: "parent@example.com",
        emails: ["parent@example.com"],
        displayName: "Amanda Landeen",
      }),
      sendEmail: async () => ({ ok: false }),
      notifyDiscord: async () => {},
    });

    assert.equal(sent, 0);
    assert.equal(application.post_submit_reminder_count, 1);
    assert.equal(application.post_submit_reminder_sent_at, previousSentAt);
    assert.equal(applicationUpdates.length, 2);
    assert.equal(applicationUpdates[0]?.patch.post_submit_reminder_count, 2);
    assert.equal(applicationUpdates[1]?.patch.post_submit_reminder_count, 1);
    assert.equal(
      applicationUpdates[1]?.patch.post_submit_reminder_sent_at,
      previousSentAt,
    );
  });
});
