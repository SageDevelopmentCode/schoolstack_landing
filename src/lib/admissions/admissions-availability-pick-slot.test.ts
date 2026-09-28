import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickFirstBookableSlotForDay } from "./admissions-availability";

describe("pickFirstBookableSlotForDay", () => {
  it("returns null when no slots", () => {
    assert.equal(pickFirstBookableSlotForDay([]), null);
  });

  it("picks earliest morning slot", () => {
    assert.deepEqual(pickFirstBookableSlotForDay(["10:00 AM", "9:00 AM"]), {
      period: "morning",
      slot: "9:00 AM",
    });
  });

  it("skips morning and picks afternoon when only afternoon is open", () => {
    assert.deepEqual(pickFirstBookableSlotForDay(["2:30 PM"]), {
      period: "afternoon",
      slot: "2:30 PM",
    });
  });

  it("picks night when only night slots are open", () => {
    assert.deepEqual(pickFirstBookableSlotForDay(["7:00 PM", "6:30 PM"]), {
      period: "night",
      slot: "6:30 PM",
    });
  });
});
