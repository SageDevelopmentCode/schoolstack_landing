import type { SupabaseClient } from "@supabase/supabase-js";

export const ACTIVITY_ACTIONS = {
  APPLICATION_STARTED: "application.started",
  APPLICATION_SUBMITTED: "application.submitted",
  APPLICATION_PAYMENT_STARTED: "application.payment_started",
  APPLICATION_PAYMENT_COMPLETED: "application.payment_completed",
  APPLICATION_FILE_UPLOADED: "application.file_uploaded",
  APPLICATION_FILE_REMOVED: "application.file_removed",
  POST_SUBMIT_VISIT_SCHEDULED: "post_submit.visit_scheduled",
  FORM_CREATED: "form.created",
  FORM_SAVED: "form.saved",
  FORM_PUBLISHED: "form.published",
  FORM_UNPUBLISHED: "form.unpublished",
  FORM_DUPLICATED: "form.duplicated",
  CHECKLIST_SAVED: "checklist.saved",
  CHECKLIST_PUBLISHED: "checklist.published",
  CHECKLIST_UNPUBLISHED: "checklist.unpublished",
  PROGRAM_CREATED: "program.created",
  PROGRAM_UPDATED: "program.updated",
  PROGRAM_DELETED: "program.deleted",
  AVAILABILITY_SLOT_TOGGLED: "availability.slot_toggled",
  PAYMENTS_STRIPE_CONNECTED: "payments.stripe_connected",
  API_ERROR: "api.error",
} as const;

export type ActivityAction =
  (typeof ACTIVITY_ACTIONS)[keyof typeof ACTIVITY_ACTIONS];

export type ActorType =
  | "parent"
  | "school_admin"
  | "platform_admin"
  | "system";

export type ActivitySurface =
  | "parent_portal"
  | "school_admin"
  | "public_apply"
  | "api"
  | "system";

export type ActivitySeverity = "info" | "warning" | "error";

export type ActivityEventInput = {
  organizationId?: string | null;
  actorType: ActorType;
  actorUserId?: string | null;
  actorEmail?: string | null;
  surface: ActivitySurface;
  action: ActivityAction | string;
  entityType?: string | null;
  entityId?: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
  severity?: ActivitySeverity;
};

export type ActivityEventRow = {
  id: string;
  organization_id: string | null;
  actor_type: ActorType;
  actor_user_id: string | null;
  actor_email: string | null;
  surface: ActivitySurface;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  summary: string;
  metadata: Record<string, unknown>;
  severity: ActivitySeverity;
  created_at: string;
  organizations: {
    id: string;
    slug: string;
    name: string;
  } | null;
};

export type ActivityDatePreset = "today" | "7d" | "30d" | "all";

export type FetchActivityEventsFilters = {
  organizationId?: string;
  surface?: ActivitySurface | "parent" | "school_admin" | "system";
  action?: string;
  datePreset?: ActivityDatePreset;
  limit?: number;
};

const ACTION_LABELS: Record<string, string> = {
  [ACTIVITY_ACTIONS.APPLICATION_STARTED]: "Application started",
  [ACTIVITY_ACTIONS.APPLICATION_SUBMITTED]: "Application submitted",
  [ACTIVITY_ACTIONS.APPLICATION_PAYMENT_STARTED]: "Payment started",
  [ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED]: "Payment completed",
  [ACTIVITY_ACTIONS.APPLICATION_FILE_UPLOADED]: "File uploaded",
  [ACTIVITY_ACTIONS.APPLICATION_FILE_REMOVED]: "File removed",
  [ACTIVITY_ACTIONS.POST_SUBMIT_VISIT_SCHEDULED]: "Visit scheduled",
  [ACTIVITY_ACTIONS.FORM_CREATED]: "Form created",
  [ACTIVITY_ACTIONS.FORM_SAVED]: "Form saved",
  [ACTIVITY_ACTIONS.FORM_PUBLISHED]: "Form published",
  [ACTIVITY_ACTIONS.FORM_UNPUBLISHED]: "Form unpublished",
  [ACTIVITY_ACTIONS.FORM_DUPLICATED]: "Form duplicated",
  [ACTIVITY_ACTIONS.CHECKLIST_SAVED]: "Checklist saved",
  [ACTIVITY_ACTIONS.CHECKLIST_PUBLISHED]: "Checklist published",
  [ACTIVITY_ACTIONS.CHECKLIST_UNPUBLISHED]: "Checklist unpublished",
  [ACTIVITY_ACTIONS.PROGRAM_CREATED]: "Program created",
  [ACTIVITY_ACTIONS.PROGRAM_UPDATED]: "Program updated",
  [ACTIVITY_ACTIONS.PROGRAM_DELETED]: "Program deleted",
  [ACTIVITY_ACTIONS.AVAILABILITY_SLOT_TOGGLED]: "Availability updated",
  [ACTIVITY_ACTIONS.PAYMENTS_STRIPE_CONNECTED]: "Stripe connected",
  [ACTIVITY_ACTIONS.API_ERROR]: "API error",
};

