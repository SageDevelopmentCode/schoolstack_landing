import { parseTimeToMinutes } from "@/lib/school-events/calendar-time";
import { SCHOOL_EVENT_COLOR_KEYS } from "@/lib/school-events/event-labels";
import type {
  CreateOrganizationEventInput,
  UpdateOrganizationEventInput,
} from "@/lib/school-events/events";
import type { SchoolEventColorKey, SchoolEventType } from "@/lib/school-events/types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const EVENT_TYPES = new Set<SchoolEventType>([
  "field_trip",
  "no_school",
  "community",
  "academic",
  "other",
]);

const COLOR_KEYS = new Set<SchoolEventColorKey>(SCHOOL_EVENT_COLOR_KEYS);

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function optionalTrimmedString(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (value === null) return "";
  if (typeof value !== "string") return undefined;
  return value.trim();
}

function parseEventType(value: unknown): SchoolEventType | undefined {
  if (typeof value !== "string") return undefined;
  return EVENT_TYPES.has(value as SchoolEventType)
    ? (value as SchoolEventType)
    : undefined;
}

function parseColorKey(
  value: unknown,
): SchoolEventColorKey | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  return COLOR_KEYS.has(value as SchoolEventColorKey)
    ? (value as SchoolEventColorKey)
    : undefined;
}

function parseProgramId(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!isUuid(trimmed)) return undefined;
  return trimmed;
}

function parseOptionalTime(
  value: unknown,
): { ok: true; value: string | null | undefined } | { ok: false } {
  if (value === undefined) return { ok: true, value: undefined };
  if (value === null || value === "") return { ok: true, value: null };
  if (typeof value !== "string") return { ok: false };
  const trimmed = value.trim();
  if (parseTimeToMinutes(trimmed) === null) return { ok: false };
  return { ok: true, value: trimmed };
}

export type ParsedCreateOrganizationEventBody = {
  organizationId: string;
  input: CreateOrganizationEventInput;
};

export function parseCreateOrganizationEventBody(
  body: unknown,
): ParsedCreateOrganizationEventBody | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid JSON body." };
  }

  const record = body as Record<string, unknown>;
  const organizationId =
    typeof record.organizationId === "string" ? record.organizationId.trim() : "";
  if (!isUuid(organizationId)) {
    return { error: "organizationId is required." };
  }

  const title =
    typeof record.title === "string" ? record.title.trim() : "";
  if (!title) {
    return { error: "Title is required." };
  }

  const date = typeof record.date === "string" ? record.date.trim() : "";
  if (!DATE_PATTERN.test(date)) {
    return { error: "A valid event date is required." };
  }

  const isAllDay =
    typeof record.isAllDay === "boolean" ? record.isAllDay : undefined;
  const type = parseEventType(record.type);
  if (record.type !== undefined && type === undefined) {
    return { error: "Invalid event type." };
  }

  const colorKey = parseColorKey(record.colorKey);
  if (record.colorKey !== undefined && colorKey === undefined) {
    return { error: "Invalid event color." };
  }

  const programId = parseProgramId(record.programId);
  if (record.programId !== undefined && programId === undefined) {
    return { error: "Invalid program." };
  }

  const time = parseOptionalTime(record.time);
  if (!time.ok) return { error: "Invalid start time." };
  const endTime = parseOptionalTime(record.endTime);
  if (!endTime.ok) return { error: "Invalid end time." };

  const allDay = isAllDay ?? !time.value;
  if (!allDay && !time.value) {
    return { error: "Please set a start time for timed events." };
  }

  return {
    organizationId,
    input: {
      title,
      date,
      time: allDay ? undefined : (time.value ?? undefined),
      endTime: allDay ? undefined : (endTime.value ?? undefined),
      isAllDay: allDay,
      type,
      colorKey: colorKey === null ? undefined : colorKey,
      location: optionalTrimmedString(record.location) || undefined,
      description: optionalTrimmedString(record.description) || undefined,
      programId: programId ?? null,
    },
  };
}

export type ParsedUpdateOrganizationEventBody = {
  organizationId: string;
  input: UpdateOrganizationEventInput;
};

export function parseUpdateOrganizationEventBody(
  body: unknown,
): ParsedUpdateOrganizationEventBody | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid JSON body." };
  }

  const record = body as Record<string, unknown>;
  const organizationId =
    typeof record.organizationId === "string" ? record.organizationId.trim() : "";
  if (!isUuid(organizationId)) {
    return { error: "organizationId is required." };
  }

  const input: UpdateOrganizationEventInput = {};

  if (record.title !== undefined) {
    if (typeof record.title !== "string" || !record.title.trim()) {
      return { error: "Title is required." };
    }
    input.title = record.title.trim();
  }

  if (record.date !== undefined) {
    if (typeof record.date !== "string" || !DATE_PATTERN.test(record.date.trim())) {
      return { error: "A valid event date is required." };
    }
    input.date = record.date.trim();
  }

  if (record.isAllDay !== undefined) {
    if (typeof record.isAllDay !== "boolean") {
      return { error: "Invalid all-day flag." };
    }
    input.isAllDay = record.isAllDay;
  }

  if (record.type !== undefined) {
    const type = parseEventType(record.type);
    if (!type) return { error: "Invalid event type." };
    input.type = type;
  }

  if (record.colorKey !== undefined) {
    const colorKey = parseColorKey(record.colorKey);
    if (colorKey === undefined) return { error: "Invalid event color." };
    input.colorKey = colorKey;
  }

  if (record.programId !== undefined) {
    const programId = parseProgramId(record.programId);
    if (programId === undefined) return { error: "Invalid program." };
    input.programId = programId;
  }

  if (record.time !== undefined) {
    const time = parseOptionalTime(record.time);
    if (!time.ok) return { error: "Invalid start time." };
    input.time = time.value ?? null;
  }

  if (record.endTime !== undefined) {
    const endTime = parseOptionalTime(record.endTime);
    if (!endTime.ok) return { error: "Invalid end time." };
    input.endTime = endTime.value ?? null;
  }

  if (record.location !== undefined) {
    const location = optionalTrimmedString(record.location);
    if (location === undefined) return { error: "Invalid location." };
    input.location = location || null;
  }

  if (record.description !== undefined) {
    const description = optionalTrimmedString(record.description);
    if (description === undefined) return { error: "Invalid description." };
    input.description = description || null;
  }

  if (input.isAllDay) {
    input.time = null;
    input.endTime = null;
  } else if (input.isAllDay === false && input.time === null) {
    return { error: "Please set a start time for timed events." };
  }

  return { organizationId, input };
}
