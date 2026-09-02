import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseAdminSchedulePageMetaRow } from "./schedule-page-meta";

describe("parseAdminSchedulePageMetaRow", () => {
  it("maps RPC payload into schedule meta counts", () => {
    const meta = parseAdminSchedulePageMetaRow({
      month_slot_count: "12",
      month_observation_day_count: 3,
      upcoming_visit_count: "5",
    });

    assert.ok(meta);
    assert.equal(meta.monthSlotCount, 12);
    assert.equal(meta.monthObservationDayCount, 3);
    assert.equal(meta.upcomingVisitCount, 5);
  });

  it("returns null when row is missing", () => {
    assert.equal(parseAdminSchedulePageMetaRow(null), null);
  });
});
