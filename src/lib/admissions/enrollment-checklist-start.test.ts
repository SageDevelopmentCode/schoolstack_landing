import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canStartEnrollmentFromApplicationStatus,
  STATUSES_THAT_CAN_START_ENROLLMENT,
} from "@/lib/admissions/enrollment-checklist-materialization";

describe("canStartEnrollmentFromApplicationStatus", () => {
  it("allows pre-enrollment and accepted statuses", () => {
    for (const status of STATUSES_THAT_CAN_START_ENROLLMENT) {
      assert.equal(canStartEnrollmentFromApplicationStatus(status), true);
    }
  });

  it("rejects enrolling and terminal statuses", () => {
    for (const status of ["draft", "enrolling", "enrolled", "declined", "withdrawn"]) {
      assert.equal(canStartEnrollmentFromApplicationStatus(status), false);
    }
  });
});
