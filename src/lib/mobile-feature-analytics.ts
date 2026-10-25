import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACTIVITY_ACTIONS,
  getActivityDateRangeStart,
  type ActivityDatePreset,
} from "@/lib/activity-log";

export type MobileFeatureAnalyticsSurface =
  | "parent_portal"
  | "teacher_portal"
  | "school_admin";

export type MobileFeatureAnalyticsFilters = {
  datePreset?: ActivityDatePreset;
  organizationId?: string;
  surface?: MobileFeatureAnalyticsSurface;
};

export type MobileFeatureAnalyticsRow = {
  surface: MobileFeatureAnalyticsSurface;
  featureKey: string;
  label: string;
  uniqueUsers: number;
  visits: number;
};

export type MobileFeatureAnalyticsResult = {
  rows: MobileFeatureAnalyticsRow[];
  totals: {
    visits: number;
    uniqueUsers: number;
  };
  computedAt: string;
  truncated: boolean;
};

const PAGE_SIZE = 2000;
const MAX_ROWS = 100_000;

const MOBILE_FEATURE_LABELS: Record<string, string> = {
  home: "Home",
  portal: "Home",
  dashboard: "Dashboard",
  billing: "Billing / tuition",
  messages: "Messages",
  calendar: "Calendar / events",
  attendance: "Attendance",
  feed: "School feed",
  children: "My children",
  classroom_signups: "Classroom signups",
  forms_documents: "Forms & documents",
  committees: "Committees",
  friday_branch: "Friday Branch",
  curriculum: "Curriculum",
  supply_list: "Supply list",
  teaching_schedule: "Teaching schedule",
  notifications: "Notification settings",
  photos: "Photos",
  my_students: "My students",
  my_hours: "My hours",
  admissions: "Admissions",
  students: "Students",
  more: "More menu",
  schedule: "Schedule",
  bulletin: "Bulletin",
  transactions: "Transactions",
  staff: "Staff",
  classrooms: "Classrooms",
  account: "Account",
};

const SURFACE_LABELS: Record<MobileFeatureAnalyticsSurface, string> = {
  parent_portal: "Parent portal",
  teacher_portal: "Teacher portal",
  school_admin: "School admin",
};

const SURFACE_SORT_ORDER: MobileFeatureAnalyticsSurface[] = [
  "parent_portal",
  "teacher_portal",
  "school_admin",
];

export function mobileFeatureLabel(featureKey: string): string {
  const normalized = featureKey.trim();
  if (!normalized) {
    return "Unknown";
  }
  return (
    MOBILE_FEATURE_LABELS[normalized] ??
    normalized
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export function mobileFeatureAnalyticsSurfaceLabel(
  surface: MobileFeatureAnalyticsSurface,
): string {
  return SURFACE_LABELS[surface];
}

function isTrackedSurface(
  surface: string,
): surface is MobileFeatureAnalyticsSurface {
  return (
    surface === "parent_portal" ||
    surface === "teacher_portal" ||
    surface === "school_admin"
  );
}

export async function fetchMobileFeatureAnalytics(
  admin: SupabaseClient,
  filters: MobileFeatureAnalyticsFilters = {},
): Promise<MobileFeatureAnalyticsResult> {
  const datePreset = filters.datePreset ?? "7d";
  const rangeStart = getActivityDateRangeStart(datePreset);

  const aggregate = new Map<
    string,
    { surface: MobileFeatureAnalyticsSurface; visits: number; users: Set<string> }
  >();

  let offset = 0;
  let fetched = 0;
  let truncated = false;

  while (fetched < MAX_ROWS) {
    let query = admin
      .from("activity_events")
      .select("surface, entity_id, actor_user_id")
      .eq("action", ACTIVITY_ACTIONS.MOBILE_FEATURE_VISITED)
      .in("actor_type", ["parent", "teacher", "school_admin"])
      .order("created_at", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (rangeStart) {
      query = query.gte("created_at", rangeStart);
    }

    if (filters.organizationId) {
      query = query.eq("organization_id", filters.organizationId);
    }

    if (filters.surface) {
      query = query.eq("surface", filters.surface);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    const batch = data ?? [];
    if (batch.length === 0) {
      break;
    }

    for (const row of batch) {
      const surface = String(row.surface ?? "");
      const featureKey = String(row.entity_id ?? "").trim();
      if (!isTrackedSurface(surface) || !featureKey) {
        continue;
      }

      const bucketKey = `${surface}:${featureKey}`;
      let bucket = aggregate.get(bucketKey);
      if (!bucket) {
        bucket = { surface, visits: 0, users: new Set<string>() };
        aggregate.set(bucketKey, bucket);
      }

      bucket.visits += 1;
      const actorId = row.actor_user_id ? String(row.actor_user_id) : "";
      if (actorId) {
        bucket.users.add(actorId);
      }
    }

    fetched += batch.length;
    if (batch.length < PAGE_SIZE) {
      break;
    }

    offset += PAGE_SIZE;
    if (fetched >= MAX_ROWS) {
      truncated = true;
      break;
    }
  }

  const rows: MobileFeatureAnalyticsRow[] = [...aggregate.entries()]
    .map(([bucketKey, bucket]) => {
      const featureKey = bucketKey.split(":").slice(1).join(":");
      return {
        surface: bucket.surface,
        featureKey,
        label: mobileFeatureLabel(featureKey),
        uniqueUsers: bucket.users.size,
        visits: bucket.visits,
      };
    })
    .sort((a, b) => {
      const surfaceDelta =
        SURFACE_SORT_ORDER.indexOf(a.surface) -
        SURFACE_SORT_ORDER.indexOf(b.surface);
      if (surfaceDelta !== 0) {
        return surfaceDelta;
      }
      return b.visits - a.visits;
    });

  const allUsers = new Set<string>();
  let totalVisits = 0;
  for (const bucket of aggregate.values()) {
    totalVisits += bucket.visits;
    for (const userId of bucket.users) {
      allUsers.add(userId);
    }
  }

  return {
    rows,
    totals: {
      visits: totalVisits,
      uniqueUsers: allUsers.size,
    },
    computedAt: new Date().toISOString(),
    truncated,
  };
}
