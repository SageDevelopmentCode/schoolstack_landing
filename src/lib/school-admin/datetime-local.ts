export const DEFAULT_DATETIME_LOCAL_TIME = "09:00";

export function splitDateTimeLocalValue(value: string): { date: string; time: string } {
  if (!value.trim()) {
    return { date: "", time: "" };
  }

  const [date, time] = value.split("T");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { date: "", time: "" };
  }

  if (!time || !/^\d{2}:\d{2}$/.test(time.slice(0, 5))) {
    return { date, time: "" };
  }

  return { date, time: time.slice(0, 5) };
}

export function joinDateTimeLocalValue(date: string, time: string): string {
  if (!date.trim()) return "";
  const normalizedTime = time.trim() || DEFAULT_DATETIME_LOCAL_TIME;
  return `${date}T${normalizedTime}`;
}
