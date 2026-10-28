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

export type MobileFeatureAnalyticsUserRow = {
  userId: string;
  email: string | null;
  name: string | null;
  visits: number;
  firstVisitAt: string;
  lastVisitAt: string;
};

export type MobileFeatureAnalyticsUsersResult = {
  surface: MobileFeatureAnalyticsSurface;
  featureKey: string;
  label: string;
  rows: MobileFeatureAnalyticsUserRow[];
  computedAt: string;
  truncated: boolean;
};

export type MobileFeatureAnalyticsUsersFilters = MobileFeatureAnalyticsFilters & {
  surface: MobileFeatureAnalyticsSurface;
  featureKey: string;
};

export type MobileFeatureVisitEventRow = {
  surface: string;
  entity_id: string | null;
  metadata: unknown;
  actor_user_id: string | null;
  actor_email: string | null;
  actor_name: string | null;
  created_at: string;
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

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function mobileFeatureKeyFromActivityRow(row: {
  entity_id: string | null;
  metadata: unknown;
}): string | null {
  const metadata = row.metadata;
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    const raw = (metadata as Record<string, unknown>).featureKey;
    if (typeof raw === "string") {
      const key = raw.trim();
      if (key) {
        return key;
      }
    }
  }

  const entityId = row.entity_id ? String(row.entity_id).trim() : "";
  if (entityId && !UUID_PATTERN.test(entityId)) {
    return entityId;
  }

  return null;
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

type MobileFeatureUserBucket = MobileFeatureAnalyticsUserRow;

function applyMobileFeatureUserVisitEvent(
  buckets: Map<string, MobileFeatureUserBucket>,
  row: MobileFeatureVisitEventRow,
  targetSurface: MobileFeatureAnalyticsSurface,
  targetFeatureKey: string,
): void {
  const surface = String(row.surface ?? "");
  if (surface !== targetSurface) {
    return;
  }

  const featureKey = mobileFeatureKeyFromActivityRow({
    entity_id: row.entity_id,
    metadata: row.metadata,
  });
  if (featureKey !== targetFeatureKey) {
    return;
  }

  const actorId = row.actor_user_id ? String(row.actor_user_id) : "";
  if (!actorId) {
    return;
  }

  const createdAt = String(row.created_at);
  const email = row.actor_email ? String(row.actor_email) : null;
  const name = row.actor_name?.trim() ? String(row.actor_name).trim() : null;

  const bucket = buckets.get(actorId);
  if (!bucket) {
    buckets.set(actorId, {
      userId: actorId,
      email,
      name,
      visits: 1,
      firstVisitAt: createdAt,
      lastVisitAt: createdAt,
    });
    return;
  }

  bucket.visits += 1;
  if (createdAt < bucket.firstVisitAt) {
    bucket.firstVisitAt = createdAt;
  }
  if (createdAt > bucket.lastVisitAt) {
    bucket.lastVisitAt = createdAt;
    if (email) {
      bucket.email = email;
    }
    if (name) {
      bucket.name = name;
    }
  }
}

export function aggregateMobileFeatureUserRows(
  events: MobileFeatureVisitEventRow[],
  targetSurface: MobileFeatureAnalyticsSurface,
  targetFeatureKey: string,
): MobileFeatureAnalyticsUserRow[] {
  const normalizedKey = targetFeatureKey.trim();
  const buckets = new Map<string, MobileFeatureUserBucket>();
  for (const event of events) {
    applyMobileFeatureUserVisitEvent(buckets, event, targetSurface, normalizedKey);
  }

  return [...buckets.values()].sort((a, b) =>
    b.lastVisitAt.localeCompare(a.lastVisitAt),
  );
}

export async function fetchMobileFeatureAnalyticsUsers(
  admin: SupabaseClient,
  filters: MobileFeatureAnalyticsUsersFilters,
): Promise<MobileFeatureAnalyticsUsersResult> {
  const datePreset = filters.datePreset ?? "7d";
  const rangeStart = getActivityDateRangeStart(datePreset);
  const targetFeatureKey = filters.featureKey.trim();
  const targetSurface = filters.surface;

  const buckets = new Map<string, MobileFeatureUserBucket>();

  let offset = 0;
  let fetched = 0;
  let truncated = false;

  while (fetched < MAX_ROWS) {
    let query = admin
      .from("activity_events")
      .select(
        "surface, entity_id, metadata, actor_user_id, actor_email, actor_name, created_at",
      )
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

    query = query.eq("surface", targetSurface);

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    const batch = data ?? [];
    if (batch.length === 0) {
      break;
    }

    for (const row of batch) {
      applyMobileFeatureUserVisitEvent(
        buckets,
        {
          surface: String(row.surface ?? ""),
          entity_id: row.entity_id as string | null,
          metadata: row.metadata,
          actor_user_id: row.actor_user_id as string | null,
          actor_email: row.actor_email as string | null,
          actor_name: row.actor_name as string | null,
          created_at: String(row.created_at),
        },
        targetSurface,
        targetFeatureKey,
      );
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

  const rows = [...buckets.values()].sort((a, b) =>
    b.lastVisitAt.localeCompare(a.lastVisitAt),
  );

  return {
    surface: targetSurface,
    featureKey: targetFeatureKey,
    label: mobileFeatureLabel(targetFeatureKey),
    rows,
    computedAt: new Date().toISOString(),
    truncated,
  };
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
      .select("surface, entity_id, metadata, actor_user_id")
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
      const featureKey = mobileFeatureKeyFromActivityRow({
        entity_id: row.entity_id as string | null,
        metadata: row.metadata,
      });
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
