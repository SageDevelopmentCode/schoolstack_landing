import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AttendanceMutationError,
  parseAttendanceDate,
  validateAttendanceAction,
  validatePickupSelection,
} from "./attendance-mutations";

describe("attendance mutations", () => {
  it("parses valid attendance dates", () => {
    assert.equal(parseAttendanceDate("2026-09-20"), "2026-09-20");
  });

  it("rejects invalid attendance dates", () => {
    assert.throws(
      () => parseAttendanceDate("09/20/2026"),
      (error: unknown) =>
        error instanceof AttendanceMutationError && error.code === "invalid_date",
    );
  });

  it("blocks pickup unless the student is present", () => {
    assert.throws(
      () => validateAttendanceAction("not_marked", "pickup"),
      (error: unknown) =>
        error instanceof AttendanceMutationError && error.code === "invalid_transition",
    );

    assert.throws(
      () => validateAttendanceAction("absent", "pickup"),
      (error: unknown) =>
        error instanceof AttendanceMutationError && error.code === "invalid_transition",
    );

    validateAttendanceAction("present", "pickup");
  });

  it("requires pickup source and contact id", () => {
    assert.throws(
      () => validatePickupSelection({ source: "guardian", contactId: "" }),
      (error: unknown) =>
        error instanceof AttendanceMutationError && error.code === "missing_pickup_contact",
    );

    assert.throws(
      () => validatePickupSelection({ source: "invalid" as "guardian", contactId: "abc" }),
      (error: unknown) =>
        error instanceof AttendanceMutationError && error.code === "invalid_pickup_source",
    );

    const selection = validatePickupSelection({
      source: "authorized_contact",
      contactId: "contact-1",
    });

    assert.deepEqual(selection, {
      source: "authorized_contact",
      contactId: "contact-1",
    });
  });
});
