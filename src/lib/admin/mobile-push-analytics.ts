import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActivityDatePreset } from "@/lib/activity-log";
import { getActivityDateRangeStart } from "@/lib/activity-log";
import {
  MOBILE_PUSH_CATALOG,
  type MobilePushCatalogEntry,
  type MobilePushNotificationKind,
  isMobilePushNotificationKind,
} from "@/lib/notifications/mobile-push-catalog";
import type { PushDeliveryStatus } from "@/lib/notifications/push-notification-deliveries";
import { POSTGREST_DEFAULT_MAX_ROWS } from "@/lib/supabase/fetch-all-rows";

export type MobilePushAnalyticsKindSummary = {
  kind: MobilePushNotificationKind;
  label: string;
  description: string;
  channel: MobilePushCatalogEntry["channel"];
  recipientPortals: MobilePushCatalogEntry["recipientPortals"];
  deliveryCount: number;
  sentCount: number;
  failedCount: number;
  skippedNoTokenCount: number;
  sentTodayCount: number;
  failedTodayCount: number;
};

export type MobilePushAnalyticsResult = {
  kinds: MobilePushAnalyticsKindSummary[];
  truncated: boolean;
};

type DeliveryCountFilters = {
  organizationId?: string;
  datePreset: ActivityDatePreset;
  recipientPortal?: "parent" | "teacher" | "admin";
};

export type PushDeliveryGroupRow = {
  notification_kind: string | null;
  status: string;
};

type StatusCountMap = Record<PushDeliveryStatus, number>;

const MAX_GROUP_ROWS = 100_000;

function emptyStatusCounts(): StatusCountMap {
  return {
    sent: 0,
    failed: 0,
    skipped_no_token: 0,
  };
}

function isPushDeliveryStatus(value: string): value is PushDeliveryStatus {
  return value === "sent" || value === "failed" || value === "skipped_no_token";
}

/** Aggregates raw group rows into per-kind status counts. Exported for tests. */
export function aggregatePushDeliveryGroupRows(
  rows: PushDeliveryGroupRow[],
): Map<MobilePushNotificationKind, StatusCountMap> {
  const byKind = new Map<MobilePushNotificationKind, StatusCountMap>();

  for (const entry of MOBILE_PUSH_CATALOG) {
    byKind.set(entry.kind, emptyStatusCounts());
  }

  for (const row of rows) {
    if (!row.notification_kind || !isMobilePushNotificationKind(row.notification_kind)) {
      continue;
    }
    if (!isPushDeliveryStatus(row.status)) continue;

    const counts = byKind.get(row.notification_kind) ?? emptyStatusCounts();
    counts[row.status] += 1;
    byKind.set(row.notification_kind, counts);
  }

  return byKind;
}

export function buildMobilePushKindSummaries(
  periodByKind: Map<MobilePushNotificationKind, StatusCountMap>,
  todayByKind: Map<MobilePushNotificationKind, StatusCountMap>,
): MobilePushAnalyticsKindSummary[] {
  return MOBILE_PUSH_CATALOG.map((entry) => {
    const period = periodByKind.get(entry.kind) ?? emptyStatusCounts();
    const today = todayByKind.get(entry.kind) ?? emptyStatusCounts();

    const sentCount = period.sent;
    const failedCount = period.failed;
    const skippedNoTokenCount = period.skipped_no_token;

    return {
      kind: entry.kind,
      label: entry.label,
      description: entry.description,
      channel: entry.channel,
      recipientPortals: entry.recipientPortals,
      sentCount,
      failedCount,
      skippedNoTokenCount,
      deliveryCount: sentCount + failedCount + skippedNoTokenCount,
      sentTodayCount: today.sent,
      failedTodayCount: today.failed,
    };
  });
}

async function fetchPushDeliveryGroupRows(
  admin: SupabaseClient,
  filters: {
    organizationId?: string;
    recipientPortal?: "parent" | "teacher" | "admin";
    rangeStart: string | null;
  },
): Promise<{ rows: PushDeliveryGroupRow[]; truncated: boolean }> {
  const rows: PushDeliveryGroupRow[] = [];
  let truncated = false;
  let offset = 0;

  while (rows.length < MAX_GROUP_ROWS) {
    let query = admin
      .from("push_notification_deliveries")
      .select("notification_kind, status")
      .eq("channel", "expo_push")
      .not("notification_kind", "is", null)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + POSTGREST_DEFAULT_MAX_ROWS - 1);

    if (filters.organizationId) {
      query = query.eq("organization_id", filters.organizationId);
    }

    if (filters.recipientPortal) {
      query = query.eq("recipient_portal", filters.recipientPortal);
    }

    if (filters.rangeStart) {
      query = query.gte("created_at", filters.rangeStart);
    }

    const { data, error } = await query;
    if (error) throw error;

    const page = (data ?? []) as PushDeliveryGroupRow[];
    rows.push(...page);

    if (page.length < POSTGREST_DEFAULT_MAX_ROWS) {
      break;
    }

    offset += page.length;
    if (rows.length >= MAX_GROUP_ROWS) {
      truncated = true;
      break;
    }
  }

  return { rows, truncated };
}

export async function fetchMobilePushAnalyticsSummary(
  admin: SupabaseClient,
  filters: DeliveryCountFilters,
): Promise<MobilePushAnalyticsResult> {
  const periodRangeStart = getActivityDateRangeStart(filters.datePreset);
  const todayRangeStart = getActivityDateRangeStart("today");

  const baseFilters = {
    organizationId: filters.organizationId,
    recipientPortal: filters.recipientPortal,
  };

  const skipTodayFetch =
    filters.datePreset === "today" && periodRangeStart === todayRangeStart;

  const [periodResult, todayResult] = await Promise.all([
    fetchPushDeliveryGroupRows(admin, {
      ...baseFilters,
      rangeStart: periodRangeStart,
    }),
    skipTodayFetch
      ? Promise.resolve(null)
      : fetchPushDeliveryGroupRows(admin, {
          ...baseFilters,
          rangeStart: todayRangeStart,
        }),
  ]);

  const periodByKind = aggregatePushDeliveryGroupRows(periodResult.rows);
  const todayRows = skipTodayFetch ? periodResult.rows : (todayResult?.rows ?? []);
  const todayByKind = aggregatePushDeliveryGroupRows(todayRows);

  return {
    kinds: buildMobilePushKindSummaries(periodByKind, todayByKind),
    truncated: periodResult.truncated || Boolean(todayResult?.truncated),
  };
}

export function mapMobileAnalyticsPortalFilter(
  surfaceFilter: "" | "parent_portal" | "teacher_portal" | "school_admin",
): "parent" | "teacher" | "admin" | undefined {
  switch (surfaceFilter) {
    case "parent_portal":
      return "parent";
    case "teacher_portal":
      return "teacher";
    case "school_admin":
      return "admin";
    default:
      return undefined;
  }
}
