import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatCurriculumDiscussionFamilyName,
  formatCurriculumDiscussionSenderDisplayName,
  formatCurriculumDiscussionSenderLabel,
  resolveDiscussionProfilePhotoUrl,
  validateProgramCoopCurriculumDiscussionBody,
} from "./program-coop-curriculum-discussion";

describe("validateProgramCoopCurriculumDiscussionBody", () => {
  it("rejects empty messages", () => {
    assert.equal(validateProgramCoopCurriculumDiscussionBody("   "), "Message cannot be empty.");
  });

  it("accepts non-empty messages", () => {
    assert.equal(validateProgramCoopCurriculumDiscussionBody("Hello co-op"), null);
  });

  it("rejects messages over 4000 characters", () => {
    const message = "a".repeat(4001);
    assert.match(
      validateProgramCoopCurriculumDiscussionBody(message) ?? "",
      /4000 characters/i,
    );
  });
});

describe("formatCurriculumDiscussionFamilyName", () => {
  it("uses the family name when present", () => {
    assert.equal(
      formatCurriculumDiscussionFamilyName({
        familyName: "Cecilia family",
        guardianLastName: "Cecilia",
      }),
      "Cecilia family",
    );
  });

  it("falls back to last-name family label", () => {
    assert.equal(
      formatCurriculumDiscussionFamilyName({
        familyName: "",
        guardianLastName: "Smith",
      }),
      "The Smith family",
    );
  });
});

describe("formatCurriculumDiscussionSenderDisplayName", () => {
  it("formats guardian full name", () => {
    assert.equal(
      formatCurriculumDiscussionSenderDisplayName({
        guardianFirstName: "Julius",
        guardianLastName: "Cecilia",
        familyName: "Cecilia family",
      }),
      "Julius Cecilia",
    );
  });

  it("uses last name when first name is missing", () => {
    assert.equal(
      formatCurriculumDiscussionSenderDisplayName({
        guardianFirstName: "",
        guardianLastName: "Smith",
        familyName: "",
      }),
      "Smith",
    );
  });

  it("falls back to co-op parent when nothing else is available", () => {
    assert.equal(
      formatCurriculumDiscussionSenderDisplayName({
        guardianFirstName: "",
        guardianLastName: "",
        familyName: "",
      }),
      "Co-op parent",
    );
  });
});

describe("formatCurriculumDiscussionSenderLabel", () => {
  it("returns sender display name for compatibility", () => {
    assert.equal(
      formatCurriculumDiscussionSenderLabel({
        familyName: "Cecilia family",
        guardianFirstName: "Julius",
      }),
      "Julius",
    );
  });
});

describe("resolveDiscussionProfilePhotoUrl", () => {
  it("prefers guardian photo", () => {
    assert.equal(
      resolveDiscussionProfilePhotoUrl({
        guardianPhotoUrl: "https://example.com/guardian.jpg",
        familyStudentPhotoUrl: "https://example.com/child.jpg",
      }),
      "https://example.com/guardian.jpg",
    );
  });

  it("falls back to enrolled child photo", () => {
    assert.equal(
      resolveDiscussionProfilePhotoUrl({
        guardianPhotoUrl: "",
        familyStudentPhotoUrl: "https://example.com/child.jpg",
      }),
      "https://example.com/child.jpg",
    );
  });

  it("returns null when no photos are available", () => {
    assert.equal(
      resolveDiscussionProfilePhotoUrl({
        guardianPhotoUrl: null,
        familyStudentPhotoUrl: null,
      }),
      null,
    );
  });
});
