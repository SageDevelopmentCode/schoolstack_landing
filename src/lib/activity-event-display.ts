import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CalendarDays,
  ClipboardList,
  CreditCard,
  GraduationCap,
  Heart,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { formatActivityClientLabel } from "@/lib/activity-client";
import {
  ACTIVITY_ACTIONS,
  formatActivityActionLabel,
  type ActivityEventRow,
  type ActivitySeverity,
  type ActorType,
} from "@/lib/activity-log";
import {
  resolveSenderDisplayName,
  resolveThreadRecipientLabels,
} from "@/lib/messages/message-notification-labels";
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
  [ACTIVITY_ACTIONS.POST_SUBMIT_STEP_COMPLETED_MANUALLY]:
    "marked a post-application step complete",
  [ACTIVITY_ACTIONS.POST_SUBMIT_STEP_MANUAL_COMPLETION_UNDONE]:
    "undid a manual post-application step completion",
  [ACTIVITY_ACTIONS.FORM_CREATED]: "created an application form",
  [ACTIVITY_ACTIONS.FORM_SAVED]: "saved an application form",
  [ACTIVITY_ACTIONS.FORM_PUBLISHED]: "published an application form",
  [ACTIVITY_ACTIONS.FORM_UNPUBLISHED]: "unpublished an application form",
  [ACTIVITY_ACTIONS.FORM_DUPLICATED]: "duplicated an application form",
  [ACTIVITY_ACTIONS.CHECKLIST_SAVED]: "saved an enrollment checklist",
  [ACTIVITY_ACTIONS.CHECKLIST_PUBLISHED]: "published an enrollment checklist",
  [ACTIVITY_ACTIONS.CHECKLIST_UNPUBLISHED]: "unpublished an enrollment checklist",
  [ACTIVITY_ACTIONS.CHECKLIST_RESIGN_REQUESTED]: "requested enrollment agreement re-sign",
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
  [ACTIVITY_ACTIONS.TUITION_AUTOPAY_ENABLED]: "enabled tuition autopay",
  [ACTIVITY_ACTIONS.TUITION_AUTOPAY_DISABLED]: "disabled tuition autopay",
  [ACTIVITY_ACTIONS.TUITION_AUTOPAY_SUCCEEDED]: "processed a tuition autopay charge",
  [ACTIVITY_ACTIONS.TUITION_AUTOPAY_FAILED]: "had a tuition autopay charge fail",
  [ACTIVITY_ACTIONS.TUITION_PAYMENT_METHOD_SAVED]: "saved a tuition payment method",
  [ACTIVITY_ACTIONS.TUITION_RATE_PLAN_CREATED]: "created a tuition rate plan",
  [ACTIVITY_ACTIONS.TUITION_RATE_PLAN_UPDATED]: "updated a tuition rate plan",
  [ACTIVITY_ACTIONS.TUITION_ASSIGNMENT_CREATED]: "assigned tuition",
  [ACTIVITY_ACTIONS.TUITION_ASSIGNMENT_UPDATED]: "updated a tuition assignment",
  [ACTIVITY_ACTIONS.TUITION_ASSIGNMENT_UNASSIGNED]: "unassigned tuition",
  [ACTIVITY_ACTIONS.TUITION_ORG_SETTINGS_UPDATED]: "updated tuition settings",
  [ACTIVITY_ACTIONS.TUITION_LATE_FEE_OVERRIDE_UPDATED]: "updated a late fee override",
  [ACTIVITY_ACTIONS.TUITION_LATE_FEE_OVERRIDE_DELETED]: "deleted a late fee override",
  [ACTIVITY_ACTIONS.TUITION_ADJUSTMENT_RULE_CREATED]: "created a tuition adjustment rule",
  [ACTIVITY_ACTIONS.TUITION_ADJUSTMENT_RULE_UPDATED]: "updated a tuition adjustment rule",
  [ACTIVITY_ACTIONS.TUITION_ADJUSTMENT_CREATED]: "created a tuition adjustment",
  [ACTIVITY_ACTIONS.TUITION_ADJUSTMENT_REVOKED]: "revoked a tuition adjustment",
  [ACTIVITY_ACTIONS.TUITION_BILLING_SPLITS_UPDATED]: "updated billing splits",
  [ACTIVITY_ACTIONS.TUITION_CHARGE_INVOICE_SENT]: "sent a tuition invoice",
  [ACTIVITY_ACTIONS.TUITION_CHARGE_WAIVED]: "waived a tuition charge",
  [ACTIVITY_ACTIONS.TUITION_PAYMENT_MANUAL]: "recorded a manual tuition payment",
  [ACTIVITY_ACTIONS.TUITION_PAYMENT_COMPLETED]: "completed a tuition payment",
  [ACTIVITY_ACTIONS.TUITION_PAYMENT_REFUNDED]: "refunded a tuition payment",
  [ACTIVITY_ACTIONS.TUITION_BILLING_RUN_COMPLETED]: "completed a tuition billing run",
  [ACTIVITY_ACTIONS.TUITION_LATE_FEE_APPLIED]: "applied tuition late fees",
  [ACTIVITY_ACTIONS.COMMITTEE_JOIN_REQUESTED]: "requested to join a committee",
  [ACTIVITY_ACTIONS.COMMITTEE_JOIN_APPROVED]: "approved a committee join request",
  [ACTIVITY_ACTIONS.COMMITTEE_JOIN_DECLINED]: "declined a committee join request",
  [ACTIVITY_ACTIONS.COMMITTEE_JOIN_WITHDRAWN]: "withdrew a committee join request",
  [ACTIVITY_ACTIONS.FRIDAY_BRANCH_CLASS_ENROLLED]: "signed up for a Friday Branch class",
  [ACTIVITY_ACTIONS.FRIDAY_BRANCH_CLASS_WITHDRAWN]: "withdrew from a Friday Branch class",
  [ACTIVITY_ACTIONS.BULLETIN_POST_PUBLISHED]: "published a bulletin post",
  [ACTIVITY_ACTIONS.CALENDAR_EVENT_POSTED]: "posted a calendar event",
  [ACTIVITY_ACTIONS.COOP_SUPPLY_ITEM_ADDED]: "added a co-op supply item",
  [ACTIVITY_ACTIONS.COOP_SUPPLY_ITEM_UPDATED]: "updated a co-op supply item",
  [ACTIVITY_ACTIONS.COOP_TEACHING_WEEK_ADDED]: "added a co-op teaching week",
  [ACTIVITY_ACTIONS.COOP_TEACHING_WEEK_UPDATED]: "updated a co-op teaching week",
  [ACTIVITY_ACTIONS.COOP_CURRICULUM_UPDATED]: "updated co-op curriculum",
  [ACTIVITY_ACTIONS.TEACHER_PARENT_FORM_PUBLISHED]: "published a form for families to sign",
  [ACTIVITY_ACTIONS.TEACHER_PARENT_FORM_RESPONSE_SIGNED]: "signed a teacher form",
};

