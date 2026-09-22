import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatAttendancePickupContactName } from "./attendance-pickup-contacts";
import type { AttendancePickupContact } from "./attendance-types";

describe("attendance pickup contacts", () => {
  it("formats merged contact names consistently", () => {
    const guardian: AttendancePickupContact = {
      id: "guardian-1",
      source: "guardian",
      firstName: "Jane",
      lastName: "Doe",
      relationship: "Mother",
      email: "jane@example.com",
      phone: null,
    };

    const authorized: AttendancePickupContact = {
      id: "contact-1",
      source: "authorized_contact",
      firstName: "Maria",
      lastName: "Lopez",
      relationship: "Grandmother",
      email: null,
      phone: "555-0100",
    };

    assert.equal(formatAttendancePickupContactName(guardian), "Jane Doe");
    assert.equal(formatAttendancePickupContactName(authorized), "Maria Lopez");
  });
});
