export type StaffWorkTimeEntryRow = {
  id: string;
  organization_id: string;
  staff_member_id: string;
  work_date: string;
  clock_in_at: string;
  clock_out_at: string | null;
  recorded_by_user_id: string | null;
};

export const STAFF_WORK_TIME_ENTRY_COLUMNS =
  "id, organization_id, staff_member_id, work_date, clock_in_at, clock_out_at, recorded_by_user_id";
