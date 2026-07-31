import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  ClipboardList,
  CreditCard,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import {
  ACTIVITY_ACTIONS,
  formatActivityActionLabel,
  getActorIdentityFromUser,
  type ActivityEventRow,
  type ActivitySeverity,
  type ActorType,
} from "@/lib/activity-log";
import { getActivityNotificationCategory } from "@/lib/school-admin/activity-notifications";

export type ActivityEventCategory =
  ReturnType<typeof getActivityNotificationCategory>;

export type ActivityEventDisplayContext = {
  displayActorName: string;
  displayActorEmail: string | null;
  resolvedActorName: string | null;
};

export type EnrichedActivityEvent = ActivityEventRow & ActivityEventDisplayContext;

const ACTION_PHRASES: Record<string, string> = {
  [ACTIVITY_ACTIONS.APPLICATION_STARTED]: "started an application",
  [ACTIVITY_ACTIONS.APPLICATION_SUBMITTED]: "submitted an application",
  [ACTIVITY_ACTIONS.APPLICATION_PAYMENT_STARTED]: "started a payment",
  [ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED]: "completed a payment",
  [ACTIVITY_ACTIONS.APPLICATION_FILE_UPLOADED]: "uploaded a file",
  [ACTIVITY_ACTIONS.APPLICATION_FILE_REMOVED]: "removed a file",
  [ACTIVITY_ACTIONS.APPLICATION_UNDER_REVIEW]: "marked an application under review",
  [ACTIVITY_ACTIONS.APPLICATION_OBSERVATION]: "moved an application to observation",
  [ACTIVITY_ACTIONS.APPLICATION_ACCEPTED]: "accepted an application",
  [ACTIVITY_ACTIONS.APPLICATION_DECLINED]: "declined an application",
  [ACTIVITY_ACTIONS.APPLICATION_WITHDRAWN]: "withdrew an application",
  [ACTIVITY_ACTIONS.POST_SUBMIT_VISIT_SCHEDULED]: "scheduled a visit",
  [ACTIVITY_ACTIONS.FORM_CREATED]: "created an application form",
  [ACTIVITY_ACTIONS.FORM_SAVED]: "saved an application form",
  [ACTIVITY_ACTIONS.FORM_PUBLISHED]: "published an application form",
  [ACTIVITY_ACTIONS.FORM_UNPUBLISHED]: "unpublished an application form",
  [ACTIVITY_ACTIONS.FORM_DUPLICATED]: "duplicated an application form",
  [ACTIVITY_ACTIONS.CHECKLIST_SAVED]: "saved an enrollment checklist",
  [ACTIVITY_ACTIONS.CHECKLIST_PUBLISHED]: "published an enrollment checklist",
  [ACTIVITY_ACTIONS.CHECKLIST_UNPUBLISHED]: "unpublished an enrollment checklist",
  [ACTIVITY_ACTIONS.ENROLLMENT_STARTED]: "started enrollment",
  [ACTIVITY_ACTIONS.ENROLLMENT_COMPLETED]: "completed enrollment",
  [ACTIVITY_ACTIONS.ENROLLMENT_CHECKLIST_ITEM_COMPLETED]:
    "completed an enrollment checklist item",
  [ACTIVITY_ACTIONS.ENROLLMENT_CHECKLIST_ITEM_FAILED]:
    "failed to complete an enrollment checklist item",
  [ACTIVITY_ACTIONS.PROGRAM_CREATED]: "created a program",
  [ACTIVITY_ACTIONS.PROGRAM_UPDATED]: "updated a program",
  [ACTIVITY_ACTIONS.PROGRAM_DELETED]: "deleted a program",
  [ACTIVITY_ACTIONS.AVAILABILITY_SLOT_TOGGLED]: "updated availability",
  [ACTIVITY_ACTIONS.PAYMENTS_STRIPE_CONNECTED]: "connected Stripe payments",
  [ACTIVITY_ACTIONS.API_ERROR]: "triggered an API error",
  [ACTIVITY_ACTIONS.ADMIN_OPERATION_FAILED]: "had an admin operation fail",
  [ACTIVITY_ACTIONS.NOTIFICATION_FAILED]: "had a notification fail",
  [ACTIVITY_ACTIONS.AUTH_OTP_REQUESTED]: "requested a verification code",
  [ACTIVITY_ACTIONS.AUTH_OTP_VERIFIED]: "verified a code",
  [ACTIVITY_ACTIONS.AUTH_OTP_FAILED]: "failed verification",
  [ACTIVITY_ACTIONS.AUTH_ACCOUNT_CREATED]: "created an account",
  [ACTIVITY_ACTIONS.AUTH_SIGNED_IN]: "signed in",
  [ACTIVITY_ACTIONS.AUTH_SIGNED_OUT]: "signed out",
  [ACTIVITY_ACTIONS.AUTH_SESSION_RESTORED]: "restored a session",
};

