import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildOrganizationNotificationRecipients,
  computeNotificationRecipients,
  getDefaultNotificationSettings,
  maybeMigrateIncompleteAdmissionsReminders,
  normalizeNotificationEmails,
  parseOrganizationNotificationSettings,
  validateOrganizationNotificationSettings,
} from "./org-notification-settings";

describe("parseOrganizationNotificationSettings", () => {
  it("returns defaults for empty stored value", () => {
    assert.deepEqual(parseOrganizationNotificationSettings(null), {
      applications: {
        enabled: true,
        include_org_admins: true,
        additional_emails: [],
      },
      payments: {
        enabled: true,
        include_org_admins: true,
        additional_emails: [],
      },
      visits: {
        enabled: true,
        include_org_admins: true,
        additional_emails: [],
      },
      committees: {
        enabled: true,
        include_org_admins: true,
        additional_emails: [],
      },
      program_signups: {
        enabled: true,
        include_org_admins: true,
        additional_emails: [],
      },
      parent_reminders: {
        incomplete_admissions: {
          enabled: false,
        },
      },
    });
  });

  it("parses all channels from stored json", () => {
    assert.deepEqual(
      parseOrganizationNotificationSettings({
        applications: {
          enabled: true,
          include_org_admins: false,
          additional_emails: ["admissions@school.com"],
        },
        payments: {
          enabled: false,
          additional_emails: ["billing@school.com"],
        },
        visits: {
          enabled: true,
          additional_emails: [],
        },
        committees: {
          enabled: false,
          additional_emails: ["volunteer@school.com"],
        },
        program_signups: {
          enabled: true,
          additional_emails: ["programs@school.com"],
        },
      }),
      {
        applications: {
          enabled: true,
          include_org_admins: false,
          additional_emails: ["admissions@school.com"],
        },
        payments: {
          enabled: false,
          include_org_admins: true,
          additional_emails: ["billing@school.com"],
        },
        visits: {
          enabled: true,
          include_org_admins: true,
          additional_emails: [],
        },
        committees: {
          enabled: false,
          include_org_admins: true,
          additional_emails: ["volunteer@school.com"],
        },
        program_signups: {
          enabled: true,
          include_org_admins: true,
          additional_emails: ["programs@school.com"],
        },
        parent_reminders: {
          incomplete_admissions: {
            enabled: false,
          },
        },
      },
    );
  });

  it("parses parent reminder settings from stored json", () => {
    assert.deepEqual(
      parseOrganizationNotificationSettings({
        parent_reminders: {
          incomplete_admissions: {
            enabled: true,
          },
        },
      }).parent_reminders,
      {
        incomplete_admissions: {
          enabled: true,
        },
      },
    );
  });

  it("keeps legacy payments-only stored settings", () => {
    const parsed = parseOrganizationNotificationSettings({
      payments: {
        enabled: false,
        additional_emails: ["billing@school.com"],
      },
    });

    assert.equal(parsed.payments.enabled, false);
    assert.equal(parsed.payments.include_org_admins, true);
    assert.deepEqual(parsed.payments.additional_emails, ["billing@school.com"]);
    assert.equal(parsed.applications.enabled, true);
    assert.equal(parsed.visits.enabled, true);
    assert.equal(parsed.committees.enabled, true);
    assert.equal(parsed.program_signups.enabled, true);
  });
});

describe("normalizeNotificationEmails", () => {
  it("dedupes and lowercases valid emails", () => {
    assert.deepEqual(
      normalizeNotificationEmails([
        "Owner@School.COM",
        "owner@school.com",
        "not-an-email",
      ]),
      ["owner@school.com"],
    );
  });
});

