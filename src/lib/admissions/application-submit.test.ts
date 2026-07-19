import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ApplicationFormSchema } from "./application-form-schema";
import { validateApplicationForSubmit } from "./application-form-validation";

const completeStudentResponses = {
  student_first_name: "Jon",
  student_last_name: "Cecilia",
  student_date_of_birth: "2020-07-20",
  student_grade: "k",
};

const baseSchema: ApplicationFormSchema = {
  sections: [
    {
      id: "student",
      title: "Student information",
      system: true,
      fields: [],
    },
    {
      id: "custom",
      title: "Additional information",
      fields: [
        {
          id: "essay",
          label: "Why this school?",
          type: "textarea",
          required: true,
        },
      ],
    },
  ],
  acknowledgments: [{ id: "ack-1", label: "I agree to the terms." }],
};

describe("validateApplicationForSubmit", () => {
  it("returns acknowledgments_incomplete when acknowledgments are missing", () => {
    const result = validateApplicationForSubmit(baseSchema, {
      responses: { ...completeStudentResponses, essay: "Because." },
      acknowledgments: {},
    });

    assert.deepEqual(result, {
      error: "Please confirm all acknowledgments before submitting.",
      code: "acknowledgments_incomplete",
    });
  });

  it("returns student_fields_incomplete when student fields are missing", () => {
    const result = validateApplicationForSubmit(baseSchema, {
      responses: { essay: "Because." },
      acknowledgments: { "ack-1": true },
    });

    assert.equal(result?.code, "student_fields_incomplete");
  });

  it("returns custom_fields_incomplete when a required custom field is missing", () => {
    const result = validateApplicationForSubmit(baseSchema, {
      responses: completeStudentResponses,
      acknowledgments: { "ack-1": true },
    });

    assert.deepEqual(result, {
      error: "Why this school? is required.",
      code: "custom_fields_incomplete",
    });
  });

  it("returns null when the application is ready to submit", () => {
    const result = validateApplicationForSubmit(baseSchema, {
      responses: { ...completeStudentResponses, essay: "Because." },
      acknowledgments: { "ack-1": true },
    });

    assert.equal(result, null);
  });
});
