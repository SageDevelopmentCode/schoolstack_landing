import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdmissionsAvailabilitySlotRecord } from "./admissions-availability";
import {
  buildPublicTourOccupiedSlotKeys,
  computePublicTourAvailability,
} from "./public-tour-availability";
import { FAMILY_TOUR_ACTION_TYPE } from "./family-tour-booking";
import { validatePublicTourAnswers } from "./public-tour-validation";
import { DEFAULT_PUBLIC_TOUR_FIELDS } from "./public-tour-settings";

function exclusiveSlot(
  date: string,
  timeSlot: string,
): AdmissionsAvailabilitySlotRecord {
  return {
    date,
    timeSlot,
    tourBookingMode: "exclusive",
    groupCapacity: null,
    groupDayKey: null,
  };
}

function groupSlot(
  date: string,
  timeSlot: string,
  capacity: number,
  groupDayKey: string | null = null,
): AdmissionsAvailabilitySlotRecord {
  return {
    date,
    timeSlot,
    tourBookingMode: "group",
    groupCapacity: capacity,
    groupDayKey,
  };
}

describe("computePublicTourAvailability", () => {
  it("allows multiple bookings on a group slot until capacity", () => {
    const slots = [
      groupSlot("2026-10-01", "10:00 AM", 3),
      groupSlot("2026-10-01", "10:30 AM", 3),
    ];
    const oneTour = [
      {
        actionType: FAMILY_TOUR_ACTION_TYPE,
        schedulingMode: "time_slot",
        scheduledDate: "2026-10-01",
        startTimeSlot: "10:00 AM",
        durationMinutes: 60,
        status: "scheduled",
      },
    ];

    const withOne = computePublicTourAvailability({
      slotRecords: slots,
      visits: oneTour,
      startDate: "2026-10-01",
      endDate: "2026-10-01",
    });

    assert.deepEqual(withOne.availability["2026-10-01"], ["10:00 AM"]);
    assert.equal(withOne.slotMeta["2026-10-01|10:00 AM"]?.remaining, 2);

    const full = computePublicTourAvailability({
      slotRecords: slots,
      visits: [
        ...oneTour,
        ...oneTour,
        ...oneTour,
      ],
      startDate: "2026-10-01",
      endDate: "2026-10-01",
    });

    assert.equal(full.availability["2026-10-01"], undefined);
  });

  it("uses whole-day group pool capacity across times on the same date", () => {
    const slots = [
      groupSlot("2026-10-01", "10:00 AM", 2, "2026-10-01"),
      groupSlot("2026-10-01", "11:00 AM", 2, "2026-10-01"),
    ];

    const visits = [
      {
        actionType: FAMILY_TOUR_ACTION_TYPE,
        schedulingMode: "time_slot",
        scheduledDate: "2026-10-01",
        startTimeSlot: "10:00 AM",
        durationMinutes: 60,
        status: "scheduled",
      },
      {
        actionType: FAMILY_TOUR_ACTION_TYPE,
        schedulingMode: "time_slot",
        scheduledDate: "2026-10-01",
        startTimeSlot: "11:00 AM",
        durationMinutes: 60,
        status: "scheduled",
      },
    ];

    const result = computePublicTourAvailability({
      slotRecords: slots,
      visits,
      startDate: "2026-10-01",
      endDate: "2026-10-01",
    });

    assert.equal(result.availability["2026-10-01"], undefined);
  });

  it("blocks exclusive campus tours from overlapping slots", () => {
    const slots = [
      exclusiveSlot("2026-10-01", "10:00 AM"),
      exclusiveSlot("2026-10-01", "10:30 AM"),
    ];
    const visits = [
      {
        actionType: FAMILY_TOUR_ACTION_TYPE,
        schedulingMode: "time_slot",
        scheduledDate: "2026-10-01",
        startTimeSlot: "10:00 AM",
        durationMinutes: 60,
        status: "scheduled",
      },
    ];

    const occupied = buildPublicTourOccupiedSlotKeys(slots, visits);
    assert.ok(occupied.has("2026-10-01|10:00 AM"));
    assert.ok(occupied.has("2026-10-01|10:30 AM"));
  });
});

describe("validatePublicTourAnswers", () => {
  it("requires email and contact name by default", () => {
    const missing = validatePublicTourAnswers(DEFAULT_PUBLIC_TOUR_FIELDS, {});
    assert.equal(missing.ok, false);

    const ok = validatePublicTourAnswers(DEFAULT_PUBLIC_TOUR_FIELDS, {
      contact_name: "Jordan Lee",
      email: "jordan@example.com",
    });
    assert.equal(ok.ok, true);
    if (ok.ok) {
      assert.equal(ok.registrant.contactEmail, "jordan@example.com");
    }
  });
});
