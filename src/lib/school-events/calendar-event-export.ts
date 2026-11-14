import { parseEventDate } from "@/lib/committees/calendar-utils";
import { formatEventTimeRange, getEventTimeRange } from "./calendar-time";
import type { OrganizationEvent } from "./types";

/*
 * Client-side ways for a parent to take a school event with them:
 * an .ics file (Apple / Google / Outlook) and a plain-text summary to paste.
 */

const CRLF = "\r\n";

function pad(n: number, width = 2): string {
  return String(n).padStart(width, "0");
}

function icsDate(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

/** Floating local date-time (no TZ): the event happens at this wall-clock time wherever the school is. */
function icsLocalDateTime(d: Date): string {
  return `${icsDate(d)}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

function icsUtcStamp(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

/** RFC 5545 §3.3.11 TEXT escaping. */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/** RFC 5545 §3.1 line folding: max 75 octets per line, continuation lines start with a space. */
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  let currentBytes = 0;
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    const limit = parts.length === 0 ? 75 : 74; // continuation lines lose one octet to the leading space
    if (currentBytes + bytes > limit) {
      parts.push(current);
      current = "";
      currentBytes = 0;
    }
    current += char;
    currentBytes += bytes;
  }
  parts.push(current);
  return parts.join(`${CRLF} `);
}

function addDaysTo(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** A single-event VCALENDAR document. `now` is injectable for tests. */
export function buildEventIcs(event: OrganizationEvent, now: Date = new Date()): string {
  const day = parseEventDate(event.date);
  const range = getEventTimeRange(event);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Parent portal//School calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@${event.organizationId || "school"}.calendar`,
    `DTSTAMP:${icsUtcStamp(now)}`,
  ];

  if (range) {
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, range.startMinutes);
    const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, range.endMinutes);
    lines.push(`DTSTART:${icsLocalDateTime(start)}`, `DTEND:${icsLocalDateTime(end)}`);
  } else {
    // All-day, or a time we can't parse: keep it on the right day.
    lines.push(`DTSTART;VALUE=DATE:${icsDate(day)}`, `DTEND;VALUE=DATE:${icsDate(addDaysTo(day, 1))}`);
  }

  lines.push(`SUMMARY:${escapeIcsText(event.title)}`);
  if (event.location?.trim()) lines.push(`LOCATION:${escapeIcsText(event.location.trim())}`);

  const descriptionParts: string[] = [];
  if (!event.isAllDay && !range && event.time?.trim()) descriptionParts.push(`Time: ${event.time.trim()}`);
  if (event.description?.trim()) descriptionParts.push(event.description.trim());
  if (descriptionParts.length > 0) {
    lines.push(`DESCRIPTION:${escapeIcsText(descriptionParts.join("\n\n"))}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map(foldIcsLine).join(CRLF) + CRLF;
}

/** "spring-field-trip-2026-11-14.ics" */
export function eventIcsFilename(event: Pick<OrganizationEvent, "title" | "date">): string {
  const slug = event.title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${slug || "school-event"}-${event.date}.ics`;
}

/** Full date for people: "Friday, November 14, 2026". */
export function formatEventLongDate(date: string): string {
  return parseEventDate(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Plain-text summary for the clipboard (title, when, where, details). */
export function buildEventDetailsText(event: OrganizationEvent): string {
  const lines = [event.title, `${formatEventLongDate(event.date)} · ${formatEventTimeRange(event)}`];
  if (event.location?.trim()) lines.push(event.location.trim());
  if (event.description?.trim()) lines.push("", event.description.trim());
  return lines.join("\n");
}

/** Browser-only: save an .ics file via a temporary object URL. */
export function downloadIcsFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
