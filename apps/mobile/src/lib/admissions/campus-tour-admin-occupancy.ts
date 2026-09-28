import type { SupabaseClient } from '@supabase/supabase-js';
import {
  ADMISSIONS_TIME_SLOTS,
  availabilitySlotKey,
  durationToSlotCount,
  type AdmissionsAvailabilitySlotKey,
  type AdmissionsAvailabilitySlotRecord,
  type AdmissionsTimeSlot,
} from './admissions-availability';

export const CAMPUS_TOUR_ACTION_TYPE = 'schedule_campus_tour';

export type CampusTourVisitForAdminOccupancy = {
  actionType: string;
  schedulingMode: string;
  scheduledDate: string;
  startTimeSlot: string;
  durationMinutes: number;
  status: string;
};

const VISIT_AVAILABILITY_SELECT =
  'action_type, scheduling_mode, scheduled_date, start_time_slot, duration_minutes, status';

export async function listCampusTourVisitsForAvailability(
  supabase: SupabaseClient,
  organizationId: string,
  startDate: string,
  endDate: string,
): Promise<CampusTourVisitForAdminOccupancy[]> {
  const { data, error } = await supabase
    .from('admissions_scheduled_visits')
    .select(VISIT_AVAILABILITY_SELECT)
    .eq('organization_id', organizationId)
    .eq('status', 'scheduled')
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    actionType: String(row.action_type),
    schedulingMode: row.scheduling_mode === 'whole_day' ? 'whole_day' : 'time_slot',
    scheduledDate: String(row.scheduled_date),
    startTimeSlot: String(row.start_time_slot),
    durationMinutes: Number(row.duration_minutes),
    status: String(row.status),
  }));
}

function slotRecordByKey(
  records: AdmissionsAvailabilitySlotRecord[],
): Map<AdmissionsAvailabilitySlotKey, AdmissionsAvailabilitySlotRecord> {
  const map = new Map<AdmissionsAvailabilitySlotKey, AdmissionsAvailabilitySlotRecord>();
  for (const record of records) {
    map.set(availabilitySlotKey(record.date, record.timeSlot), record);
  }
  return map;
}

function addVisitOccupancy(
  occupied: Set<AdmissionsAvailabilitySlotKey>,
  visit: CampusTourVisitForAdminOccupancy,
) {
  const startIndex = ADMISSIONS_TIME_SLOTS.indexOf(visit.startTimeSlot as AdmissionsTimeSlot);
  if (startIndex < 0) return;

  const cellCount = durationToSlotCount(visit.durationMinutes);
  for (let i = 0; i < cellCount; i++) {
    const timeSlot = ADMISSIONS_TIME_SLOTS[startIndex + i];
    if (!timeSlot) continue;
    occupied.add(availabilitySlotKey(visit.scheduledDate, timeSlot));
  }
}

export function buildAdminAvailabilityOccupiedSlotKeys(
  slotRecords: AdmissionsAvailabilitySlotRecord[],
  visits: CampusTourVisitForAdminOccupancy[],
): Set<AdmissionsAvailabilitySlotKey> {
  const occupied = new Set<AdmissionsAvailabilitySlotKey>();
  const recordByKey = slotRecordByKey(slotRecords);

  for (const visit of visits) {
    if (visit.status === 'cancelled' || visit.schedulingMode === 'whole_day') {
      continue;
    }

    const startKey = availabilitySlotKey(visit.scheduledDate, visit.startTimeSlot);
    const slotRecord = recordByKey.get(startKey);
    const isGroupCampusTour =
      visit.actionType === CAMPUS_TOUR_ACTION_TYPE && slotRecord?.tourBookingMode === 'group';

    if (isGroupCampusTour) {
      occupied.add(startKey);
      continue;
    }

    addVisitOccupancy(occupied, visit);
  }

  return occupied;
}
