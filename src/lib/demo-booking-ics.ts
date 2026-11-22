import { SITE_NAME } from "@/lib/site";
import { demoCanonicalSlotToInstant } from "@/lib/demo-scheduler-timezone";
import { escapeIcsText, foldIcsLine } from "@/lib/school-events/calendar-event-export";

/** Demo calls are booked in 30-minute slots and run 20 minutes. */
export const DEMO_CALL_MINUTES = 20;

const CRLF = "\r\n";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function icsUtc(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

export type DemoBookingIcsInput = {
  /** demo_requests.id: keeps the UID stable so a later invite updates the same event. */
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  schoolName: string;
  meetingLink?: string | null;
};

/**
 * A single-event VCALENDAR for a booked demo, pinned to the real instant (UTC),
 * so it lands at the right local time in any calendar app.
 * Returns null when the slot can't be parsed.
 */
export function buildDemoBookingIcs(
  input: DemoBookingIcsInput,
  now: Date = new Date(),
): string | null {
  const start = demoCanonicalSlotToInstant(input.scheduledDate, input.scheduledTime);
  if (!start) return null;
  const end = new Date(start.getTime() + DEMO_CALL_MINUTES * 60_000);
  const link = input.meetingLink?.trim() || null;

  const description = link
    ? `Join the call: ${link}\n\nA ${DEMO_CALL_MINUTES}-minute walkthrough of ${SITE_NAME} for ${input.schoolName}.`
    : `A ${DEMO_CALL_MINUTES}-minute walkthrough of ${SITE_NAME} for ${input.schoolName}.\n\nWe'll email your meeting link 24 hours before the call.`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${SITE_NAME}//Demo booking//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:demo-${input.id}@mudkitchen`,
    // Bumped once the meeting link is added so calendar apps replace the first copy.
    `SEQUENCE:${link ? 1 : 0}`,
    `DTSTAMP:${icsUtc(now)}`,
    `DTSTART:${icsUtc(start)}`,
    `DTEND:${icsUtc(end)}`,
    `SUMMARY:${escapeIcsText(`${SITE_NAME} demo`)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
  ];
  if (link) {
    lines.push(`LOCATION:${escapeIcsText(link)}`, `URL:${link}`);
  }
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map(foldIcsLine).join(CRLF) + CRLF;
}

export function demoBookingIcsFilename(scheduledDate: string): string {
  return `mudkitchen-demo-${scheduledDate}.ics`;
}

/** Ready-to-send attachment, or an empty list when the slot can't be parsed. */
export function demoBookingIcsAttachments(input: DemoBookingIcsInput) {
  const ics = buildDemoBookingIcs(input);
  if (!ics) return [];
  return [
    {
      filename: demoBookingIcsFilename(input.scheduledDate),
      content: ics,
      contentType: "text/calendar; charset=utf-8; method=PUBLISH",
    },
  ];
}
