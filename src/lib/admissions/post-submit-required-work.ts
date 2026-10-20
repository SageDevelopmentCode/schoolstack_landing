import {
  parseApplicationFormPostSubmitConfig,
  type PostSubmitActionType,
} from "./application-form-schema";
import {
  postSubmitActionLabel,
} from "./post-submit-templates";

export const MAX_POST_SUBMIT_REQUIRED_REMINDERS = 2;

export type PendingRequiredPostSubmitAction = {
  actionId: string;
  title: string;
  type: PostSubmitActionType;
};

function formatInstantAsDateKeyInTimezone(
  value: string | Date,
  timezone: string,
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }
}

function daysBetweenDateKeys(startKey: string, endKey: string): number {
  const [startYear, startMonth, startDay] = startKey.split("-").map(Number);
  const [endYear, endMonth, endDay] = endKey.split("-").map(Number);
  if (
    !Number.isFinite(startYear) ||
    !Number.isFinite(endYear) ||
    !startKey ||
    !endKey
  ) {
    return Number.NEGATIVE_INFINITY;
  }

  const startMs = Date.UTC(startYear, startMonth - 1, startDay);
  const endMs = Date.UTC(endYear, endMonth - 1, endDay);
  return Math.round((endMs - startMs) / (24 * 60 * 60 * 1000));
}

export function daysSinceSubmissionInTimezone(
  submittedAt: string,
  now: Date,
  timezone: string,
): number {
  const submittedKey = formatInstantAsDateKeyInTimezone(submittedAt, timezone);
  const todayKey = formatInstantAsDateKeyInTimezone(now, timezone);
  return daysBetweenDateKeys(submittedKey, todayKey);
}

export function listPendingRequiredPostSubmitActions(
  postSubmitConfigRaw: unknown,
  bookedPostSubmitActionIds: Iterable<string>,
): PendingRequiredPostSubmitAction[] {
  const booked = new Set(bookedPostSubmitActionIds);
  const config = parseApplicationFormPostSubmitConfig(postSubmitConfigRaw);

  return config.actions
    .filter((action) => action.enabled && action.required !== false)
    .filter((action) => !booked.has(action.id))
    .map((action) => ({
      actionId: action.id,
      title: postSubmitActionLabel(action),
      type: action.type,
    }));
}

export function applicationHasPendingRequiredPostSubmit(
  postSubmitConfigRaw: unknown,
  bookedPostSubmitActionIds: Iterable<string>,
): boolean {
  return (
    listPendingRequiredPostSubmitActions(
      postSubmitConfigRaw,
      bookedPostSubmitActionIds,
    ).length > 0
  );
}

/** Required enabled actions on the form (used at submit time before any visits exist). */
export function listConfiguredRequiredPostSubmitActions(
  postSubmitConfigRaw: unknown,
): PendingRequiredPostSubmitAction[] {
  return listPendingRequiredPostSubmitActions(postSubmitConfigRaw, []);
}

export function isEligibleForPostSubmitRequiredReminder(input: {
  count: number;
  submittedAt: string | null;
  hasPendingRequired: boolean;
  now: Date;
  timezone: string;
}): boolean {
  const { count, submittedAt, hasPendingRequired, now, timezone } = input;

  if (!hasPendingRequired || !submittedAt) {
    return false;
  }

  if (count >= MAX_POST_SUBMIT_REQUIRED_REMINDERS) {
    return false;
  }

  const daysSinceSubmission = daysSinceSubmissionInTimezone(
    submittedAt,
    now,
    timezone,
  );

  if (count === 0) {
    return daysSinceSubmission >= 1;
  }

  if (count === 1) {
    return daysSinceSubmission >= 2;
  }

  return false;
}
