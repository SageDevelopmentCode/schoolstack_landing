import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildDisplayAvailabilitySlots,
  demoCanonicalSlotToInstant,
  displayDateKeyInTimezone,
  formatDemoTimeLabelInTimezone,
} from "./demo-scheduler-timezone";
import {
  isValidIanaTimezone,
  resolveDemoDisplayTimezoneOptions,
} from "./marketing/demo-timezone-options";

describe("demoCanonicalSlotToInstant", () => {
  it("maps CT wall clock to UTC", () => {
    const instant = demoCanonicalSlotToInstant("2026-06-15", "9:00 AM");
    assert.ok(instant);
    assert.equal(
      instant!.toISOString(),
      new Date("2026-06-15T14:00:00.000Z").toISOString(),
    );
  });

  it("handles US DST spring-forward in America/Chicago", () => {
    const instant = demoCanonicalSlotToInstant("2026-03-08", "9:00 AM");
    assert.ok(instant);
    assert.equal(
      instant!.toISOString(),
      new Date("2026-03-08T14:00:00.000Z").toISOString(),
    );
  });
});

describe("buildDisplayAvailabilitySlots", () => {
  it("round-trips canonical CT slot through Pacific display", () => {
    const now = new Date("2026-06-01T12:00:00.000Z");
    const canonical = { "2026-06-15": ["9:00 AM"] };
    const { slots } = buildDisplayAvailabilitySlots(
      canonical,
      "America/Los_Angeles",
      now,
    );

    const pacificDate = displayDateKeyInTimezone(
      demoCanonicalSlotToInstant("2026-06-15", "9:00 AM")!,
      "America/Los_Angeles",
    );
    const daySlots = slots[pacificDate];
    assert.ok(daySlots?.length);
    const match = daySlots.find(
      (s) => s.canonicalDate === "2026-06-15" && s.canonicalTime === "9:00 AM",
    );
    assert.ok(match);
    assert.equal(match.displayTime, "7:00 AM");
  });
});

describe("formatDemoTimeLabelInTimezone", () => {
  it("formats in Eastern", () => {
    const instant = demoCanonicalSlotToInstant("2026-06-15", "9:00 AM");
    assert.equal(
      formatDemoTimeLabelInTimezone(instant!, "America/New_York"),
      "10:00 AM",
    );
  });
});

describe("demo-timezone-options", () => {
  it("validates IANA zones", () => {
    assert.equal(isValidIanaTimezone("America/Chicago"), true);
    assert.equal(isValidIanaTimezone("Not/A_Zone"), false);
  });

  it("prepends browser zone when not in curated list", () => {
    const opts = resolveDemoDisplayTimezoneOptions("Europe/London");
    assert.equal(opts[0]?.value, "Europe/London");
    assert.ok(opts.some((o) => o.value === "America/Chicago"));
  });
});
