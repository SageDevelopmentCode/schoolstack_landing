export type AdminStaffHoursStaffOption = {
  id: string;
  name: string;
};

export type AdminStaffHoursLiveRow = {
  staffMemberId: string;
  staffName: string;
  roleTitle: string | null;
  entryId: string;
  clockInAt: string;
  workDate: string;
  clockInLabel: string;
};

export type AdminStaffHoursSessionRow = {
  id: string;
  staffMemberId: string;
  staffName: string;
  workDate: string;
  clockInAt: string;
  clockOutAt: string | null;
  minutes: number;
  clockInLabel: string;
  clockOutLabel: string;
};

export type AdminStaffHoursSummaryRow = {
  staffMemberId: string;
  staffName: string;
  roleTitle: string | null;
  totalMinutes: number;
  sessionCount: number;
  daysWorked: number;
};

export type AdminStaffHoursView = "live" | "summary" | "all";

export type AdminStaffHoursPageData = {
  timezone: string;
  referenceDateKey: string;
  summaryFrom: string;
  summaryTo: string;
  liveRows: AdminStaffHoursLiveRow[];
  todayClosedSessions: AdminStaffHoursSessionRow[];
  summaryRows: AdminStaffHoursSummaryRow[];
  sessions: AdminStaffHoursSessionRow[];
  staffOptions: AdminStaffHoursStaffOption[];
};