const ACTOR_TYPE_LABELS: Record<ActorType, string> = {
  parent: "A parent",
  school_admin: "A school admin",
  platform_admin: "A platform admin",
  system: "System",
};

function lowercaseSummaryPhrase(summary: string): string {
  const trimmed = summary.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

export function formatActivityActionPhrase(
  action: string,
  fallbackSummary?: string,
): string {
  if (ACTION_PHRASES[action]) return ACTION_PHRASES[action];
  if (fallbackSummary?.trim()) {
    return lowercaseSummaryPhrase(fallbackSummary);
  }
  return formatActivityActionLabel(action).toLowerCase();
}

export function getActivityEventCategory(action: string): ActivityEventCategory {
  return getActivityNotificationCategory(action);
}

export type ActivityEventVisual = {
  Icon: LucideIcon;
  className: string;
};

const CATEGORY_VISUALS: Record<
  ActivityEventCategory,
  { Icon: LucideIcon; className: string }
> = {
  applications: {
    Icon: ClipboardList,
    className:
      "bg-admin-accent-soft text-admin-accent border-admin-accent/20",
  },
  payments: {
    Icon: CreditCard,
    className: "bg-sky-50 text-sky-700 border-sky-200",
  },
  enrollment: {
    Icon: GraduationCap,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  other: {
    Icon: Bell,
    className: "bg-admin-neutral-bg text-admin-muted border-admin-border",
  },
};

const SEVERITY_VISUALS: Record<
  Exclude<ActivitySeverity, "info">,
  ActivityEventVisual
> = {
  error: {
    Icon: AlertCircle,
    className: "bg-red-50 text-red-700 border-red-200",
  },
  warning: {
    Icon: AlertTriangle,
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
};

export function getActivityEventVisual(
  event: Pick<ActivityEventRow, "action" | "severity">,
): ActivityEventVisual {
  if (event.severity === "error") {
    return SEVERITY_VISUALS.error;
  }
  if (event.severity === "warning") {
    return SEVERITY_VISUALS.warning;
  }

  const category = getActivityEventCategory(event.action);
  return CATEGORY_VISUALS[category];
}

function formatGuardianName(
  firstName?: string | null,
  lastName?: string | null,
): string | null {
  const name = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");
  return name || null;
}

type GuardianLookupRow = {
  user_id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
};

type ProfileLookupRow = {
  id: string;
  email: string;
};

function guardianLookupKey(userId: string, organizationId: string | null): string {
  return organizationId ? `${userId}:${organizationId}` : userId;
}

function resolveGuardianFromMap(
  map: Map<string, { name: string; email: string | null }>,
  userId: string,
  organizationId: string | null,
): { name: string; email: string | null } | null {
  if (organizationId) {
    const scoped = map.get(guardianLookupKey(userId, organizationId));
    if (scoped) return scoped;
  }
  return map.get(userId) ?? null;
}

async function fetchGuardianActorMap(
  supabase: SupabaseClient,
  userIds: string[],
): Promise<Map<string, { name: string; email: string | null }>> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  const map = new Map<string, { name: string; email: string | null }>();
  if (uniqueIds.length === 0) return map;

  const { data, error } = await supabase
    .from("guardians")
    .select("user_id, organization_id, first_name, last_name, email")
    .in("user_id", uniqueIds);

  if (error) throw error;

  for (const row of (data ?? []) as GuardianLookupRow[]) {
    const name = formatGuardianName(row.first_name, row.last_name);
    if (!name) continue;

    const entry = { name, email: row.email?.trim() || null };
    map.set(guardianLookupKey(row.user_id, row.organization_id), entry);
    if (!map.has(row.user_id)) {
      map.set(row.user_id, entry);
    }
  }

  return map;
}

async function fetchProfileEmailMap(
  supabase: SupabaseClient,
  userIds: string[],
): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  const map = new Map<string, string>();
  if (uniqueIds.length === 0) return map;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email")
    .in("id", uniqueIds);

  if (error) throw error;

  for (const row of (data ?? []) as ProfileLookupRow[]) {
    const email = row.email?.trim();
    if (email) {
      map.set(row.id, email);
    }
  }

  return map;
}

export function resolveActorDisplayLabel(
  event: Pick<
    ActivityEventRow,
    "actor_type" | "actor_name" | "actor_email" | "actor_user_id" | "organization_id"
  >,
  context?: Partial<ActivityEventDisplayContext>,
): string {
  const storedName = event.actor_name?.trim();
  if (storedName) return storedName;

  const resolvedName = context?.displayActorName?.trim();
  if (resolvedName && resolvedName !== ACTOR_TYPE_LABELS[event.actor_type]) {
    return resolvedName;
  }

  const email =
    event.actor_email?.trim() ||
    context?.displayActorEmail?.trim() ||
    null;
  if (email) return email;

  return ACTOR_TYPE_LABELS[event.actor_type];
}

export function formatActivityEventNarrative(
  event: ActivityEventRow,
  context?: Partial<ActivityEventDisplayContext>,
): string {
  const actor = resolveActorDisplayLabel(event, context);
  const phrase = formatActivityActionPhrase(event.action, event.summary);
  const school = event.organizations?.name?.trim();

  if (school) {
    return `${actor} ${phrase} for ${school}`;
  }

  return `${actor} ${phrase}`;
}

function resolveDisplayContextForEvent(
  event: ActivityEventRow,
  guardianMap: Map<string, { name: string; email: string | null }>,
  profileEmailMap: Map<string, string>,
): ActivityEventDisplayContext {
  const storedName = event.actor_name?.trim() || null;
  const storedEmail = event.actor_email?.trim() || null;

  let resolvedName = storedName;
  let resolvedEmail = storedEmail;

  if (event.actor_user_id && event.actor_type === "parent") {
    const guardian = resolveGuardianFromMap(
      guardianMap,
      event.actor_user_id,
      event.organization_id,
    );
    if (!resolvedName && guardian?.name) {
      resolvedName = guardian.name;
    }
    if (!resolvedEmail && guardian?.email) {
      resolvedEmail = guardian.email;
    }
  }

  if (event.actor_user_id && !resolvedEmail) {
    const profileEmail = profileEmailMap.get(event.actor_user_id);
    if (profileEmail) {
      resolvedEmail = profileEmail;
    }
  }

  const displayActorName =
    resolvedName ||
    resolvedEmail ||
    ACTOR_TYPE_LABELS[event.actor_type];

  return {
    displayActorName,
    displayActorEmail: resolvedEmail,
    resolvedActorName: resolvedName,
  };
}

export async function enrichActivityEventsWithActors(
  supabase: SupabaseClient,
  events: ActivityEventRow[],
): Promise<EnrichedActivityEvent[]> {
  const parentUserIds = events
    .filter((event) => event.actor_type === "parent" && event.actor_user_id)
    .map((event) => event.actor_user_id as string);

  const profileUserIds = events
    .filter(
      (event) =>
        event.actor_user_id &&
        !event.actor_email &&
        event.actor_type !== "parent" &&
        event.actor_type !== "system",
    )
    .map((event) => event.actor_user_id as string);

  const [guardianMap, profileEmailMap] = await Promise.all([
    fetchGuardianActorMap(supabase, parentUserIds),
    fetchProfileEmailMap(supabase, profileUserIds),
  ]);

  return events.map((event) => {
    const context = resolveDisplayContextForEvent(
      event,
      guardianMap,
      profileEmailMap,
    );
    return {
      ...event,
      ...context,
    };
  });
}
