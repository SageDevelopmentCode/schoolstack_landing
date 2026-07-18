import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  emptyApplicationFormSchema,
  emptyApplicationSection,
  normalizePublicSlug,
  parseApplicationFormFeeConfig,
  parseApplicationFormSchema,
  parseDollarInputToCents,
  validateApplicationFormSchema,
  validatePublicSlug,
  validateSubmissionNotifyEmails,
  type ApplicationFormSchema,
} from "./application-form-schema";
import {
  ensureApplySystemSchema,
  extractStudentFromResponses,
  validateApplySystemSchema,
  validateStudentResponses,
} from "./apply-system-fields";

describe("parseApplicationFormSchema", () => {
  it("returns empty schema for invalid input", () => {
    assert.deepEqual(parseApplicationFormSchema(null), emptyApplicationFormSchema());
    assert.deepEqual(parseApplicationFormSchema("invalid"), emptyApplicationFormSchema());
  });

  it("parses sections and acknowledgments", () => {
    const schema = parseApplicationFormSchema({
      sections: [
        {
          id: "section-1",
          title: "Student",
          fields: [],
        },
      ],
      acknowledgments: [{ id: "ack-1", label: "I agree", required: true }],
    });

    assert.equal(schema.sections.length, 1);
    assert.equal(schema.sections[0]?.title, "Student");
    assert.equal(schema.acknowledgments.length, 1);
    assert.equal(schema.acknowledgments[0]?.label, "I agree");
  });
});

describe("parseApplicationFormFeeConfig", () => {
  it("returns defaults for invalid input", () => {
    const config = parseApplicationFormFeeConfig(null);
    assert.equal(config.enabled, false);
    assert.equal(config.label, "Application fee");
    assert.equal(config.amount_cents, 0);
  });

  it("parses fee config fields", () => {
    const config = parseApplicationFormFeeConfig({
      enabled: true,
      label: "Enrollment fee",
      amount_cents: 12500,
      required_to_submit: false,
    });

    assert.equal(config.enabled, true);
    assert.equal(config.label, "Enrollment fee");
    assert.equal(config.amount_cents, 12500);
    assert.equal(config.required_to_submit, false);
  });
});

describe("validateApplicationFormSchema", () => {
  it("requires at least one step", () => {
    const errors = validateApplicationFormSchema(emptyApplicationFormSchema());
    assert.ok(errors.includes("Add at least one form step."));
  });

  it("flags duplicate field ids", () => {
    const schema: ApplicationFormSchema = {
      sections: [
        {
          ...emptyApplicationSection("Step 1"),
          fields: [
            {
              id: "duplicate",
              label: "First",
              type: "text",
              required: true,
            },
            {
              id: "duplicate",
              label: "Second",
              type: "text",
              required: true,
            },
          ],
        },
      ],
      acknowledgments: [],
    };

    const errors = validateApplicationFormSchema(schema);
    assert.ok(errors.some((error) => error.includes("Duplicate field id")));
  });
});

describe("slug helpers", () => {
  it("normalizes public slugs", () => {
    assert.equal(normalizePublicSlug("  Apply Now!  "), "apply-now");
    assert.equal(normalizePublicSlug("UPPER-CASE"), "upper-case");
  });

  it("validates public slugs", () => {
    assert.equal(validatePublicSlug(""), "A public URL slug is required to publish.");
    assert.equal(validatePublicSlug("a"), "Slug must be 2–48 characters.");
    assert.equal(validatePublicSlug("valid-slug"), null);
  });
});

describe("validateSubmissionNotifyEmails", () => {
  it("accepts valid emails", () => {
    assert.equal(
      validateSubmissionNotifyEmails({
        submission_notify_emails: ["owner@schoolstack.test"],
      }),
      null,
    );
  });

  it("rejects invalid emails", () => {
    assert.match(
      validateSubmissionNotifyEmails({
        submission_notify_emails: ["not-an-email"],
      }) ?? "",
      /not a valid email address/,
    );
  });
});

describe("parseDollarInputToCents", () => {
  it("parses dollar amounts to cents", () => {
    assert.equal(parseDollarInputToCents("25"), 2500);
    assert.equal(parseDollarInputToCents("25.50"), 2550);
    assert.equal(parseDollarInputToCents("$1,234.56"), 123456);
  });

  it("returns null for trailing decimal input", () => {
    assert.equal(parseDollarInputToCents(""), 0);
    assert.equal(parseDollarInputToCents("25."), null);
  });
});

describe("ensureApplySystemSchema", () => {
  it("prepends the system section when missing", () => {
    const schema = ensureApplySystemSchema({
      sections: [emptyApplicationSection("Custom step")],
      acknowledgments: [],
    });

    assert.equal(schema.sections.length, 2);
    assert.equal(schema.sections[0]?.system, true);
    assert.equal(schema.sections[0]?.title, "Student information");
    assert.equal(schema.sections[1]?.title, "Custom step");
  });
});

describe("validateApplySystemSchema", () => {
  it("requires the system section to be first", () => {
    const schema = ensureApplySystemSchema({
      sections: [emptyApplicationSection("Custom step")],
      acknowledgments: [],
    });
    const withoutSystemFirst: ApplicationFormSchema = {
      ...schema,
      sections: [schema.sections[1]!, schema.sections[0]!],
    };

    const errors = validateApplySystemSchema(withoutSystemFirst);
    assert.ok(
      errors.some((error) => error.includes("must be the first step")),
    );
  });
});

describe("extractStudentFromResponses", () => {
  it("extracts complete student responses", () => {
    const student = extractStudentFromResponses({
      student_first_name: "Jon",
      student_last_name: "Cecilia",
      student_date_of_birth: "2020-07-20",
      student_grade: "k",
    });

    assert.deepEqual(student, {
      firstName: "Jon",
      lastName: "Cecilia",
      dateOfBirth: "2020-07-20",
      grade: "k",
    });
  });

  it("returns null when required fields are missing", () => {
    assert.equal(
      extractStudentFromResponses({
        student_first_name: "Jon",
        student_last_name: "",
        student_date_of_birth: "2020-07-20",
        student_grade: "k",
      }),
      null,
    );
  });
});

describe("validateStudentResponses", () => {
  it("returns null when student responses are complete", () => {
    assert.equal(
      validateStudentResponses({
        student_first_name: "Jon",
        student_last_name: "Cecilia",
        student_date_of_birth: "2020-07-20",
        student_grade: "k",
      }),
      null,
    );
  });

  it("returns a user-facing error when student responses are incomplete", () => {
    assert.match(
      validateStudentResponses({ student_first_name: "Jon" }) ?? "",
      /complete all student information fields/,
    );
  });
});