describe("computeNotificationRecipients", () => {
  it("flags action needed when enabled with no recipients", () => {
    const summary = computeNotificationRecipients(
      { enabled: true, include_org_admins: true, additional_emails: [] },
      [],
    );

    assert.equal(summary.needsAction, true);
    assert.deepEqual(summary.allRecipients, []);
  });

  it("combines org admins and additional emails", () => {
    const summary = computeNotificationRecipients(
      {
        enabled: true,
        include_org_admins: true,
        additional_emails: ["billing@school.com"],
      },
      ["admin@school.com", "admin@school.com"],
    );

    assert.equal(summary.needsAction, false);
    assert.deepEqual(summary.orgAdminEmails, ["admin@school.com"]);
    assert.deepEqual(summary.additionalEmails, ["billing@school.com"]);
    assert.deepEqual(summary.allRecipients, [
      "admin@school.com",
      "billing@school.com",
    ]);
  });

  it("excludes org admins from active recipients when opted out", () => {
    const summary = computeNotificationRecipients(
      {
        enabled: true,
        include_org_admins: false,
        additional_emails: ["billing@school.com"],
      },
      ["admin@school.com"],
    );

    assert.equal(summary.needsAction, false);
    assert.deepEqual(summary.orgAdminEmails, ["admin@school.com"]);
    assert.deepEqual(summary.additionalEmails, ["billing@school.com"]);
    assert.deepEqual(summary.allRecipients, ["billing@school.com"]);
  });

  it("flags action needed when org admins excluded and no additional emails", () => {
    const summary = computeNotificationRecipients(
      {
        enabled: true,
        include_org_admins: false,
        additional_emails: [],
      },
      ["admin@school.com"],
    );

    assert.equal(summary.needsAction, true);
    assert.deepEqual(summary.allRecipients, []);
    assert.deepEqual(summary.orgAdminEmails, ["admin@school.com"]);
  });

  it("does not flag action needed when disabled", () => {
    const summary = computeNotificationRecipients(
      { enabled: false, include_org_admins: true, additional_emails: [] },
      [],
    );

    assert.equal(summary.needsAction, false);
  });
});

describe("buildOrganizationNotificationRecipients", () => {
  it("builds summaries for all channels", () => {
    const settings = getDefaultNotificationSettings();
    settings.payments.additional_emails = ["billing@school.com"];

    const recipients = buildOrganizationNotificationRecipients(settings, [
      "admin@school.com",
    ]);

    assert.equal(recipients.applications.needsAction, false);
    assert.equal(recipients.payments.needsAction, false);
    assert.equal(recipients.committees.needsAction, false);
    assert.equal(recipients.program_signups.needsAction, false);
    assert.deepEqual(recipients.payments.allRecipients, [
      "admin@school.com",
      "billing@school.com",
    ]);
    assert.deepEqual(recipients.committees.allRecipients, ["admin@school.com"]);
    assert.deepEqual(recipients.program_signups.allRecipients, ["admin@school.com"]);
  });
});

describe("maybeMigrateIncompleteAdmissionsReminders", () => {
  it("enables parent reminders when legacy draft_reminders.enabled is true", async () => {
    let persisted: Record<string, unknown> | null = null;

    const admin = {
      from(table: string) {
        if (table === "application_form_versions") {
          return {
            select: () => ({
              eq: () => ({
                eq: async () => ({
                  data: [
                    {
                      notification_config: {
                        draft_reminders: {
                          enabled: true,
                          delay_hours: 72,
                          contact_email: "admissions@school.com",
                        },
                      },
                    },
                  ],
                  error: null,
                }),
              }),
            }),
          };
        }

        if (table === "organization_settings") {
          return {
            update: (patch: Record<string, unknown>) => ({
              eq: async () => {
                persisted = patch;
                return { error: null };
              },
            }),
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      },
    };

    const settings = getDefaultNotificationSettings();
    const migrated = await maybeMigrateIncompleteAdmissionsReminders(
      admin as never,
      "org-1",
      settings,
      null,
    );

    assert.equal(migrated.parent_reminders.incomplete_admissions.enabled, true);
    if (persisted === null) {
      assert.fail("Expected migration to persist settings");
    }
    assert.equal(
      (persisted["notifications"] as { parent_reminders: { incomplete_admissions: { enabled: boolean } } })
        .parent_reminders.incomplete_admissions.enabled,
      true,
    );
  });

  it("skips migration when parent_reminders is already stored", async () => {
    const admin = {
      from() {
        throw new Error("Should not query when parent_reminders already exists");
      },
    };

    const settings = getDefaultNotificationSettings();
    settings.parent_reminders.incomplete_admissions.enabled = false;

    const migrated = await maybeMigrateIncompleteAdmissionsReminders(
      admin as never,
      "org-1",
      settings,
      {
        parent_reminders: {
          incomplete_admissions: {
            enabled: false,
          },
        },
      },
    );

    assert.equal(migrated.parent_reminders.incomplete_admissions.enabled, false);
  });
});

describe("validateOrganizationNotificationSettings", () => {
  it("accepts valid settings", () => {
    assert.equal(
      validateOrganizationNotificationSettings(getDefaultNotificationSettings()),
      null,
    );
  });

  it("rejects invalid email addresses", () => {
    const settings = getDefaultNotificationSettings();
    settings.visits.additional_emails = ["bad-email"];

    assert.match(
      validateOrganizationNotificationSettings(settings) ?? "",
      /Invalid email address/,
    );
  });
});