const ACTOR_TYPE_LABELS: Record<ActorType, string> = {
  parent: "A parent",
  teacher: "A teacher",
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
  committees: {
    Icon: Heart,
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
  program_signups: {
    Icon: CalendarDays,
    className: "bg-violet-50 text-violet-700 border-violet-200",
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

const MESSAGE_EVENT_VISUAL: ActivityEventVisual = {
  Icon: MessageSquare,
  className: "bg-sky-50 text-sky-700 border-sky-200",
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
  if (event.action === ACTIVITY_ACTIONS.MESSAGES_RECEIVED) {
    return MESSAGE_EVENT_VISUAL;
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

type StaffLookupRow = {
  user_id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
};

function metadataString(
  metadata: Record<string, unknown>,
  key: string,
): string | null {
  const value = metadata[key];
  if (typeof value !== "string" || !value.trim()) return null;
  return value.trim();
}

function metadataStringArray(
  metadata: Record<string, unknown>,
  key: string,
): string[] {
  const value = metadata[key];
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    )
    .map((item) => item.trim());
}

function joinRecipientLabels(labels: string[]): string {
  if (labels.length === 0) return "the recipient";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

function parseLegacyMessageSummary(
  summary: string,
): { senderName: string; preview: string } | null {
  const colonIndex = summary.indexOf(": ");
  if (colonIndex <= 0) return null;

  const senderName = summary.slice(0, colonIndex).trim();
  const preview = summary.slice(colonIndex + 2).trim();
  if (!senderName || !preview) return null;

  return { senderName, preview };
}

function inferMessageViewer(
  event: Pick<ActivityEventRow, "actor_type" | "metadata">,
): "parent" | "teacher" | "admin" {
  const senderPortal = metadataString(event.metadata, "senderPortal");
  if (senderPortal === "parent" || senderPortal === "teacher") {
    return senderPortal;
  }
  if (senderPortal === "admin") return "admin";

  if (event.actor_type === "parent") return "parent";
  if (event.actor_type === "teacher") return "teacher";
  if (event.actor_type === "school_admin") return "admin";
  return "parent";
}

export function formatMessageActivityNarrative(
  event: ActivityEventRow,
  context?: Partial<ActivityEventDisplayContext>,
): string {
  const school = event.organizations?.name?.trim();
  const recipientLabels = metadataStringArray(event.metadata, "recipientLabels");
  const legacySummary = parseLegacyMessageSummary(event.summary);
  const preview =
    metadataString(event.metadata, "preview") ??
    legacySummary?.preview ??
    event.summary.trim();

  const senderName =
    metadataString(event.metadata, "senderName") ??
    legacySummary?.senderName ??
    resolveActorDisplayLabel(event, context);

  if (recipientLabels.length > 0) {
    const recipients = joinRecipientLabels(recipientLabels);
    if (school) {
      return `${senderName} from ${school} messaged ${recipients}: ${preview}`;
    }
    return `${senderName} messaged ${recipients}: ${preview}`;
  }

  const actor = resolveActorDisplayLabel(event, context);
  if (school) {
    return `${actor} sent a message for ${school}: ${preview}`;
  }
  return `${actor} sent a message: ${preview}`;
}

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

function staffLookupKey(userId: string, organizationId: string | null): string {
  return organizationId ? `${userId}:${organizationId}` : userId;
}

function resolveStaffFromMap(
  map: Map<string, { name: string; email: string | null }>,
  userId: string,
  organizationId: string | null,
): { name: string; email: string | null } | null {
  if (organizationId) {
    const scoped = map.get(staffLookupKey(userId, organizationId));
    if (scoped) return scoped;
  }
  return map.get(userId) ?? null;
}

async function fetchStaffActorMap(
  supabase: SupabaseClient,
  userIds: string[],
): Promise<Map<string, { name: string; email: string | null }>> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  const map = new Map<string, { name: string; email: string | null }>();
  if (uniqueIds.length === 0) return map;

  const { data, error } = await supabase
    .from("staff_members")
    .select("user_id, organization_id, first_name, last_name, email")
    .in("user_id", uniqueIds);

  if (error) throw error;

  for (const row of (data ?? []) as StaffLookupRow[]) {
    const name = formatGuardianName(row.first_name, row.last_name);
    if (!name) continue;

    const entry = { name, email: row.email?.trim() || null };
    map.set(staffLookupKey(row.user_id, row.organization_id), entry);
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
    | "action"
    | "actor_type"
    | "actor_name"
    | "actor_email"
    | "actor_user_id"
    | "organization_id"
    | "metadata"
    | "summary"
  >,
  context?: Partial<ActivityEventDisplayContext>,
): string {
  if (event.action === ACTIVITY_ACTIONS.MESSAGES_RECEIVED) {
    const metadataSenderName = metadataString(event.metadata, "senderName");
    if (metadataSenderName) return metadataSenderName;

    const legacySummary = parseLegacyMessageSummary(event.summary);
    if (legacySummary?.senderName) return legacySummary.senderName;
  }

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

function appendActivityClientLabel(
  narrative: string,
  metadata: Record<string, unknown> | undefined,
): string {
  const clientLabel = formatActivityClientLabel(metadata);
  return clientLabel ? `${narrative} (${clientLabel})` : narrative;
}

export function formatActivityEventNarrative(
  event: ActivityEventRow,
  context?: Partial<ActivityEventDisplayContext>,
): string {
  if (
    event.action === ACTIVITY_ACTIONS.API_ERROR ||
    event.action === ACTIVITY_ACTIONS.ADMIN_OPERATION_FAILED ||
    event.action === ACTIVITY_ACTIONS.NOTIFICATION_FAILED
  ) {
    return appendActivityClientLabel(
      event.summary.trim() || formatActivityActionLabel(event.action),
      event.metadata,
    );
  }

  if (event.action === ACTIVITY_ACTIONS.MESSAGES_RECEIVED) {
    return appendActivityClientLabel(
      formatMessageActivityNarrative(event, context),
      event.metadata,
    );
  }

  const actor = resolveActorDisplayLabel(event, context);
  const phrase = formatActivityActionPhrase(event.action, event.summary);
  const school = event.organizations?.name?.trim();

  if (school) {
    return appendActivityClientLabel(`${actor} ${phrase} for ${school}`, event.metadata);
  }

  return appendActivityClientLabel(`${actor} ${phrase}`, event.metadata);
}

function resolveDisplayContextForEvent(
  event: ActivityEventRow,
  guardianMap: Map<string, { name: string; email: string | null }>,
  staffMap: Map<string, { name: string; email: string | null }>,
  profileEmailMap: Map<string, string>,
): ActivityEventDisplayContext {
  const storedName = event.actor_name?.trim() || null;
  const storedEmail = event.actor_email?.trim() || null;

  let resolvedName = storedName;
  let resolvedEmail = storedEmail;

  const actorUserId =
    event.actor_user_id ??
    (event.action === ACTIVITY_ACTIONS.MESSAGES_RECEIVED
      ? metadataString(event.metadata, "senderUserId")
      : null);

  if (actorUserId && event.actor_type === "parent") {
    const guardian = resolveGuardianFromMap(
      guardianMap,
      actorUserId,
      event.organization_id,
    );
    if (!resolvedName && guardian?.name) {
      resolvedName = guardian.name;
    }
    if (!resolvedEmail && guardian?.email) {
      resolvedEmail = guardian.email;
    }
  }

  if (
    actorUserId &&
    (event.actor_type === "teacher" || event.actor_type === "school_admin")
  ) {
    const staff = resolveStaffFromMap(
      staffMap,
      actorUserId,
      event.organization_id,
    );
    if (!resolvedName && staff?.name) {
      resolvedName = staff.name;
    }
    if (!resolvedEmail && staff?.email) {
      resolvedEmail = staff.email;
    }
  }

  if (
    event.action === ACTIVITY_ACTIONS.MESSAGES_RECEIVED &&
    actorUserId &&
    !resolvedName
  ) {
    const guardian = resolveGuardianFromMap(
      guardianMap,
      actorUserId,
      event.organization_id,
    );
    if (guardian?.name) {
      resolvedName = guardian.name;
    }
    if (!resolvedEmail && guardian?.email) {
      resolvedEmail = guardian.email;
    }

    const staff = resolveStaffFromMap(
      staffMap,
      actorUserId,
      event.organization_id,
    );
    if (!resolvedName && staff?.name) {
      resolvedName = staff.name;
    }
    if (!resolvedEmail && staff?.email) {
      resolvedEmail = staff.email;
    }
  }

  if (actorUserId && !resolvedEmail) {
    const profileEmail = profileEmailMap.get(actorUserId);
    if (profileEmail) {
      resolvedEmail = profileEmail;
    }
  }

  const metadataSenderName =
    event.action === ACTIVITY_ACTIONS.MESSAGES_RECEIVED
      ? metadataString(event.metadata, "senderName")
      : null;

  const displayActorName =
    metadataSenderName ||
    resolvedName ||
    resolvedEmail ||
    ACTOR_TYPE_LABELS[event.actor_type];

  return {
    displayActorName,
    displayActorEmail: resolvedEmail,
    resolvedActorName: metadataSenderName || resolvedName,
  };
}

async function enrichMessageEventMetadata(
  supabase: SupabaseClient,
  event: ActivityEventRow,
  displayActorName: string,
): Promise<Record<string, unknown>> {
  if (event.action !== ACTIVITY_ACTIONS.MESSAGES_RECEIVED) {
    return event.metadata;
  }

  const metadata = { ...event.metadata };
  const senderUserId =
    metadataString(metadata, "senderUserId") ?? event.actor_user_id;
  const threadId = metadataString(metadata, "threadId");
  const organizationId = event.organization_id;
  const schoolName = event.organizations?.name?.trim();

  if (!metadata.senderName && displayActorName !== ACTOR_TYPE_LABELS[event.actor_type]) {
    metadata.senderName = displayActorName;
  }

  if (
    metadataStringArray(metadata, "recipientLabels").length === 0 &&
    senderUserId &&
    threadId &&
    organizationId &&
    schoolName
  ) {
    const schoolOfficeLabel = `${schoolName} Office`;
    metadata.recipientLabels = await resolveThreadRecipientLabels(
      supabase,
      organizationId,
      threadId,
      senderUserId,
      schoolOfficeLabel,
      inferMessageViewer(event),
    );
  }

  if (!metadataString(metadata, "preview")) {
    const legacySummary = parseLegacyMessageSummary(event.summary);
    if (legacySummary?.preview) {
      metadata.preview = legacySummary.preview;
    }
  }

  if (!metadata.senderName && senderUserId && organizationId && schoolName) {
    metadata.senderName = await resolveSenderDisplayName(
      supabase,
      organizationId,
      senderUserId,
      inferMessageViewer(event),
      `${schoolName} Office`,
    );
  }

  return metadata;
}

export async function enrichActivityEventsWithActors(
  supabase: SupabaseClient,
  events: ActivityEventRow[],
): Promise<EnrichedActivityEvent[]> {
  const messageSenderUserIds = events
    .filter((event) => event.action === ACTIVITY_ACTIONS.MESSAGES_RECEIVED)
    .map(
      (event) =>
        metadataString(event.metadata, "senderUserId") ?? event.actor_user_id,
    )
    .filter((userId): userId is string => Boolean(userId));

  const parentUserIds = [
    ...events
      .filter((event) => event.actor_type === "parent" && event.actor_user_id)
      .map((event) => event.actor_user_id as string),
    ...messageSenderUserIds,
  ];

  const staffUserIds = [
    ...events
      .filter(
        (event) =>
          (event.actor_type === "teacher" || event.actor_type === "school_admin") &&
          event.actor_user_id,
      )
      .map((event) => event.actor_user_id as string),
    ...messageSenderUserIds,
  ];

  const profileUserIds = events
    .filter(
      (event) =>
        event.actor_user_id &&
        !event.actor_email &&
        event.actor_type !== "parent" &&
        event.actor_type !== "system",
    )
    .map((event) => event.actor_user_id as string);

  const [guardianMap, staffMap, profileEmailMap] = await Promise.all([
    fetchGuardianActorMap(supabase, parentUserIds),
    fetchStaffActorMap(supabase, staffUserIds),
    fetchProfileEmailMap(supabase, [
      ...profileUserIds,
      ...messageSenderUserIds,
    ]),
  ]);

  const enrichedEvents: EnrichedActivityEvent[] = [];

  for (const event of events) {
    const context = resolveDisplayContextForEvent(
      event,
      guardianMap,
      staffMap,
      profileEmailMap,
    );
    const metadata = await enrichMessageEventMetadata(
      supabase,
      event,
      context.displayActorName,
    );
    enrichedEvents.push({
      ...event,
      metadata,
      ...context,
    });
  }

  return enrichedEvents;
}
