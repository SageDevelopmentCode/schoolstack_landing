import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  defaultApplicationFormFeeConfig,
  defaultApplicationFormNotificationConfig,
  defaultApplicationFormPostSubmitConfig,
  emptyApplicationFormSchema,
  type ApplicationFormVersion,
} from "./application-form-schema";
import { summarizeApplicationFormChanges } from "./application-form-revisions";

function baseForm(
  overrides: Partial<ApplicationFormVersion> = {},
): ApplicationFormVersion {
  return {
    id: "form-1",
    organization_id: "org-1",
    program_id: "program-1",
    form_kind: "apply",
    version: 1,
    status: "published",
    title: "Rooted Meadows 2026 Application",
    intro: "Welcome",
    public_slug: "apply",
    schema: emptyApplicationFormSchema(),
    fee_config: defaultApplicationFormFeeConfig(),
    post_submit_config: defaultApplicationFormPostSubmitConfig(),
    notification_config: defaultApplicationFormNotificationConfig(),
    published_at: "2026-07-01T00:00:00.000Z",
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("summarizeApplicationFormChanges", () => {
  it("reports no changes when form is unchanged", () => {
    const form = baseForm();
    const summary = summarizeApplicationFormChanges(form, form);
    assert.deepEqual(summary.changedFields, []);
    assert.deepEqual(summary.changes, []);
  });

  it("reports title and fee changes", () => {
    const before = baseForm({
      fee_config: {
        enabled: true,
        label: "Application fee",
        amount_cents: 5000,
        required_to_submit: true,
      },
    });
    const after = baseForm({
      title: "Rooted Meadows 2027 Application",
      fee_config: {
        enabled: true,
        label: "Application fee",
        amount_cents: 7500,
        required_to_submit: true,
      },
    });

    const summary = summarizeApplicationFormChanges(before, after);
    assert.deepEqual(summary.changedFields, ["title", "fee_config"]);
    assert.match(summary.changes[0], /Title changed/);
    assert.match(summary.changes[1], /\$50\.00/);
    assert.match(summary.changes[1], /\$75\.00/);
  });

  it("reports schema section and field changes", () => {
    const before = baseForm({
      schema: {
        sections: [
          {
            id: "section-1",
            title: "Parent information",
            fields: [{ id: "field-1", label: "Parent name", type: "text" }],
          },
        ],
        acknowledgments: [],
      },
    });
    const after = baseForm({
      schema: {
        sections: [
          {
            id: "section-1",
            title: "Parent information",
            fields: [
              { id: "field-1", label: "Parent name", type: "text" },
              { id: "field-2", label: "Parent email", type: "email" },
            ],
          },
          {
            id: "section-2",
            title: "Academic history",
            fields: [],
          },
        ],
        acknowledgments: [],
      },
    });

    const summary = summarizeApplicationFormChanges(before, after);
    assert.deepEqual(summary.changedFields, ["schema"]);
    assert.ok(summary.changes.some((change) => change.includes("Added section")));
    assert.ok(summary.changes.some((change) => change.includes("Parent email")));
  });

  it("reports step instruction description changes", () => {
    const before = baseForm({
      schema: {
        sections: [
          {
            id: "section-1",
            title: "Academic History",
            description: "Short instructions.",
            fields: [],
          },
        ],
        acknowledgments: [],
      },
    });
    const after = baseForm({
      schema: {
        sections: [
          {
            id: "section-1",
            title: "Academic History",
            description: "Longer homeschool transcript instructions.",
            fields: [],
          },
        ],
        acknowledgments: [],
      },
    });

    const summary = summarizeApplicationFormChanges(before, after);
    assert.deepEqual(summary.changedFields, ["schema"]);
    assert.ok(
      summary.changes.some((change) =>
        change.includes('Updated step instructions for “Academic History”'),
      ),
    );
  });
});
