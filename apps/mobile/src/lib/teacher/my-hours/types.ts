export type MyHoursView = 'day' | 'week' | 'month' | 'adjust';

export type MyHoursAdjustmentSession = {
  clockIn: string;
  clockOut: string;
};

export type MyHoursPendingAdjustment = {
  id: string;
  dateKey: string;
  note: string;
  sessions: MyHoursAdjustmentSession[];
};

export type MyHoursDayLog = {
  dateKey: string;
  totalMinutes: number;
  sessionCount: number;
};

export type MyHoursSession = {
  id: string;
  clockInAt: string;
  clockOutAt: string | null;
  clockIn: string;
  clockOut: string;
  minutes: number;
};

export type MyHoursRecentDay = {
  label: string;
  sessionCount: number;
  totalMinutes: number;
};

export type MyHoursWeekSummary = {
  goalMinutes: number;
  loggedMinutes: number;
  loggedWeekdays: number;
  totalWeekdays: number;
};

export type MyHoursSidebarSummary = {
  week: MyHoursWeekSummary;
  todayMinutes: number | null;
  monthLoggedMinutes: number;
  monthLoggedDays: number;
  recent: MyHoursRecentDay[];
};

export type MyHoursMonthSummary = {
  monthLabel: string;
  loggedDays: number;
  totalMinutes: number;
};

export type TeacherMyHoursActiveSession = {
  entryId: string;
  clockInAt: string;
  workDate: string;
};

export type TeacherMyHoursPageData = {
  timezone: string;
  referenceDateKey: string;
  rangeFrom: string;
  rangeTo: string;
  activeSession: TeacherMyHoursActiveSession | null;
  entriesByDateKey: Record<string, MyHoursDayLog>;
  sessionsByDateKey: Record<string, MyHoursSession[]>;
  sidebar: MyHoursSidebarSummary;
  pendingAdjustmentsByDateKey?: Record<string, MyHoursPendingAdjustment>;
  adjustmentsRequireApproval?: boolean;
};

export type ClockActionPending = 'in' | 'out' | null;
