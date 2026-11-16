import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildEventDetailsText,
  buildEventIcs,
  escapeIcsText,
  eventIcsFilename,
  foldIcsLine,
} from "./calendar-event-export";
import type { OrganizationEvent } from "./types";

const NOW = new Date(Date.UTC(2026, 10, 13, 15, 4, 5));

function event(overrides: Partial<OrganizationEvent> = {}): OrganizationEvent {
  return {
    id: "evt-1",
    organizationId: "org-1",
    title: "Pumpkin patch trip",
    date: "2026-11-14",
    isAllDay: false,
    time: "09:30",
    endTime: "11:00",
    type: "field_trip",
    sortOrder: 0,
    ...overrides,
  };
}

function unfold(ics: string): string[] {
  return ics.replace(/\r\n /g, "").split("\r\n");
}

describe("buildEventIcs", () => {
  it("writes a timed event as floating local start/end", () => {
    const lines = unfold(buildEventIcs(event(), NOW));
    assert.ok(lines.includes("BEGIN:VCALENDAR"));
    assert.ok(lines.includes("DTSTART:20261114T093000"));
    assert.ok(lines.includes("DTEND:20261114T110000"));
    assert.ok(lines.includes("DTSTAMP:20261113T150405Z"));
    assert.ok(lines.includes("UID:evt-1@org-1.calendar"));
    assert.ok(lines.includes("SUMMARY:Pumpkin patch trip"));
    assert.equal(lines.at(-1), "");
    assert.equal(lines.at(-2), "END:VCALENDAR");
  });

  it("uses a one-day VALUE=DATE range for all-day events", () => {
    const lines = unfold(buildEventIcs(event({ isAllDay: true, time: undefined, endTime: undefined, date: "2026-12-31" }), NOW));
    assert.ok(lines.includes("DTSTART;VALUE=DATE:20261231"));
    assert.ok(lines.includes("DTEND;VALUE=DATE:20270101"));
  });

  it("defaults a missing end time to one hour and rolls past midnight", () => {
    const lines = unfold(buildEventIcs(event({ time: "23:30", endTime: undefined }), NOW));
    assert.ok(lines.includes("DTSTART:20261114T233000"));
    assert.ok(lines.includes("DTEND:20261115T003000"));
  });

  it("keeps an unparseable time as an all-day entry with the time in the description", () => {
    const lines = unfold(buildEventIcs(event({ time: "after lunch", endTime: undefined }), NOW));
    assert.ok(lines.includes("DTSTART;VALUE=DATE:20261114"));
    assert.ok(lines.some((line) => line.startsWith("DESCRIPTION:Time: after lunch")));
  });

  it("escapes location and description text", () => {
    const lines = unfold(
      buildEventIcs(event({ location: "Barn 2, Hill Rd; gate B", description: "Bring boots\nand snacks" }), NOW),
    );
    assert.ok(lines.includes("LOCATION:Barn 2\\, Hill Rd\\; gate B"));
    assert.ok(lines.includes("DESCRIPTION:Bring boots\\nand snacks"));
  });

  it("folds long lines to 75 octets", () => {
    const ics = buildEventIcs(event({ description: "x".repeat(300) }), NOW);
    for (const line of ics.split("\r\n")) {
      assert.ok(new TextEncoder().encode(line).length <= 75, line);
    }
  });
});

describe("ics helpers", () => {
  it("escapes backslashes first", () => {
    assert.equal(escapeIcsText("a\\b,c"), "a\\\\b\\,c");
  });

  it("does not split multi-byte characters when folding", () => {
    const folded = foldIcsLine(`SUMMARY:${"é".repeat(60)}`);
    assert.equal(folded.replace(/\r\n /g, ""), `SUMMARY:${"é".repeat(60)}`);
  });

  it("builds a readable filename", () => {
    assert.equal(eventIcsFilename({ title: "Café Night: Families!", date: "2026-11-14" }), "cafe-night-families-2026-11-14.ics");
    assert.equal(eventIcsFilename({ title: "???", date: "2026-11-14" }), "school-event-2026-11-14.ics");
  });
});

describe("buildEventDetailsText", () => {
  it("lists title, when, where and details", () => {
    const text = buildEventDetailsText(event({ location: "Hill Farm", description: "Bring boots" }));
    assert.equal(
      text,
      "Pumpkin patch trip\nSaturday, November 14, 2026 · 9:30 AM – 11:00 AM\nHill Farm\n\nBring boots",
    );
  });
});