const PARENT_SURFACES: ActivitySurface[] = ["parent_portal", "public_apply"];

export function formatActivityActionLabel(action: string): string {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  const parts = action.split(".");
  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getActivityDateRangeStart(
  preset: ActivityDatePreset,
): string | null {
  if (preset === "all") return null;

  const now = new Date();
  if (preset === "today") {
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
  }
  if (preset === "7d") {
    now.setDate(now.getDate() - 7);
    return now.toISOString();
  }
  if (preset === "30d") {
    now.setDate(now.getDate() - 30);
    return now.toISOString();
  }
  return null;
}

function surfacesForFilter(
  surface: FetchActivityEventsFilters["surface"],
): ActivitySurface[] | null {
  if (!surface) return null;
  if (surface === "parent") return PARENT_SURFACES;
  if (surface === "school_admin") return ["school_admin"];
  if (surface === "system") return ["api", "system"];
  return [surface];
}

function rowFromDb(data: Record<string, unknown>): ActivityEventRow {
  const org = data.organizations;
  return {
    id: String(data.id),
    organization_id:
      data.organization_id === null || data.organization_id === undefined
        ? null
        : String(data.organization_id),
    actor_type: data.actor_type as ActorType,
    actor_user_id:
      data.actor_user_id === null || data.actor_user_id === undefined
        ? null
        : String(data.actor_user_id),
    actor_email:
      data.actor_email === null || data.actor_email === undefined
        ? null
        : String(data.actor_email),
    surface: data.surface as ActivitySurface,
    action: String(data.action),
    entity_type:
      data.entity_type === null || data.entity_type === undefined
        ? null
        : String(data.entity_type),
    entity_id:
      data.entity_id === null || data.entity_id === undefined
        ? null
        : String(data.entity_id),
    summary: String(data.summary),
    metadata:
      data.metadata && typeof data.metadata === "object" && !Array.isArray(data.metadata)
        ? (data.metadata as Record<string, unknown>)
        : {},
    severity: (data.severity as ActivitySeverity) ?? "info",
    created_at: String(data.created_at),
    organizations:
      org && typeof org === "object" && !Array.isArray(org)
        ? {
            id: String((org as Record<string, unknown>).id),
            slug: String((org as Record<string, unknown>).slug),
            name: String((org as Record<string, unknown>).name),
          }
        : null,
  };
}

export async function logActivityEvent(
  supabase: SupabaseClient,
  event: ActivityEventInput,
): Promise<void> {
  try {
    let actorUserId = event.actorUserId ?? null;
    let actorEmail = event.actorEmail ?? null;

    if (!actorUserId && event.actorType !== "system") {
      const { data: authData } = await supabase.auth.getUser();
      actorUserId = authData.user?.id ?? null;
      actorEmail = actorEmail ?? authData.user?.email ?? null;
    }

    const { error } = await supabase.from("activity_events").insert({
      organization_id: event.organizationId ?? null,
      actor_type: event.actorType,
      actor_user_id: actorUserId,
      actor_email: actorEmail,
      surface: event.surface,
      action: event.action,
      entity_type: event.entityType ?? null,
      entity_id: event.entityId ?? null,
      summary: event.summary,
      metadata: event.metadata ?? {},
      severity: event.severity ?? "info",
    });

    if (error) {
      console.error("[activity-log] insert failed:", error.message);
    }
  } catch (error) {
    console.error("[activity-log] unexpected error:", error);
  }
}

export async function fetchActivityEvents(
  supabase: SupabaseClient,
  filters: FetchActivityEventsFilters = {},
): Promise<ActivityEventRow[]> {
  let query = supabase
    .from("activity_events")
    .select("*, organizations(id, slug, name)")
    .order("created_at", { ascending: false })
    .limit(filters.limit ?? 500);

  if (filters.organizationId) {
    query = query.eq("organization_id", filters.organizationId);
  }

  const surfaces = surfacesForFilter(filters.surface);
  if (surfaces?.length === 1) {
    query = query.eq("surface", surfaces[0]);
  } else if (surfaces && surfaces.length > 1) {
    query = query.in("surface", surfaces);
  }

  if (filters.action) {
    query = query.eq("action", filters.action);
  }

  const rangeStart = getActivityDateRangeStart(filters.datePreset ?? "7d");
  if (rangeStart) {
    query = query.gte("created_at", rangeStart);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) =>
    rowFromDb(row as Record<string, unknown>),
  );
}
