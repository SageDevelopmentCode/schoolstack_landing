import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getTuitionReminderTargetDate } from "./reminders";
import { sendAutopayUpcomingReminders } from "./autopay-reminders";

describe("sendAutopayUpcomingReminders", () => {
  it("sends autopay reminder when family has autopay and charges due tomorrow", async () => {
    const chargeDate = getTuitionReminderTargetDate(1, new Date("2026-09-30T12:00:00Z"));
    const sent: Array<{ to: string; html: string }> = [];

    const supabase = {
      from(table: string) {
        if (table === "tuition_billing_accounts") {
          return {
            select: () => ({
              eq: async () => ({
                data: [
                  {
                    id: "billing-1",
                    organization_id: "org-1",
                    family_id: "family-1",
                    autopay_enabled: true,
                    metadata: {},
                  },
                ],
                error: null,
              }),
            }),
          };
        }

        if (table === "tuition_billing_splits") {
          return {
            select: () => ({
              in: async () => ({ data: [], error: null }),
            }),
          };
        }

        if (table === "tuition_charges") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  in: () => ({
                    in: async () => ({
                      data: [
                        {
                          id: "charge-1",
                          label: "Oct Tuition",
                          due_date: chargeDate,
                          amount_cents: 60000,
                          paid_cents: 0,
                          family_id: "family-1",
                          guardian_id: null,
                        },
                      ],
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          };
        }

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

        if (table === "families") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: { name: "Olson Family" },
                  error: null,
                }),
              }),
            }),
          };
        }

        if (table === "guardians") {
          return {
            select: () => ({
              eq: async () => ({
                data: [{ email: "parent@test.com", user_id: "user-1" }],
                error: null,
              }),
            }),
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      },
      auth: {
        admin: {
          getUserById: async () => ({
            data: { user: { email: "parent@test.com" } },
            error: null,
          }),
        },
      },
    };

    const sentCount = await sendAutopayUpcomingReminders(
      supabase as never,
      "org-1",
      1,
      {
        today: new Date("2026-09-30T12:00:00Z"),
        sendEmail: async (payload) => {
          sent.push(payload);
          return { ok: true };
        },
      },
    );

    assert.equal(sentCount, 1);
    assert.match(sent[0]?.html ?? "", /Autopay Reminder/);
    assert.match(sent[0]?.html ?? "", /Oct Tuition/);
  });

  it("sends reminder when autopay is per-guardian on combined billing (family-level charge)", async () => {
    const chargeDate = getTuitionReminderTargetDate(1, new Date("2026-09-30T12:00:00Z"));
    const sent: Array<{ to: string; html: string }> = [];

    const supabase = {
      from(table: string) {
        if (table === "tuition_billing_accounts") {
          return {
            select: () => ({
              eq: async () => ({
                data: [
                  {
                    id: "billing-1",
                    organization_id: "org-1",
                    family_id: "family-thompson",
                    autopay_enabled: false,
                    metadata: {
                      autopayByGuardian: {
                        "guardian-amy": true,
                      },
                    },
                  },
                ],
                error: null,
              }),
            }),
          };
        }

        if (table === "tuition_billing_splits") {
          return {
            select: () => ({
              in: async () => ({ data: [], error: null }),
            }),
          };
        }

        if (table === "tuition_charges") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  in: () => ({
                    in: async () => ({
                      data: [
                        {
                          id: "charge-sep",
                          label: "Sep Tuition",
                          due_date: chargeDate,
                          amount_cents: 72000,
                          paid_cents: 0,
                          family_id: "family-thompson",
                          guardian_id: null,
                        },
                      ],
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          };
        }

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

        if (table === "families") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: { name: "Thompson Family" },
                  error: null,
                }),
              }),
            }),
          };
        }

        if (table === "guardians") {
          return {
            select: () => ({
              eq: async () => ({
                data: [{ email: "amy@example.com", user_id: "user-amy" }],
                error: null,
              }),
            }),
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      },
      auth: {
        admin: {
          getUserById: async () => ({
            data: { user: { email: "amy@example.com" } },
            error: null,
          }),
        },
      },
    };

    const sentCount = await sendAutopayUpcomingReminders(
      supabase as never,
      "org-1",
      1,
      {
        today: new Date("2026-09-30T12:00:00Z"),
        sendEmail: async (payload) => {
          sent.push(payload);
          return { ok: true };
        },
      },
    );

    assert.equal(sentCount, 1);
    assert.match(sent[0]?.html ?? "", /Sep Tuition/);
  });

  it("skips families without autopay enabled", async () => {
    const supabase = {
      from(table: string) {
        if (table === "tuition_billing_accounts") {
          return {
            select: () => ({
              eq: async () => ({
                data: [
                  {
                    id: "billing-1",
                    organization_id: "org-1",
                    family_id: "family-1",
                    autopay_enabled: false,
                    metadata: {},
                  },
                ],
                error: null,
              }),
            }),
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      },
    };

    const sentCount = await sendAutopayUpcomingReminders(
      supabase as never,
      "org-1",
      1,
      {
        today: new Date("2026-09-30T12:00:00Z"),
        sendEmail: async () => ({ ok: true }),
      },
    );

    assert.equal(sentCount, 0);
  });

  it("skips autopay families with no qualifying charges tomorrow", async () => {
    const supabase = {
      from(table: string) {
        if (table === "tuition_billing_accounts") {
          return {
            select: () => ({
              eq: async () => ({
                data: [
                  {
                    id: "billing-1",
                    organization_id: "org-1",
                    family_id: "family-1",
                    autopay_enabled: true,
                    metadata: {},
                  },
                ],
                error: null,
              }),
            }),
          };
        }

        if (table === "tuition_billing_splits") {
          return {
            select: () => ({
              in: async () => ({ data: [], error: null }),
            }),
          };
        }

        if (table === "tuition_charges") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  in: () => ({
                    in: async () => ({ data: [], error: null }),
                  }),
                }),
              }),
            }),
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      },
    };

    const sentCount = await sendAutopayUpcomingReminders(
      supabase as never,
      "org-1",
      1,
      {
        today: new Date("2026-09-30T12:00:00Z"),
        sendEmail: async () => ({ ok: true }),
      },
    );

    assert.equal(sentCount, 0);
  });
});
