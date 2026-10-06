import type { SupabaseClient } from "@supabase/supabase-js";
import { reportOperationalError } from "@/lib/operational-errors";

/**
 * Purges `activity_events` older than ACTIVITY_EVENTS_RETENTION_MONTHS (default 12).
 * Warn window: ACTIVITY_EVENTS_RETENTION_WARN_DAYS (default 30) before cutoff.
 * Runs daily from the tuition billing cron; see supabase/migrations_manual/activity_events_retention_2026_10_05.sql.
 */

const DEFAULT_RETENTION_MONTHS = 12;
const MIN_RETENTION_MONTHS = 3;
const MAX_RETENTION_MONTHS = 36;

const DEFAULT_WARN_DAYS = 30;
const MIN_WARN_DAYS = 7;
const MAX_WARN_DAYS = 90;

const DEFAULT_BATCH_SIZE = 5_000;
const DEFAULT_MAX_BATCHES_PER_RUN = 20;

function parseBoundedInt(
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  if (!raw?.trim()) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

export function getActivityEventsRetentionMonths(): number {
  return parseBoundedInt(
    process.env.ACTIVITY_EVENTS_RETENTION_MONTHS,
    DEFAULT_RETENTION_MONTHS,
    MIN_RETENTION_MONTHS,
    MAX_RETENTION_MONTHS,
  );
}

export function getActivityEventsRetentionWarnDays(): number {
  return parseBoundedInt(
    process.env.ACTIVITY_EVENTS_RETENTION_WARN_DAYS,
    DEFAULT_WARN_DAYS,
    MIN_WARN_DAYS,
    MAX_WARN_DAYS,
  );
}

export function getActivityEventsRetentionCutoff(now: Date = new Date()): Date {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - getActivityEventsRetentionMonths());
  return cutoff;
}

export function getActivityEventsApproachingWindowEnd(cutoff: Date): Date {
  const end = new Date(cutoff);
  end.setDate(end.getDate() + getActivityEventsRetentionWarnDays());
  return end;
}

export type ActivityEventsApproachingRetention = {
  approachingCount: number;
  oldestApproachingAt: string | null;
  cutoffIso: string;
  warnDays: number;
  retentionMonths: number;
};

export async function getActivityEventsApproachingRetention(
  supabase: SupabaseClient,
  now: Date = new Date(),
): Promise<ActivityEventsApproachingRetention> {
  const retentionMonths = getActivityEventsRetentionMonths();
  const warnDays = getActivityEventsRetentionWarnDays();
  const cutoff = getActivityEventsRetentionCutoff(now);
  const windowEnd = getActivityEventsApproachingWindowEnd(cutoff);
  const cutoffIso = cutoff.toISOString();
  const windowEndIso = windowEnd.toISOString();

  const { count, error: countError } = await supabase
    .from("activity_events")
    .select("id", { count: "exact", head: true })
    .gte("created_at", cutoffIso)
    .lt("created_at", windowEndIso);

  if (countError) throw countError;

  let oldestApproachingAt: string | null = null;
  if ((count ?? 0) > 0) {
    const { data, error: oldestError } = await supabase
      .from("activity_events")
      .select("created_at")
      .gte("created_at", cutoffIso)
      .lt("created_at", windowEndIso)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (oldestError) throw oldestError;
    oldestApproachingAt = data?.created_at
      ? String(data.created_at)
      : null;
  }

  return {
    approachingCount: count ?? 0,
    oldestApproachingAt,
    cutoffIso,
    warnDays,
    retentionMonths,
  };
}

export type ActivityEventsPurgeResult = {
  deletedCount: number;
  cutoffIso: string;
  batchesRun: number;
  truncated: boolean;
  retentionMonths: number;
};

export async function purgeActivityEventsOlderThan(
  supabase: SupabaseClient,
  options?: {
    now?: Date;
    batchSize?: number;
    maxBatches?: number;
  },
): Promise<ActivityEventsPurgeResult> {
  const retentionMonths = getActivityEventsRetentionMonths();
  const cutoff = getActivityEventsRetentionCutoff(options?.now ?? new Date());
  const cutoffIso = cutoff.toISOString();
  const batchSize = options?.batchSize ?? DEFAULT_BATCH_SIZE;
  const maxBatches = options?.maxBatches ?? DEFAULT_MAX_BATCHES_PER_RUN;

  let deletedCount = 0;
  let batchesRun = 0;
  let truncated = false;

  for (let batch = 0; batch < maxBatches; batch += 1) {
    const { data: rows, error: selectError } = await supabase
      .from("activity_events")
      .select("id")
      .lt("created_at", cutoffIso)
      .order("created_at", { ascending: true })
      .limit(batchSize);

    if (selectError) throw selectError;

    const ids = (rows ?? []).map((row) => String(row.id));
    if (ids.length === 0) {
      break;
    }

    const { error: deleteError } = await supabase
      .from("activity_events")
      .delete()
      .in("id", ids);

    if (deleteError) throw deleteError;

    deletedCount += ids.length;
    batchesRun += 1;

    if (ids.length < batchSize) {
      break;
    }

    if (batch === maxBatches - 1) {
      truncated = true;
    }
  }

  return {
    deletedCount,
    cutoffIso,
    batchesRun,
    truncated,
    retentionMonths,
  };
}

export type ActivityEventsRetentionRunResult = {
  approaching: ActivityEventsApproachingRetention;
  purge: ActivityEventsPurgeResult;
};

export async function runActivityEventsRetention(
  supabase: SupabaseClient,
  options?: { now?: Date },
): Promise<ActivityEventsRetentionRunResult> {
  const now = options?.now ?? new Date();
  const approaching = await getActivityEventsApproachingRetention(supabase, now);
  const purge = await purgeActivityEventsOlderThan(supabase, { now });
  return { approaching, purge };
}

export async function runActivityEventsRetentionSafely(
  supabase: SupabaseClient,
  options?: { now?: Date },
): Promise<ActivityEventsRetentionRunResult | null> {
  try {
    return await runActivityEventsRetention(supabase, options);
  } catch (error) {
    await reportOperationalError({
      supabase,
      surface: "system",
      operation: "activity_events_retention_purge",
      error: "Activity events retention purge failed",
      notify: true,
      actor: { type: "system" },
      cause: error,
    });
    return null;
  }
}
