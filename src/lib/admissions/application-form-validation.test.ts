import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ApplicationFormSchema, ApplicationSection } from "./application-form-schema";
import {
  parseApplicationResponses,
  validateApplicationSectionResponses,
  validateCustomSectionResponses,
} from "./application-form-validation";

const studentSection: ApplicationSection = {
  id: "student",
  title: "Student information",
  fields: [
    {
      id: "student_first_name",
      label: "Student first name",
      type: "text",
      required: true,
    },
    {
      id: "student_last_name",
      label: "Student last name",
      type: "text",
      required: true,
    },
    {
      id: "student_date_of_birth",
      label: "Date of birth",
      type: "date",
      required: true,
    },
    {
      id: "student_grade",
      label: "Grade level",
      type: "select",
      required: true,
      options: [{ value: "k", label: "Kindergarten" }],
    },
  ],
};

describe("validateApplicationSectionResponses", () => {
  it("returns grade level error when other student fields are filled", () => {
    const errors = validateApplicationSectionResponses(studentSection, {
      student_first_name: "Jon",
      student_last_name: "Cecilia",
      student_date_of_birth: "2020-07-20",
      student_grade: "",
    });

    assert.deepEqual(errors, {
      student_grade: "Grade level is required.",
    });
  });

  it("returns no errors when all required fields are filled", () => {
    const errors = validateApplicationSectionResponses(studentSection, {
      student_first_name: "Jon",
      student_last_name: "Cecilia",
      student_date_of_birth: "2020-07-20",
      student_grade: "k",
    });

    assert.deepEqual(errors, {});
  });

  it("validates required phone and address fields", () => {
    const section: ApplicationSection = {
      id: "contact",
      title: "Contact",
      fields: [
        {
          id: "phone",
          label: "Phone number",
          type: "tel",
          required: true,
        },
        {
          id: "home_address",
          label: "Home address",
          type: "address",
          required: true,
        },
      ],
    };

    const errors = validateApplicationSectionResponses(section, {
      phone: "",
      home_address: "",
    });

    assert.equal(errors.phone, "Phone number is required.");
    assert.match(errors.home_address, /Home address: street address is required/);
  });
});

describe("parseApplicationResponses", () => {
  it("skips progress metadata and coerces values to strings", () => {
    assert.deepEqual(
      parseApplicationResponses({
        essay: "Hello",
        count: 3,
        __progress: { stepIndex: 2 },
      }),
      { essay: "Hello", count: "3" },
    );
  });
});

describe("validateCustomSectionResponses", () => {
  it("returns an error when a required custom text field is empty", () => {
    const schema: ApplicationFormSchema = {
      sections: [
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
      acknowledgments: [],
    };

    assert.equal(
      validateCustomSectionResponses(schema, { essay: "" }),
      "Why this school? is required.",
    );
  });

  it("skips system sections", () => {
    const schema: ApplicationFormSchema = {
      sections: [
        {
          id: "student",
          title: "Student information",
          system: true,
          fields: [
            {
              id: "student_first_name",
              label: "Student first name",
              type: "text",
              required: true,
              system: true,
            },
          ],
        },
        {
          id: "custom",
          title: "Family",
          fields: [
            {
              id: "parent_email",
              label: "Parent email",
              type: "email",
              required: true,
            },
          ],
        },
      ],
      acknowledgments: [],
    };

    assert.equal(
      validateCustomSectionResponses(schema, {
        student_first_name: "",
        parent_email: "parent@example.com",
      }),
      null,
    );
  });

  it("returns the first error across multiple custom sections", () => {
    const schema: ApplicationFormSchema = {
      sections: [
        {
          id: "step-2",
          title: "Step 2",
          fields: [
            {
              id: "phone",
              label: "Phone number",
              type: "tel",
              required: true,
            },
          ],
        },
        {
          id: "step-3",
          title: "Step 3",
          fields: [
            {
              id: "notes",
              label: "Notes",
              type: "text",
              required: true,
            },
          ],
        },
      ],
      acknowledgments: [],
    };

    assert.equal(
      validateCustomSectionResponses(schema, { phone: "", notes: "" }),
      "Phone number is required.",
    );
  });

  it("validates required checkbox and file fields", () => {
    const schema: ApplicationFormSchema = {
      sections: [
        {
          id: "custom",
          title: "Agreements",
          fields: [
            {
              id: "agree",
              label: "I agree",
              type: "checkbox",
              required: true,
            },
            {
              id: "transcript",
              label: "Transcript",
              type: "file",
              required: true,
            },
          ],
        },
      ],
      acknowledgments: [],
    };

    assert.equal(
      validateCustomSectionResponses(schema, { agree: "false", transcript: "" }),
      "I agree is required.",
    );
    assert.equal(
      validateCustomSectionResponses(schema, {
        agree: "true",
        transcript: "",
      }),
      "Transcript is required.",
    );
    assert.equal(
      validateCustomSectionResponses(schema, {
        agree: "true",
        transcript: JSON.stringify([
          {
            storagePath: "org/app/file.pdf",
            fileName: "file.pdf",
          },
        ]),
      }),
      null,
    );
  });
});
