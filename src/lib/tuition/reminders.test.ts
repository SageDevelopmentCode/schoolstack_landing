import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getTuitionReminderTargetDate,
  sendTuitionDueReminders,
} from "./reminders";

describe("getTuitionReminderTargetDate", () => {
  it("returns the date reminderDaysBefore days ahead in UTC", () => {
    const targetDate = getTuitionReminderTargetDate(
      3,
      new Date("2026-08-01T15:30:00.000Z"),
    );

    assert.equal(targetDate, "2026-08-04");
  });
});

describe("sendTuitionDueReminders", () => {
  it("sends one grouped reminder email per family for matching due dates", async () => {
    const targetDate = getTuitionReminderTargetDate(3, new Date("2026-08-01T12:00:00Z"));
    const sent: Array<{ to: string; html: string }> = [];

    const supabase = {
      from(table: string) {
        if (table === "tuition_charges") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  in: async () => ({
                    data: [
                      {
                        id: "charge-1",
                        label: "Aug Tuition",
                        due_date: targetDate,
                        amount_cents: 72000,
                        family_id: "family-1",
                      },
                      {
                        id: "charge-2",
                        label: "Supply Fee",
                        due_date: targetDate,
                        amount_cents: 5000,
                        family_id: "family-1",
                      },
                    ],
                    error: null,
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
                  data: { name: "Cecilia Family", primary_email: "parent@test.com" },
                  error: null,
                }),
              }),
            }),
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      },
    };

    const sentCount = await sendTuitionDueReminders(
      supabase as never,
      "org-1",
      3,
      {
        today: new Date("2026-08-01T12:00:00Z"),
        sendEmail: async (payload) => {
          sent.push(payload);
          return { ok: true };
        },
      },
    );

    assert.equal(sentCount, 1);
    assert.equal(sent[0]?.to, "parent@test.com");
    assert.match(sent[0]?.html ?? "", /Aug Tuition/);
    assert.match(sent[0]?.html ?? "", /Supply Fee/);
  });

  it("skips families without a primary email", async () => {
    const targetDate = getTuitionReminderTargetDate(3, new Date("2026-08-01T12:00:00Z"));

    const supabase = {
      from(table: string) {
        if (table === "tuition_charges") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  in: async () => ({
                    data: [
                      {
                        id: "charge-1",
                        label: "Aug Tuition",
                        due_date: targetDate,
                        amount_cents: 72000,
                        family_id: "family-1",
                      },
                    ],
                    error: null,
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
                  data: { name: "No Email Family", primary_email: null },
                  error: null,
                }),
              }),
            }),
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      },
    };

    const sentCount = await sendTuitionDueReminders(
      supabase as never,
      "org-1",
      3,
      {
        today: new Date("2026-08-01T12:00:00Z"),
        sendEmail: async () => ({ ok: true }),
      },
    );

    assert.equal(sentCount, 0);
  });
});
