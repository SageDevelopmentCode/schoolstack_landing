import {
  ADMISSIONS_TIME_SLOTS,
  type AdmissionsAvailabilitySlotKey,
  type AdmissionsTimeSlot,
  availabilitySlotKey,
  durationToSlotCount,
} from './admissions-availability';
import type { PostSubmitActionType } from './post-submit-templates';

export type AdmissionsSchedulingMode = 'time_slot' | 'whole_day';

export type ScheduledVisitSlotDetail = {
  slotId: string;
  date: string;
  startTime: string;
  endTime: string | null;
  label: string | null;
  gradeValues: string[];
};

export type ScheduledVisitRecord = {
  id: string;
  organizationId: string;
  applicationId: string;
  postSubmitActionId: string;
  actionType: PostSubmitActionType;
  schedulingMode: AdmissionsSchedulingMode;
  scheduledDate: string;
  startTimeSlot: string;
  durationMinutes: number;
  visitDayCount?: number;
  endDate?: string;
  visitDates?: string[];
  observationSlots?: ScheduledVisitSlotDetail[];
  status: 'scheduled' | 'cancelled';
  completedManuallyAt?: string;
  completedManuallyByUserId?: string;
};

export function buildOccupiedSlotKeys(
  visits: Pick<
    ScheduledVisitRecord,
    'schedulingMode' | 'scheduledDate' | 'startTimeSlot' | 'durationMinutes' | 'status'
  >[],
): Set<AdmissionsAvailabilitySlotKey> {
  const occupied = new Set<AdmissionsAvailabilitySlotKey>();

  for (const visit of visits) {
    if (visit.status === 'cancelled') continue;
    if (visit.schedulingMode === 'whole_day') continue;

    const startIndex = ADMISSIONS_TIME_SLOTS.indexOf(visit.startTimeSlot as AdmissionsTimeSlot);
    if (startIndex < 0) continue;

    const cellCount = durationToSlotCount(visit.durationMinutes);
    for (let i = 0; i < cellCount; i++) {
      const timeSlot = ADMISSIONS_TIME_SLOTS[startIndex + i];
      if (!timeSlot) continue;
      occupied.add(availabilitySlotKey(visit.scheduledDate, timeSlot));
    }
  }

  return occupied;
}
