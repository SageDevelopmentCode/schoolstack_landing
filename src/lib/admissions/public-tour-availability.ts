import type { AdmissionsAvailabilitySlotRecord } from "./admissions-availability";
import {
  ADMISSIONS_TIME_SLOTS,
  availabilitySlotKey,
  durationToSlotCount,
  isStartTimeBookable,
  type AdmissionsAvailabilitySlotKey,
  type AdmissionsTimeSlot,
} from "./admissions-availability";
import { eachDateInRange } from "./admissions-observation-availability";
import {
  defaultFamilyCampusTourAction,
  FAMILY_TOUR_ACTION_TYPE,
} from "./family-tour-booking";
import { resolvedPostSubmitDurationMinutes } from "./post-submit-templates";

export type PublicTourVisitForAvailability = {
  actionType: string;
  schedulingMode: string;
  scheduledDate: string;
  startTimeSlot: string;
  durationMinutes: number;
  status: string;
};

export type PublicTourSlotMeta = {
  mode: "exclusive" | "group";
  capacity: number | null;
  remaining: number | null;
  groupDayKey: string | null;
  isGroupTour: boolean;
};

export type PublicTourAvailabilityResult = {
  mode: "time_slot";
  availability: Record<string, string[]>;
  slotMeta: Record<string, PublicTourSlotMeta>;
};

const CAMPUS_TOUR = FAMILY_TOUR_ACTION_TYPE;
const FAMILY_INTERVIEW = "schedule_family_interview";

function slotRecordByKey(
  records: AdmissionsAvailabilitySlotRecord[],
): Map<AdmissionsAvailabilitySlotKey, AdmissionsAvailabilitySlotRecord> {
  const map = new Map<AdmissionsAvailabilitySlotKey, AdmissionsAvailabilitySlotRecord>();
  for (const record of records) {
    map.set(availabilitySlotKey(record.date, record.timeSlot), record);
  }
  return map;
}

function activeCampusTours(visits: PublicTourVisitForAvailability[]) {
  return visits.filter(
    (visit) =>
      visit.status !== "cancelled" &&
      visit.actionType === CAMPUS_TOUR &&
      visit.schedulingMode !== "whole_day",
  );
}

function countCampusToursOnDate(
  visits: PublicTourVisitForAvailability[],
  date: string,
): number {
  return activeCampusTours(visits).filter((visit) => visit.scheduledDate === date)
    .length;
}

function countCampusToursAtSlot(
  visits: PublicTourVisitForAvailability[],
  date: string,
  startTimeSlot: string,
): number {
  return activeCampusTours(visits).filter(
    (visit) =>
      visit.scheduledDate === date && visit.startTimeSlot === startTimeSlot,
  ).length;
}

function resolveGroupCapacity(record: AdmissionsAvailabilitySlotRecord): number {
  return record.groupCapacity ?? 0;
}

function isGroupSlotFull(
  record: AdmissionsAvailabilitySlotRecord,
  visits: PublicTourVisitForAvailability[],
): boolean {
  const capacity = resolveGroupCapacity(record);
  if (capacity <= 0) return true;

  if (record.groupDayKey) {
    return countCampusToursOnDate(visits, record.groupDayKey) >= capacity;
  }

  return (
    countCampusToursAtSlot(visits, record.date, record.timeSlot) >= capacity
  );
}

function remainingForGroupSlot(
  record: AdmissionsAvailabilitySlotRecord,
  visits: PublicTourVisitForAvailability[],
): number {
  const capacity = resolveGroupCapacity(record);
  if (capacity <= 0) return 0;

  if (record.groupDayKey) {
    return Math.max(0, capacity - countCampusToursOnDate(visits, record.groupDayKey));
  }

  return Math.max(
    0,
    capacity - countCampusToursAtSlot(visits, record.date, record.timeSlot),
  );
}

