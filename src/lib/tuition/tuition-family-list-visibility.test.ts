import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classifyTuitionFamilyListVisibility } from "./tuition-family-list-visibility";

const billingEnabled = new Set(["program-main", "program-billing"]);
const isProgramBillingEnabled = (programId: string) =>
  billingEnabled.has(programId);

describe("classifyTuitionFamilyListVisibility", () => {
  it("returns active for enrolled students in billing-enabled programs", () => {
    assert.equal(
      classifyTuitionFamilyListVisibility({
        enrollments: [
          {
            enrollmentId: "enrollment-1",
            programId: "program-main",
            status: "enrolled",
          },
        ],
        assignmentEnrollmentIds: [],
        chargeCount: 0,
        isProgramBillingEnabled,
      }),
      "active",
    );
  });

  it("returns unenrolled for pending enrollments in billing-enabled programs", () => {
    assert.equal(
      classifyTuitionFamilyListVisibility({
        enrollments: [
          {
            enrollmentId: "enrollment-1",
            programId: "program-main",
            status: "pending",
          },
        ],
        assignmentEnrollmentIds: ["enrollment-1"],
        chargeCount: 0,
        isProgramBillingEnabled,
      }),
      "unenrolled",
    );
  });

  it("returns excluded for families enrolled only in billing-disabled programs", () => {
    assert.equal(
      classifyTuitionFamilyListVisibility({
        enrollments: [
          {
            enrollmentId: "enrollment-1",
            programId: "program-coop",
            status: "enrolled",
          },
        ],
        assignmentEnrollmentIds: [],
        chargeCount: 0,
        isProgramBillingEnabled,
      }),
      "excluded",
    );
  });

  it("returns unenrolled when enrolled in co-op and pending in a billing program", () => {
    assert.equal(
      classifyTuitionFamilyListVisibility({
        enrollments: [
          {
            enrollmentId: "enrollment-coop",
            programId: "program-coop",
            status: "enrolled",
          },
          {
            enrollmentId: "enrollment-main",
            programId: "program-main",
            status: "pending",
          },
        ],
        assignmentEnrollmentIds: [],
        chargeCount: 0,
        isProgramBillingEnabled,
      }),
      "unenrolled",
    );
  });

  it("returns active when enrolled in co-op and enrolled in a billing program", () => {
    assert.equal(
      classifyTuitionFamilyListVisibility({
        enrollments: [
          {
            enrollmentId: "enrollment-coop",
            programId: "program-coop",
            status: "enrolled",
          },
          {
            enrollmentId: "enrollment-main",
            programId: "program-main",
            status: "enrolled",
          },
        ],
        assignmentEnrollmentIds: [],
        chargeCount: 0,
        isProgramBillingEnabled,
      }),
      "active",
    );
  });

  it("returns unenrolled when charges exist without enrolled billing students", () => {
    assert.equal(
      classifyTuitionFamilyListVisibility({
        enrollments: [
          {
            enrollmentId: "enrollment-1",
            programId: "program-main",
            status: "pending",
          },
        ],
        assignmentEnrollmentIds: [],
        chargeCount: 2,
        isProgramBillingEnabled,
      }),
      "unenrolled",
    );
  });
});
