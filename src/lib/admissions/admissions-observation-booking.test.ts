import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addCalendarDays,
  listBookableObservationStartDates,
  listConsecutiveDates,
} from "./admissions-observation-availability";

describe("admissions observation booking", () => {
  it("lists consecutive dates from a start day", () => {
    assert.deepEqual(listConsecutiveDates("2026-07-21", 3), [
      "2026-07-21",
      "2026-07-22",
      "2026-07-23",
    ]);
  });

  it("adds calendar days across month boundaries", () => {
    assert.equal(addCalendarDays("2026-07-31", 1), "2026-08-01");
  });

  it("returns start dates when all consecutive days are open and unoccupied", () => {
    const openDays = new Set([
      "2026-07-21",
      "2026-07-22",
      "2026-07-23",
      "2026-07-24",
    ]);
    const occupiedDays = new Set<string>();

    const bookable = listBookableObservationStartDates(
      openDays,
      occupiedDays,
      "2026-07-21",
      "2026-07-24",
      2,
    );

    assert.deepEqual(bookable, ["2026-07-21", "2026-07-22", "2026-07-23"]);
  });

  it("rejects a start date when a day in the block is occupied", () => {
    const openDays = new Set([
      "2026-07-21",
      "2026-07-22",
      "2026-07-23",
    ]);
    const occupiedDays = new Set(["2026-07-22"]);

    const bookable = listBookableObservationStartDates(
      openDays,
      occupiedDays,
      "2026-07-21",
      "2026-07-23",
      2,
    );

    assert.deepEqual(bookable, []);
  });

  it("allows a start date when only later days in another block are occupied", () => {
    const openDays = new Set([
      "2026-07-21",
      "2026-07-22",
      "2026-07-23",
    ]);
    const occupiedDays = new Set(["2026-07-23"]);

    const bookable = listBookableObservationStartDates(
      openDays,
      occupiedDays,
      "2026-07-21",
      "2026-07-23",
      2,
    );

    assert.deepEqual(bookable, ["2026-07-21"]);
  });

  it("rejects a start date when a day in the block is not open", () => {
    const openDays = new Set(["2026-07-21", "2026-07-23"]);
    const occupiedDays = new Set<string>();

    const bookable = listBookableObservationStartDates(
      openDays,
      occupiedDays,
      "2026-07-21",
      "2026-07-23",
      2,
    );

    assert.deepEqual(bookable, []);
  });

  it("does not return start dates that would extend past the query range", () => {
    const openDays = new Set([
      "2026-07-21",
      "2026-07-22",
      "2026-07-23",
    ]);
    const occupiedDays = new Set<string>();

    const bookable = listBookableObservationStartDates(
      openDays,
      occupiedDays,
      "2026-07-21",
      "2026-07-22",
      3,
    );

    assert.deepEqual(bookable, []);
  });
});
