export const SCHEDULER_TIMEZONE = "America/Chicago";

export const TIME_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function dateKey(y: number, m: number, d: number) {
  return `${y}-${pad2(m + 1)}-${pad2(d)}`;
}

export function formatSelectedDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
  });
}

function ctDateParts() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SCHEDULER_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return { year, month, day };
}

export function todayKey() {
  const { year, month, day } = ctDateParts();
  return dateKey(year, month - 1, day);
}

export function todayMonthYear() {
  const { year, month } = ctDateParts();
  return { year, month: month - 1 };
}

export function isPastDate(dateStr: string) {
  return dateStr < todayKey();
}

export function isCurrentMonth(year: number, month: number) {
  const { year: y, month: m } = todayMonthYear();
  return year === y && month === m;
}
