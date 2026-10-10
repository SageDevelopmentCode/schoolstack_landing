export type DemoTeacherTimeEntry = {
  date: string;
  clockIn: string;
  clockOut: string;
  hours: number;
  note?: string;
};

export type DemoTeacherHoursSummary = {
  weekLabel: string;
  weekTotalHours: number;
  monthTotalHours: number;
  scheduledWeekHours?: number;
  clockedInToday: boolean;
  todayClockIn?: string;
  entries: DemoTeacherTimeEntry[];
};

export function buildDemoTeacherHoursSummary(): DemoTeacherHoursSummary {
  return {
    weekLabel: "May 12 – May 18, 2026",
    weekTotalHours: 32.4,
    monthTotalHours: 128.6,
    clockedInToday: true,
    todayClockIn: "7:44 AM",
    entries: [
      {
        date: "Mon, May 19",
        clockIn: "7:44 AM",
        clockOut: "—",
        hours: 0,
        note: "In progress",
      },
      {
        date: "Fri, May 16",
        clockIn: "7:50 AM",
        clockOut: "3:40 PM",
        hours: 7.8,
      },
      {
        date: "Thu, May 15",
        clockIn: "7:44 AM",
        clockOut: "3:52 PM",
        hours: 8.1,
      },
      {
        date: "Wed, May 14",
        clockIn: "7:48 AM",
        clockOut: "3:45 PM",
        hours: 7.9,
      },
      {
        date: "Tue, May 13",
        clockIn: "7:42 AM",
        clockOut: "3:48 PM",
        hours: 8.1,
      },
      {
        date: "Mon, May 12",
        clockIn: "7:46 AM",
        clockOut: "3:38 PM",
        hours: 7.9,
      },
    ],
  };
}
