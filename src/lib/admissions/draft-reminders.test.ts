import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isDraftEligibleForReminder,
  sendDraftApplicationReminders,
} from "./draft-reminders";

describe("isDraftEligibleForReminder", () => {
  const now = new Date("2026-08-29T12:00:00.000Z");

  it("returns true when updated_at is older than the delay", () => {
    assert.equal(
      isDraftEligibleForReminder("2026-08-26T12:00:00.000Z", 72, now),
      true,
    );
  });

  it("returns false when updated_at is newer than the delay", () => {
    assert.equal(
      isDraftEligibleForReminder("2026-08-28T12:00:00.000Z", 72, now),
      false,
    );
  });
});

function createDraftReminderSupabase(options: {
  drafts: Array<Record<string, unknown>>;
  onUpdate?: (patch: Record<string, unknown>) => void;
}) {
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
            eq: () => ({
              eq: () => ({
                is: async () => ({
                  data: options.drafts,
                  error: null,
                }),
              }),
            }),
          }),
          update: (patch: Record<string, unknown>) => ({
            eq: () => ({
              eq: () => ({
                is: async () => {
                  options.onUpdate?.(patch);
                  return { error: null };
                },
              }),
            }),
          }),
        };
      }

      if (table === "guardians") {
        return {
          select: () => ({
            eq: (_column: string, value: string) => {
              if (value === "guardian-1") {
                return {
                  maybeSingle: async () => ({
                    data: {
                      first_name: "Maria",
                      last_name: "Lopez",
                      email: "maria@example.com",
                    },
                    error: null,
                  }),
                };
              }

              return {
                maybeSingle: async () => ({ data: null, error: null }),
              };
            },
          }),
        };
      }

      if (table === "families") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  notification_emails: ["maria@example.com"],
                  primary_email: "maria@example.com",
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

describe("sendDraftApplicationReminders", () => {
  it("sends one reminder and marks the application as reminded", async () => {
    const updates: Array<Record<string, unknown>> = [];
    const sentTo: string[] = [];
    const discordPayloads: Array<Record<string, unknown>> = [];
    const now = new Date("2026-08-29T12:00:00.000Z");

    const supabase = createDraftReminderSupabase({
      drafts: [
        {
          id: "app-1",
          organization_id: "org-1",
          family_id: "family-1",
          created_by_user_id: null,
          primary_guardian_id: "guardian-1",
          updated_at: "2026-08-20T12:00:00.000Z",
          form_version_id: "form-1",
          application_form_versions: {
            title: "2026 Application",
            notification_config: {
              submission_notify_emails: [],
              draft_reminders: {
                enabled: true,
                delay_hours: 72,
                contact_email: "admissions@rootedmeadows.com",
              },
            },
          },
        },
      ],
      onUpdate: (patch) => updates.push(patch),
    });

    const sent = await sendDraftApplicationReminders(supabase as never, "org-1", {
      now,
      sendEmail: async ({ to }) => {
        sentTo.push(to);
        return { ok: true };
      },
      notifyDiscord: async (payload) => {
        discordPayloads.push(payload);
      },
    });

    assert.equal(sent, 1);
    assert.deepEqual(sentTo, ["maria@example.com"]);
    assert.equal(updates.length, 1);
    assert.equal(updates[0]?.draft_reminder_sent_at, now.toISOString());
    assert.equal(discordPayloads.length, 1);
    assert.equal(discordPayloads[0]?.schoolName, "Rooted Meadows");
    assert.equal(discordPayloads[0]?.schoolSlug, "rooted-meadows");
    assert.equal(discordPayloads[0]?.applicationId, "app-1");
    assert.deepEqual(discordPayloads[0]?.recipientEmails, ["maria@example.com"]);
    assert.equal(
      discordPayloads[0]?.schoolContactEmail,
      "admissions@rootedmeadows.com",
    );
  });

  it("skips drafts when reminders are disabled on the form", async () => {
    const discordPayloads: Array<Record<string, unknown>> = [];
    const supabase = createDraftReminderSupabase({
      drafts: [
        {
          id: "app-1",
          organization_id: "org-1",
          family_id: "family-1",
          created_by_user_id: null,
          primary_guardian_id: null,
          updated_at: "2026-08-20T12:00:00.000Z",
          form_version_id: "form-1",
          application_form_versions: {
            title: "2026 Application",
            notification_config: {
              draft_reminders: {
                enabled: false,
                delay_hours: 72,
                contact_email: null,
              },
            },
          },
        },
      ],
    });

    const sent = await sendDraftApplicationReminders(supabase as never, "org-1", {
      now: new Date("2026-08-29T12:00:00.000Z"),
      sendEmail: async () => ({ ok: true }),
      notifyDiscord: async (payload) => {
        discordPayloads.push(payload);
      },
    });

    assert.equal(sent, 0);
    assert.equal(discordPayloads.length, 0);
  });

  it("does not notify Discord when email delivery fails", async () => {
    const discordPayloads: Array<Record<string, unknown>> = [];
    const now = new Date("2026-08-29T12:00:00.000Z");

    const supabase = createDraftReminderSupabase({
      drafts: [
        {
          id: "app-1",
          organization_id: "org-1",
          family_id: "family-1",
          created_by_user_id: null,
          primary_guardian_id: "guardian-1",
          updated_at: "2026-08-20T12:00:00.000Z",
          form_version_id: "form-1",
          application_form_versions: {
            title: "2026 Application",
            notification_config: {
              draft_reminders: {
                enabled: true,
                delay_hours: 72,
                contact_email: "admissions@rootedmeadows.com",
              },
            },
          },
        },
      ],
    });

    const sent = await sendDraftApplicationReminders(supabase as never, "org-1", {
      now,
      sendEmail: async () => ({ ok: false }),
      notifyDiscord: async (payload) => {
        discordPayloads.push(payload);
      },
    });

    assert.equal(sent, 0);
    assert.equal(discordPayloads.length, 0);
  });
});
