import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdmissionsAvailabilitySlotRecord } from "./admissions-availability";
import {
  buildAdminAvailabilityOccupiedSlotKeys,
  buildPublicTourOccupiedSlotKeys,
  computePublicTourAvailability,
  describeCampusTourSlotForDiscord,
} from "./public-tour-availability";
import {
  buildOccupiedSlotKeys,
  listBookableStartTimes,
} from "./admissions-booking";
import { availabilitySlotKey } from "./admissions-availability";
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

  it("blocks overlapping exclusive slots when a group tour is partially full", () => {
    const slots = [
      exclusiveSlot("2026-10-01", "9:30 AM"),
      groupSlot("2026-10-01", "10:00 AM", 10),
      groupSlot("2026-10-01", "10:30 AM", 10),
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

    const result = computePublicTourAvailability({
      slotRecords: slots,
      visits,
      startDate: "2026-10-01",
      endDate: "2026-10-01",
    });

    assert.deepEqual(result.availability["2026-10-01"], ["10:00 AM"]);
    assert.equal(result.slotMeta["2026-10-01|10:00 AM"]?.remaining, 9);
  });

  it("blocks a different group start that overlaps a partial group tour", () => {
    const slots = [
      groupSlot("2026-10-01", "10:00 AM", 3),
      groupSlot("2026-10-01", "10:30 AM", 3),
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

    const result = computePublicTourAvailability({
      slotRecords: slots,
      visits,
      startDate: "2026-10-01",
      endDate: "2026-10-01",
    });

    assert.deepEqual(result.availability["2026-10-01"], ["10:00 AM"]);
  });

  it("keeps other day-pool group starts open until the pool is full", () => {
    const slots = [
      exclusiveSlot("2026-10-01", "9:30 AM"),
      groupSlot("2026-10-01", "10:00 AM", 2, "2026-10-01"),
      groupSlot("2026-10-01", "10:30 AM", 2, "2026-10-01"),
      groupSlot("2026-10-01", "11:00 AM", 2, "2026-10-01"),
      groupSlot("2026-10-01", "11:30 AM", 2, "2026-10-01"),
      groupSlot("2026-10-01", "12:00 PM", 2, "2026-10-01"),
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

    const result = computePublicTourAvailability({
      slotRecords: slots,
      visits,
      startDate: "2026-10-01",
      endDate: "2026-10-01",
    });

    assert.deepEqual(result.availability["2026-10-01"], [
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
    ]);
    assert.equal(result.slotMeta["2026-10-01|11:00 AM"]?.remaining, 1);
    assert.equal(result.slotMeta["2026-10-01|11:30 AM"]?.remaining, 1);
    assert.ok(!result.availability["2026-10-01"]?.includes("9:30 AM"));
  });

  it("records group tour duration in occupied slot keys", () => {
    const slots = [groupSlot("2026-10-01", "10:00 AM", 10)];
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

describe("computePublicTourAvailability consecutive open cells", () => {
  it("does not list a start when trailing half-hours are not open", () => {
    const result = computePublicTourAvailability({
      slotRecords: [exclusiveSlot("2026-09-29", "1:30 PM")],
      visits: [],
      startDate: "2026-09-29",
      endDate: "2026-09-29",
    });
    assert.equal(result.availability["2026-09-29"], undefined);
  });

  it("keeps group start open after exclusive overlap blocks later starts", () => {
    const slots = [
      groupSlot("2026-09-30", "1:00 PM", 10),
      groupSlot("2026-09-30", "1:30 PM", 10),
      exclusiveSlot("2026-09-30", "2:30 PM"),
      exclusiveSlot("2026-09-30", "3:00 PM"),
    ];
    const visits = [
      {
        actionType: FAMILY_TOUR_ACTION_TYPE,
        schedulingMode: "time_slot",
        scheduledDate: "2026-09-30",
        startTimeSlot: "2:30 PM",
        durationMinutes: 60,
        status: "scheduled",
      },
    ];

    const result = computePublicTourAvailability({
      slotRecords: slots,
      visits,
      startDate: "2026-09-30",
      endDate: "2026-09-30",
    });

    assert.deepEqual(result.availability["2026-09-30"], ["1:00 PM"]);
  });
});

describe("buildAdminAvailabilityOccupiedSlotKeys", () => {
  it("marks only the start cell for group campus tours", () => {
    const slots = [
      groupSlot("2026-10-01", "10:00 AM", 4, "2026-10-01"),
      groupSlot("2026-10-01", "10:30 AM", 4, "2026-10-01"),
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

    const occupied = buildAdminAvailabilityOccupiedSlotKeys(slots, visits);
    assert.ok(occupied.has("2026-10-01|10:00 AM"));
    assert.ok(!occupied.has("2026-10-01|10:30 AM"));
  });

  it("marks full duration for exclusive campus tours", () => {
    const slots = [exclusiveSlot("2026-10-01", "10:00 AM")];
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

    const occupied = buildAdminAvailabilityOccupiedSlotKeys(slots, visits);
    assert.ok(occupied.has("2026-10-01|10:00 AM"));
    assert.ok(occupied.has("2026-10-01|10:30 AM"));
  });
});

describe("legacy exclusive occupancy vs public campus tour availability", () => {
  it("hides trailing group starts under buildOccupiedSlotKeys but not computePublicTourAvailability", () => {
    const slots = [
      groupSlot("2026-10-01", "10:00 AM", 2, "2026-10-01"),
      groupSlot("2026-10-01", "10:30 AM", 2, "2026-10-01"),
      groupSlot("2026-10-01", "11:00 AM", 2, "2026-10-01"),
      groupSlot("2026-10-01", "11:30 AM", 2, "2026-10-01"),
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

    const openSlots = new Set(slots.map((slot) => availabilitySlotKey(slot.date, slot.timeSlot)));
    const legacyOccupied = buildOccupiedSlotKeys(
      visits.map((visit) => ({
        schedulingMode: "time_slot" as const,
        scheduledDate: visit.scheduledDate,
        startTimeSlot: visit.startTimeSlot,
        durationMinutes: visit.durationMinutes,
        status: "scheduled" as const,
      })),
    );
    const legacyStarts = listBookableStartTimes(
      openSlots,
      legacyOccupied,
      "2026-10-01",
      "2026-10-01",
      60,
    );

    const publicResult = computePublicTourAvailability({
      slotRecords: slots,
      visits,
      startDate: "2026-10-01",
      endDate: "2026-10-01",
    });

    assert.ok(!legacyStarts["2026-10-01"]?.includes("10:30 AM"));
    assert.ok(!legacyStarts["2026-10-01"]?.includes("10:00 AM"));
    assert.deepEqual(publicResult.availability["2026-10-01"], [
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
    ]);
  });
});

describe("describeCampusTourSlotForDiscord", () => {
  it("labels exclusive slots as 1:1 tour", () => {
    const label = describeCampusTourSlotForDiscord(
      [exclusiveSlot("2026-10-01", "10:00 AM")],
      [],
      "2026-10-01",
      "10:00 AM",
    );
    assert.equal(label, "1:1 tour");
  });

  it("labels group slots with booked and capacity counts", () => {
    const slots = [groupSlot("2026-10-01", "10:00 AM", 4)];
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
        startTimeSlot: "10:00 AM",
        durationMinutes: 60,
        status: "scheduled",
      },
    ];

    const label = describeCampusTourSlotForDiscord(
      slots,
      visits,
      "2026-10-01",
      "10:00 AM",
    );
    assert.equal(label, "Group tour (2/4)");
  });

  it("returns null when the slot record is missing", () => {
    const label = describeCampusTourSlotForDiscord(
      [],
      [],
      "2026-10-01",
      "10:00 AM",
    );
    assert.equal(label, null);
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

  it("rejects incomplete phone numbers when phone is provided", () => {
    const incomplete = validatePublicTourAnswers(DEFAULT_PUBLIC_TOUR_FIELDS, {
      contact_name: "Jordan Lee",
      email: "jordan@example.com",
      phone: "(562) - 332 - 468",
    });
    assert.equal(incomplete.ok, false);
    if (!incomplete.ok) {
      assert.match(incomplete.error, /10-digit/);
    }
  });

  it("accepts a complete formatted phone number", () => {
    const ok = validatePublicTourAnswers(DEFAULT_PUBLIC_TOUR_FIELDS, {
      contact_name: "Jordan Lee",
      email: "jordan@example.com",
      phone: "(562) - 332 - 4687",
    });
    assert.equal(ok.ok, true);
    if (ok.ok) {
      assert.equal(ok.registrant.answers.phone, "(562) - 332 - 4687");
    }
  });
});