export function buildPublicTourOccupiedSlotKeys(
  slotRecords: AdmissionsAvailabilitySlotRecord[],
  visits: PublicTourVisitForAvailability[],
): Set<AdmissionsAvailabilitySlotKey> {
  const recordByKey = slotRecordByKey(slotRecords);
  const occupied = new Set<AdmissionsAvailabilitySlotKey>();

  for (const visit of visits) {
    if (visit.status === "cancelled" || visit.schedulingMode === "whole_day") {
      continue;
    }

    if (visit.actionType === FAMILY_INTERVIEW) {
      addVisitOccupancy(occupied, visit);
      continue;
    }

    if (visit.actionType !== CAMPUS_TOUR) continue;

    const key = availabilitySlotKey(visit.scheduledDate, visit.startTimeSlot);
    const slotRecord = recordByKey.get(key);
    if (!slotRecord || slotRecord.tourBookingMode === "exclusive") {
      addVisitOccupancy(occupied, visit);
      continue;
    }

    if (isGroupSlotFull(slotRecord, visits)) {
      addVisitOccupancy(occupied, visit);
    }
  }

  return occupied;
}

function addVisitOccupancy(
  occupied: Set<AdmissionsAvailabilitySlotKey>,
  visit: PublicTourVisitForAvailability,
) {
  const startIndex = ADMISSIONS_TIME_SLOTS.indexOf(
    visit.startTimeSlot as AdmissionsTimeSlot,
  );
  if (startIndex < 0) return;

  const cellCount = durationToSlotCount(visit.durationMinutes);
  for (let i = 0; i < cellCount; i++) {
    const timeSlot = ADMISSIONS_TIME_SLOTS[startIndex + i];
    if (!timeSlot) continue;
    occupied.add(availabilitySlotKey(visit.scheduledDate, timeSlot));
  }
}

export function computePublicTourAvailability(params: {
  slotRecords: AdmissionsAvailabilitySlotRecord[];
  visits: PublicTourVisitForAvailability[];
  startDate: string;
  endDate: string;
  durationMinutes?: number;
}): PublicTourAvailabilityResult {
  const durationMinutes =
    params.durationMinutes ??
    resolvedPostSubmitDurationMinutes(defaultFamilyCampusTourAction());

  const openSlots = new Set(
    params.slotRecords.map((row) => availabilitySlotKey(row.date, row.timeSlot)),
  );
  const recordByKey = slotRecordByKey(params.slotRecords);
  const occupiedSlots = buildPublicTourOccupiedSlotKeys(
    params.slotRecords,
    params.visits,
  );

  const availability: Record<string, string[]> = {};
  const slotMeta: Record<string, PublicTourSlotMeta> = {};

  for (const date of eachDateInRange(params.startDate, params.endDate)) {
    const starts: string[] = [];

    for (const timeSlot of ADMISSIONS_TIME_SLOTS) {
      if (
        !isStartTimeBookable(
          openSlots,
          date,
          timeSlot,
          durationMinutes,
          occupiedSlots,
        )
      ) {
        continue;
      }

      const key = availabilitySlotKey(date, timeSlot);
      const record = recordByKey.get(key);
      if (!record) continue;

      if (record.tourBookingMode === "group") {
        const remaining = remainingForGroupSlot(record, params.visits);
        if (remaining <= 0) continue;
        slotMeta[key] = {
          mode: "group",
          capacity: resolveGroupCapacity(record),
          remaining,
          groupDayKey: record.groupDayKey,
          isGroupTour: true,
        };
      } else {
        slotMeta[key] = {
          mode: "exclusive",
          capacity: null,
          remaining: null,
          groupDayKey: null,
          isGroupTour: false,
        };
      }

      starts.push(timeSlot);
    }

    if (starts.length > 0) {
      availability[date] = starts;
    }
  }

  return { mode: "time_slot", availability, slotMeta };
}

export function isPublicTourSlotBookable(params: {
  slotRecords: AdmissionsAvailabilitySlotRecord[];
  visits: PublicTourVisitForAvailability[];
  scheduledDate: string;
  startTimeSlot: string;
  durationMinutes?: number;
}): boolean {
  const result = computePublicTourAvailability({
    slotRecords: params.slotRecords,
    visits: params.visits,
    startDate: params.scheduledDate,
    endDate: params.scheduledDate,
    durationMinutes: params.durationMinutes,
  });

  return (result.availability[params.scheduledDate] ?? []).includes(
    params.startTimeSlot,
  );
}
