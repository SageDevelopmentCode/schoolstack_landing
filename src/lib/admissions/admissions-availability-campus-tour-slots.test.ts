import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  campusTourAvailabilitySlotKeys,
  campusTourTrailingTimeSlots,
} from "./admissions-availability";

describe("campusTourTrailingTimeSlots", () => {
  it("returns the second half-hour for a 60-minute tour", () => {
    assert.deepEqual(campusTourTrailingTimeSlots("1:30 PM", 60), ["2:00 PM"]);
  });

  it("returns no trailing cells for a 30-minute tour", () => {
    assert.deepEqual(campusTourTrailingTimeSlots("10:00 AM", 30), []);
  });

  it("returns empty for an unknown start label", () => {
    assert.deepEqual(campusTourTrailingTimeSlots("nope", 60), []);
  });
});

describe("campusTourAvailabilitySlotKeys", () => {
  it("includes start and trailing keys for a 60-minute tour", () => {
    assert.deepEqual(campusTourAvailabilitySlotKeys("2026-10-01", "1:30 PM", 60), [
      "2026-10-01|1:30 PM",
      "2026-10-01|2:00 PM",
    ]);
  });
});
