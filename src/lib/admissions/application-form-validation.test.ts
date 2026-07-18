import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ApplicationSection } from "./application-form-schema";
import { validateApplicationSectionResponses } from "./application-form-validation";

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
