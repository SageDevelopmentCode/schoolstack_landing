import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createSlotWithTime,
  fridayBranchSlotTimeToMinutes,
  sortFridayBranchTimeSlots,
} from "./friday-branch-mock";
import type { FridayBranchTimeSlot } from "./friday-branch-types";

function slot(id: string, time: string): FridayBranchTimeSlot {
  return { id, time, classes: [] };
}

describe("createSlotWithTime", () => {
  it("preserves id, price, and flyer fields on the first class", () => {
    const slot = createSlotWithTime("10:00", {
      id: "class-123",
      name: "Jumprope",
      location: "The Meadow",
      ageGroup: "K–3",
      teacher: "Coach Kim",
      priceCents: 5500,
      flyerStoragePath: "org/classes/class-123/flyer.pdf",
      flyerFileName: "Flyer.pdf",
      flyerFileSizeBytes: 2048,
    });

    const firstClass = slot.classes[0];
    assert.equal(firstClass.id, "class-123");
    assert.equal(firstClass.name, "Jumprope");
    assert.equal(firstClass.location, "The Meadow");
    assert.equal(firstClass.ageGroup, "K–3");
    assert.equal(firstClass.teacher, "Coach Kim");
    assert.equal(firstClass.priceCents, 5500);
    assert.equal(firstClass.flyerStoragePath, "org/classes/class-123/flyer.pdf");
    assert.equal(firstClass.flyerFileName, "Flyer.pdf");
    assert.equal(firstClass.flyerFileSizeBytes, 2048);
  });

  it("creates an empty first class when no seed is provided", () => {
    const slot = createSlotWithTime("9:00");
    assert.equal(slot.classes.length, 1);
    assert.equal(slot.classes[0].name, "");
    assert.equal(slot.classes[0].priceCents, undefined);
    assert.equal(slot.classes[0].flyerStoragePath, undefined);
  });
});

describe("fridayBranchSlotTimeToMinutes", () => {
  it("parses Friday Branch slot times", () => {
    assert.equal(fridayBranchSlotTimeToMinutes("11:00"), 11 * 60);
    assert.equal(fridayBranchSlotTimeToMinutes("11:30"), 11 * 60 + 30);
    assert.equal(fridayBranchSlotTimeToMinutes("12:00"), 12 * 60);
    assert.equal(fridayBranchSlotTimeToMinutes("1:00"), 13 * 60);
    assert.equal(fridayBranchSlotTimeToMinutes("2:00"), 14 * 60);
    assert.equal(fridayBranchSlotTimeToMinutes("9:00 AM"), 9 * 60);
  });
});

describe("sortFridayBranchTimeSlots", () => {
  it("sorts slots chronologically including inserted half-hour times", () => {
    const sorted = sortFridayBranchTimeSlots([
      slot("a", "11:00"),
      slot("b", "12:00"),
      slot("c", "1:00"),
      slot("d", "2:00"),
      slot("e", "11:30"),
    ]);

    assert.deepEqual(
      sorted.map((entry) => entry.time),
      ["11:00", "11:30", "12:00", "1:00", "2:00"],
    );
  });

  it("keeps stable order for equal times", () => {
    const sorted = sortFridayBranchTimeSlots([
      slot("first", "10:00"),
      slot("second", "10:00"),
    ]);

    assert.deepEqual(
      sorted.map((entry) => entry.id),
      ["first", "second"],
    );
  });

  it("places unparseable times at the end", () => {
    const sorted = sortFridayBranchTimeSlots([
      slot("bad", "TBD"),
      slot("early", "9:00"),
      slot("empty", ""),
    ]);

    assert.deepEqual(
      sorted.map((entry) => entry.id),
      ["early", "bad", "empty"],
    );
  });
});
