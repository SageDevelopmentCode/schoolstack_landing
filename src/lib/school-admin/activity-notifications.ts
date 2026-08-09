import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACTIVITY_ACTIONS,
  formatActivityActionLabel,
} from "@/lib/activity-log";
import { extractStudentLabel } from "@/lib/admissions/application-submissions";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { getPaymentById } from "@/lib/stripe/application-payments";
import { formatCents } from "@/lib/tuition/pricing";

export const SCHOOL_ADMIN_NOTIFICATION_ACTIONS = [
  ACTIVITY_ACTIONS.APPLICATION_SUBMITTED,
  ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED,
  ACTIVITY_ACTIONS.APPLICATION_UNDER_REVIEW,
  ACTIVITY_ACTIONS.APPLICATION_OBSERVATION,
  ACTIVITY_ACTIONS.APPLICATION_ACCEPTED,
  ACTIVITY_ACTIONS.APPLICATION_DECLINED,
  ACTIVITY_ACTIONS.APPLICATION_WITHDRAWN,
  ACTIVITY_ACTIONS.POST_SUBMIT_VISIT_SCHEDULED,
  ACTIVITY_ACTIONS.ENROLLMENT_COMPLETED,
  ACTIVITY_ACTIONS.PAYMENTS_STRIPE_CONNECTED,
  ACTIVITY_ACTIONS.TUITION_AUTOPAY_SUCCEEDED,
  ACTIVITY_ACTIONS.TUITION_AUTOPAY_FAILED,
  ACTIVITY_ACTIONS.COMMITTEE_JOIN_REQUESTED,
  ACTIVITY_ACTIONS.MESSAGES_RECEIVED,
] as const;

export type ActivityNotificationCategory =
  | "applications"
  | "payments"
  | "enrollment"
  | "committees"
  | "other";

export type SchoolAdminActivityNotification = {
  id: string;
  action: string;
  title: string;
  summary: string;
  subjectLabel: string | null;
  guardianLabel: string | null;
  programName: string | null;
  detail: string;
  createdAt: string;
  href: string;
  ctaLabel: string;
  category: ActivityNotificationCategory;
};

export type ActivityEventForNotification = {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  summary: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type SchoolAdminActivityNotificationsPage = {
  notifications: SchoolAdminActivityNotification[];
  nextCursor: string | null;
  hasMore: boolean;
};

type ApplicationNotificationContext = {
  subjectLabel: string | null;
  guardianLabel: string | null;
  programName: string | null;
};

export type TuitionNotificationContext = {
  subjectLabel: string | null;
  chargeLabel: string | null;
  familyName: string | null;
  studentName: string | null;
};

const NOTIFICATION_TITLE_BY_ACTION: Partial<Record<string, string>> = {
  [ACTIVITY_ACTIONS.APPLICATION_SUBMITTED]: "New application submitted",
  [ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED]: "Payment received",
  [ACTIVITY_ACTIONS.APPLICATION_UNDER_REVIEW]: "Application under review",
  [ACTIVITY_ACTIONS.APPLICATION_OBSERVATION]: "Application moved to observation",
  [ACTIVITY_ACTIONS.APPLICATION_ACCEPTED]: "Application accepted",
  [ACTIVITY_ACTIONS.APPLICATION_DECLINED]: "Application declined",
  [ACTIVITY_ACTIONS.APPLICATION_WITHDRAWN]: "Application withdrawn",
  [ACTIVITY_ACTIONS.POST_SUBMIT_VISIT_SCHEDULED]: "Visit scheduled",
  [ACTIVITY_ACTIONS.ENROLLMENT_COMPLETED]: "Enrollment completed",
  [ACTIVITY_ACTIONS.PAYMENTS_STRIPE_CONNECTED]: "Payments ready",
  [ACTIVITY_ACTIONS.TUITION_AUTOPAY_SUCCEEDED]: "Autopay charge succeeded",
  [ACTIVITY_ACTIONS.TUITION_AUTOPAY_FAILED]: "Autopay charge failed",
  [ACTIVITY_ACTIONS.COMMITTEE_JOIN_REQUESTED]: "Committee join request",
  [ACTIVITY_ACTIONS.MESSAGES_RECEIVED]: "New message",
};

const DEFAULT_NOTIFICATION_DAYS = 30;
const DEFAULT_NOTIFICATION_PAGE_SIZE = 15;
const MAX_NOTIFICATION_PAGE_SIZE = 30;

export const ACTIVITY_NOTIFICATION_DAYS = DEFAULT_NOTIFICATION_DAYS;

const APPLICATION_CONTEXT_SELECT = `
  id,
  responses,
  students:student_id (
    first_name,
    last_name
  ),
  guardians:primary_guardian_id (
    first_name,
    last_name
  ),
  programs (
    name
  )
`;

function metadataString(
  metadata: Record<string, unknown>,
  key: string,
): string | null {
  const value = metadata[key];
  if (typeof value !== "string" || !value.trim()) return null;
  return value.trim();
}

function metadataNumber(
  metadata: Record<string, unknown>,
  key: string,
): number | null {
  const value = metadata[key];
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function formatSubjectShortLabel(
  first?: string | null,
  last?: string | null,
): string | null {
  const firstName = first?.trim();
  const lastName = last?.trim();

  if (firstName && lastName) {
    return `${firstName} ${lastName.charAt(0).toUpperCase()}.`;
  }
  if (firstName) return firstName;
  if (lastName) return lastName;
  return null;
}

export function shortenSubjectLabel(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return trimmed;

  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return trimmed;

  const first = parts[0];
  const last = parts[parts.length - 1];
  return `${first} ${last.charAt(0).toUpperCase()}.`;
}

function parseStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (typeof entry === "string") {
      result[key] = entry;
    } else if (entry != null) {
      result[key] = String(entry);
    }
  }
  return result;
}

export function encodeActivityNotificationCursor(
  createdAt: string,
  id: string,
): string {
  return `${createdAt}|${id}`;
}

export function decodeActivityNotificationCursor(
  cursor: string,
): { createdAt: string; id: string } | null {
  const separatorIndex = cursor.indexOf("|");
  if (separatorIndex <= 0) return null;

  const createdAt = cursor.slice(0, separatorIndex);
  const id = cursor.slice(separatorIndex + 1);
  if (!createdAt || !id) return null;

  return { createdAt, id };
}

export function getActivityNotificationCategory(
  action: string,
): ActivityNotificationCategory {
  if (
    action.startsWith("application.") ||
    action === ACTIVITY_ACTIONS.POST_SUBMIT_VISIT_SCHEDULED
  ) {
    return "applications";
  }
  if (
    action.startsWith("enrollment.") ||
    action === ACTIVITY_ACTIONS.ENROLLMENT_COMPLETED
  ) {
    return "enrollment";
  }
  if (
    action.startsWith("payments.") ||
    action.startsWith("tuition.") ||
    action === ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED
  ) {
    return "payments";
  }
  if (action.startsWith("committee.")) {
    return "committees";
  }
  return "other";
}

export function formatActivityNotificationTitle(action: string): string {
  return (
    NOTIFICATION_TITLE_BY_ACTION[action] ?? formatActivityActionLabel(action)
  );
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function submissionsHref(slug: string, applicationId: string): string {
  return `${schoolAdminPath(slug, "admissions", "submissions")}?application=${applicationId}`;
}

function paymentsHref(slug: string): string {
  return schoolAdminPath(slug, "admissions", "payments");
}

function committeesHref(slug: string, committeeId?: string | null): string {
  const base = schoolAdminPath(slug, "committees");
  if (!committeeId) return base;
  return `${base}?committee=${committeeId}&section=members`;
}

function tuitionHref(slug: string): string {
  return schoolAdminPath(slug, "my_school", "tuition");
}

function mapApplicationRowToContext(
  row: Record<string, unknown>,
): ApplicationNotificationContext {
  const responses = parseStringRecord(row.responses);
  const student = row.students as
    | { first_name?: string; last_name?: string }
    | { first_name?: string; last_name?: string }[]
    | null;
  const studentRow = Array.isArray(student) ? student[0] : student;
  const studentFromTable = studentRow
    ? formatSubjectShortLabel(studentRow.first_name, studentRow.last_name)
    : null;
  const studentFromResponses = extractStudentLabel(responses);
  const subjectLabel =
    studentFromTable ??
    (studentFromResponses ? shortenSubjectLabel(studentFromResponses) : null);

  const program = row.programs as { name?: string } | { name?: string }[] | null;
  const programRow = Array.isArray(program) ? program[0] : program;
  const guardian = row.guardians as
    | { first_name?: string; last_name?: string }
    | { first_name?: string; last_name?: string }[]
    | null;
  const guardianRow = Array.isArray(guardian) ? guardian[0] : guardian;
  const guardianLabel = guardianRow
    ? formatSubjectShortLabel(guardianRow.first_name, guardianRow.last_name)
    : null;

  return {
    subjectLabel,
    guardianLabel,
    programName: programRow?.name ? String(programRow.name) : null,
  };
}

async function fetchApplicationNotificationContexts(
  supabase: SupabaseClient,
  applicationIds: string[],
): Promise<Map<string, ApplicationNotificationContext>> {
  const uniqueIds = [...new Set(applicationIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("applications")
    .select(APPLICATION_CONTEXT_SELECT)
    .in("id", uniqueIds);

  if (error) throw error;

  const contexts = new Map<string, ApplicationNotificationContext>();
  for (const row of data ?? []) {
    contexts.set(
      String(row.id),
      mapApplicationRowToContext(row as Record<string, unknown>),
    );
  }
  return contexts;
}

type PaymentNotificationContext = {
  amountCents: number;
  currency: string;
  label: string | null;
};

function resolveApplicationPaymentFeeLabel(
  paymentLabel: string | null | undefined,
  entityType: string | null | undefined,
): string {
  if (paymentLabel?.trim()) return paymentLabel.trim();
  if (entityType === "application") return "application fee";
  return "fee";
}

export function formatGuardianActionForStudent(
  guardianLabel: string | null | undefined,
  studentLabel: string,
  guardianActionPhrase: string,
  studentOnlyPhrase: string,
): string {
  if (guardianLabel && guardianLabel !== studentLabel) {
    return `${guardianLabel} ${guardianActionPhrase} for ${studentLabel}`;
  }
  return studentOnlyPhrase;
}

function resolvePaymentIdForEvent(
  event: ActivityEventForNotification,
): string | null {
  const fromMetadata = metadataString(event.metadata, "paymentId");
  if (fromMetadata) return fromMetadata;

  if (event.entity_type === "payment" && event.entity_id) {
    return event.entity_id;
  }

  return null;
}

function formatPaymentAmountLabel(
  amount: Pick<PaymentNotificationContext, "amountCents" | "currency"> | null,
): string | null {
  if (!amount || amount.amountCents <= 0) return null;
  return formatCents(amount.amountCents, amount.currency);
}

async function fetchPaymentNotificationContexts(
  supabase: SupabaseClient,
  events: ActivityEventForNotification[],
): Promise<Map<string, PaymentNotificationContext>> {
  const paymentIds = new Set<string>();
  const directAmounts = new Map<string, PaymentNotificationContext>();

  for (const event of events) {
    if (event.action !== ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED) {
      continue;
    }

    const amountCents = metadataNumber(event.metadata, "amountCents");
    if (amountCents != null && amountCents > 0) {
      directAmounts.set(event.id, {
        amountCents,
        currency: metadataString(event.metadata, "currency") ?? "USD",
        label:
          metadataString(event.metadata, "chargeLabel") ??
          metadataString(event.metadata, "paymentLabel"),
      });
      continue;
    }

    const paymentId = resolvePaymentIdForEvent(event);
    if (paymentId) {
      paymentIds.add(paymentId);
    }
  }

  const paymentsById = new Map<string, PaymentNotificationContext>();
  await Promise.all(
    [...paymentIds].map(async (paymentId) => {
      const payment = await getPaymentById(supabase, paymentId);
      if (!payment) return;

      const amountCents = payment.chargedAmountCents ?? payment.amountCents;
      if (amountCents <= 0) return;

      paymentsById.set(paymentId, {
        amountCents,
        currency: payment.currency,
        label: payment.label?.trim() || null,
      });
    }),
  );

  const contextsByEventId = new Map<string, PaymentNotificationContext>();
  for (const event of events) {
    if (event.action !== ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED) {
      continue;
    }

    const directAmount = directAmounts.get(event.id);
    if (directAmount) {
      contextsByEventId.set(event.id, directAmount);
      continue;
    }

    const paymentId = resolvePaymentIdForEvent(event);
    if (!paymentId) continue;

    const paymentContext = paymentsById.get(paymentId);
    if (paymentContext) {
      contextsByEventId.set(event.id, paymentContext);
    }
  }

  return contextsByEventId;
}

function resolveTuitionChargeIdForEvent(
  event: ActivityEventForNotification,
): string | null {
  if (event.entity_type === "tuition_charge" && event.entity_id) {
    return event.entity_id;
  }

  const fromMetadata = metadataString(event.metadata, "tuitionChargeId");
  if (fromMetadata) return fromMetadata;

  const chargeId = metadataString(event.metadata, "chargeId");
  if (chargeId) return chargeId;

  return null;
}

export async function fetchTuitionNotificationContexts(
  supabase: SupabaseClient,
  events: ActivityEventForNotification[],
): Promise<Map<string, TuitionNotificationContext>> {
  const chargeIds = new Set<string>();

  for (const event of events) {
    const chargeId = resolveTuitionChargeIdForEvent(event);
    if (chargeId) {
      chargeIds.add(chargeId);
    }
  }

  if (chargeIds.size === 0) {
    return new Map();
  }

  const { data: charges, error: chargesError } = await supabase
    .from("tuition_charges")
    .select("id, label, family_id, assignment_id, families(name)")
    .in("id", [...chargeIds]);

  if (chargesError) throw chargesError;

  const assignmentIds = [
    ...new Set(
      (charges ?? [])
        .map((charge) =>
          charge.assignment_id ? String(charge.assignment_id) : null,
        )
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const studentNameByAssignmentId = new Map<string, string>();

  if (assignmentIds.length > 0) {
    const { data: assignments, error: assignmentsError } = await supabase
      .from("tuition_enrollment_assignments")
      .select("id, enrollment_id")
      .in("id", assignmentIds);

    if (assignmentsError) throw assignmentsError;

    const enrollmentIds = [
      ...new Set(
        (assignments ?? [])
          .map((assignment) =>
            assignment.enrollment_id ? String(assignment.enrollment_id) : null,
          )
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const enrollmentStudentId = new Map<string, string | null>();
    if (enrollmentIds.length > 0) {
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select("id, student_id")
        .in("id", enrollmentIds);

      if (enrollmentsError) throw enrollmentsError;

      for (const enrollment of enrollments ?? []) {
        enrollmentStudentId.set(
          String(enrollment.id),
          enrollment.student_id ? String(enrollment.student_id) : null,
        );
      }
    }

    const studentIds = [
      ...new Set(
        [...enrollmentStudentId.values()].filter((id): id is string => Boolean(id)),
      ),
    ];

    const studentNameById = new Map<string, string>();
    if (studentIds.length > 0) {
      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("id, first_name, last_name")
        .in("id", studentIds);

      if (studentsError) throw studentsError;

      for (const student of students ?? []) {
        studentNameById.set(
          String(student.id),
          [student.first_name, student.last_name].filter(Boolean).join(" ").trim() ||
            "Student",
        );
      }
    }

    const assignmentEnrollmentId = new Map(
      (assignments ?? []).map((assignment) => [
        String(assignment.id),
        assignment.enrollment_id ? String(assignment.enrollment_id) : null,
      ]),
    );

    for (const assignmentId of assignmentIds) {
      const enrollmentId = assignmentEnrollmentId.get(assignmentId) ?? null;
      if (!enrollmentId) continue;
      const studentId = enrollmentStudentId.get(enrollmentId) ?? null;
      if (!studentId) continue;
      const studentName = studentNameById.get(studentId);
      if (studentName) {
        studentNameByAssignmentId.set(assignmentId, studentName);
      }
    }
  }

  const contexts = new Map<string, TuitionNotificationContext>();

  for (const charge of charges ?? []) {
    const chargeId = String(charge.id);
    const family = charge.families as { name?: string } | { name?: string }[] | null;
    const familyRow = Array.isArray(family) ? family[0] : family;
    const familyName =
      typeof familyRow?.name === "string" ? familyRow.name.trim() : null;
    const assignmentId = charge.assignment_id
      ? String(charge.assignment_id)
      : null;
    const studentName = assignmentId
      ? studentNameByAssignmentId.get(assignmentId) ?? null
      : null;
    const subjectLabel = studentName ?? familyName;

    contexts.set(chargeId, {
      subjectLabel,
      chargeLabel: String(charge.label ?? ""),
      familyName,
      studentName,
    });
  }

  return contexts;
}

export function formatActivityNotificationDetail(
  action: string,
  subjectLabel: string | null,
  fallbackSummary: string,
  paymentAmountLabel?: string | null,
  tuitionContext?: TuitionNotificationContext | null,
  options?: {
    guardianLabel?: string | null;
    paymentLabel?: string | null;
    entityType?: string | null;
  },
): string {
  const isTuitionPayment =
    action === ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED &&
    tuitionContext != null;

  if (isTuitionPayment) {
    const who = subjectLabel ?? tuitionContext.familyName ?? "A family";
    const amountPart = paymentAmountLabel ? ` ${paymentAmountLabel}` : "";
    const chargePart = tuitionContext.chargeLabel
      ? ` for ${tuitionContext.chargeLabel}`
      : "";
    return `${who} paid${amountPart}${chargePart}`;
  }

  if (action === ACTIVITY_ACTIONS.TUITION_AUTOPAY_SUCCEEDED) {
    if (paymentAmountLabel && !fallbackSummary.includes(paymentAmountLabel)) {
      return `${fallbackSummary} — ${paymentAmountLabel}`;
    }
    return fallbackSummary;
  }

  if (!subjectLabel) {
    return fallbackSummary;
  }

  const guardianLabel = options?.guardianLabel ?? null;

  switch (action) {
    case ACTIVITY_ACTIONS.APPLICATION_SUBMITTED:
      return formatGuardianActionForStudent(
        guardianLabel,
        subjectLabel,
        "submitted an application",
        `${subjectLabel} submitted an application`,
      );
    case ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED: {
      const feeLabel = resolveApplicationPaymentFeeLabel(
        options?.paymentLabel,
        options?.entityType,
      );

      if (guardianLabel && guardianLabel !== subjectLabel) {
        const paymentPhrase = paymentAmountLabel
          ? `paid a ${paymentAmountLabel} ${feeLabel}`
          : `paid a ${feeLabel}`;
        return formatGuardianActionForStudent(
          guardianLabel,
          subjectLabel,
          paymentPhrase,
          paymentAmountLabel
            ? `${subjectLabel} paid a ${paymentAmountLabel} application fee`
            : `${subjectLabel} paid an application fee`,
        );
      }

      return paymentAmountLabel
        ? `${subjectLabel} paid a ${paymentAmountLabel} application fee`
        : `${subjectLabel} paid an application fee`;
    }
    case ACTIVITY_ACTIONS.APPLICATION_UNDER_REVIEW:
      return `${subjectLabel}'s application is under review`;
    case ACTIVITY_ACTIONS.APPLICATION_OBSERVATION:
      return `${subjectLabel}'s application moved to observation`;
    case ACTIVITY_ACTIONS.APPLICATION_ACCEPTED:
      return `${subjectLabel}'s application was accepted`;
    case ACTIVITY_ACTIONS.APPLICATION_DECLINED:
      return `${subjectLabel}'s application was declined`;
    case ACTIVITY_ACTIONS.APPLICATION_WITHDRAWN:
      return `${subjectLabel}'s application was withdrawn`;
    case ACTIVITY_ACTIONS.POST_SUBMIT_VISIT_SCHEDULED:
      return formatGuardianActionForStudent(
        guardianLabel,
        subjectLabel,
        "scheduled a visit",
        `${subjectLabel} scheduled a visit`,
      );
    case ACTIVITY_ACTIONS.ENROLLMENT_COMPLETED:
      return formatGuardianActionForStudent(
        guardianLabel,
        subjectLabel,
        "finished enrollment",
        `${subjectLabel} finished enrollment`,
      );
    default:
      return fallbackSummary;
  }
}

async function lookupApplicationIdForEnrollment(
  supabase: SupabaseClient,
  enrollmentId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("enrollments")
    .select("application_id")
    .eq("id", enrollmentId)
    .maybeSingle();

  if (error) throw error;
  return data?.application_id ? String(data.application_id) : null;
}

async function lookupApplicationIdForChecklistItem(
  supabase: SupabaseClient,
  checklistItemId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("enrollment_checklist_items")
    .select("enrollment_checklists(application_id)")
    .eq("id", checklistItemId)
    .maybeSingle();

  if (error) throw error;

  const checklist = data?.enrollment_checklists as
    | { application_id?: string }
    | { application_id?: string }[]
    | null;
  const checklistRow = Array.isArray(checklist) ? checklist[0] : checklist;
  return checklistRow?.application_id
    ? String(checklistRow.application_id)
    : null;
}

async function resolveApplicationId(
  supabase: SupabaseClient,
  event: ActivityEventForNotification,
  cache: Map<string, string | null>,
): Promise<string | null> {
  const fromMetadata = metadataString(event.metadata, "applicationId");
  if (fromMetadata) return fromMetadata;

  if (event.entity_type === "application" && event.entity_id) {
    return event.entity_id;
  }

  if (!event.entity_id) return null;

  const cacheKey = `${event.entity_type}:${event.entity_id}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) ?? null;
  }

  let applicationId: string | null = null;

  if (event.entity_type === "enrollment") {
    applicationId = await lookupApplicationIdForEnrollment(
      supabase,
      event.entity_id,
    );
  } else if (event.entity_type === "enrollment_checklist_item") {
    applicationId = await lookupApplicationIdForChecklistItem(
      supabase,
      event.entity_id,
    );
  } else if (event.entity_type === "payment") {
    const payment = await getPaymentById(supabase, event.entity_id);
    applicationId = payment?.applicationId ?? null;
  }

  const paymentId = metadataString(event.metadata, "paymentId");
  if (!applicationId && paymentId) {
    const payment = await getPaymentById(supabase, paymentId);
    applicationId = payment?.applicationId ?? null;
  }

  cache.set(cacheKey, applicationId);
  return applicationId;
}

export async function resolveActivityNotificationLink(
  supabase: SupabaseClient,
  slug: string,
  event: ActivityEventForNotification,
  applicationId: string | null,
): Promise<{ href: string; ctaLabel: string }> {
  if (event.action === ACTIVITY_ACTIONS.PAYMENTS_STRIPE_CONNECTED) {
    return { href: paymentsHref(slug), ctaLabel: "View payments" };
  }

  if (event.entity_type === "tuition_charge") {
    return { href: tuitionHref(slug), ctaLabel: "View tuition" };
  }

  if (event.action === ACTIVITY_ACTIONS.COMMITTEE_JOIN_REQUESTED) {
    const committeeId = metadataString(event.metadata, "committeeId");
    return {
      href: committeesHref(slug, committeeId),
      ctaLabel: "Review request",
    };
  }

  if (applicationId) {
    const category = getActivityNotificationCategory(event.action);
    if (category === "enrollment") {
      return {
        href: submissionsHref(slug, applicationId),
        ctaLabel: "View enrollment",
      };
    }
    if (event.action === ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED) {
      return {
        href: submissionsHref(slug, applicationId),
        ctaLabel: "View application",
      };
    }
    return {
      href: submissionsHref(slug, applicationId),
      ctaLabel: "View application",
    };
  }

  if (
    event.action === ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED ||
    event.entity_type === "payment"
  ) {
    return { href: paymentsHref(slug), ctaLabel: "View payment" };
  }

  if (event.action.startsWith("enrollment.")) {
    return { href: paymentsHref(slug), ctaLabel: "View enrollment" };
  }

  return {
    href: schoolAdminPath(slug, "admissions", "submissions"),
    ctaLabel: "View",
  };
}

export function mapActivityEventToNotification(
  event: ActivityEventForNotification,
  link: { href: string; ctaLabel: string },
  context: ApplicationNotificationContext | null,
  paymentAmountLabel?: string | null,
  tuitionContext?: TuitionNotificationContext | null,
  paymentLabel?: string | null,
): SchoolAdminActivityNotification {
  const metadataSubject = metadataString(event.metadata, "guardianName");
  const guardianLabel = context?.guardianLabel ?? metadataSubject ?? null;
  const subjectLabel =
    tuitionContext?.subjectLabel ??
    context?.subjectLabel ??
    metadataSubject;
  const programName = context?.programName ?? null;

  return {
    id: event.id,
    action: event.action,
    title: formatActivityNotificationTitle(event.action),
    summary: event.summary,
    subjectLabel,
    guardianLabel,
    programName,
    detail: formatActivityNotificationDetail(
      event.action,
      subjectLabel,
      event.summary,
      paymentAmountLabel,
      tuitionContext,
      {
        guardianLabel,
        paymentLabel,
        entityType: event.entity_type,
      },
    ),
    createdAt: event.created_at,
    href: link.href,
    ctaLabel: link.ctaLabel,
    category: getActivityNotificationCategory(event.action),
  };
}

function mapActivityEventRow(
  row: Record<string, unknown>,
): ActivityEventForNotification {
  return {
    id: String(row.id),
    action: String(row.action),
    entity_type:
      row.entity_type === null || row.entity_type === undefined
        ? null
        : String(row.entity_type),
    entity_id:
      row.entity_id === null || row.entity_id === undefined
        ? null
        : String(row.entity_id),
    summary: String(row.summary),
    metadata:
      row.metadata &&
      typeof row.metadata === "object" &&
      !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
    created_at: String(row.created_at),
  };
}

export async function fetchSchoolAdminActivityNotifications(
  supabase: SupabaseClient,
  organizationId: string,
  slug: string,
  options?: { limit?: number; days?: number; cursor?: string | null },
): Promise<SchoolAdminActivityNotificationsPage> {
  const requestedLimit = options?.limit ?? DEFAULT_NOTIFICATION_PAGE_SIZE;
  const limit = Math.min(
    Math.max(requestedLimit, 1),
    MAX_NOTIFICATION_PAGE_SIZE,
  );
  const days = options?.days ?? DEFAULT_NOTIFICATION_DAYS;

  const rangeStart = new Date();
  rangeStart.setDate(rangeStart.getDate() - days);

  let query = supabase
    .from("activity_events")
    .select("id, action, entity_type, entity_id, summary, metadata, created_at")
    .eq("organization_id", organizationId)
    .in("action", [...SCHOOL_ADMIN_NOTIFICATION_ACTIONS])
    .gte("created_at", rangeStart.toISOString())
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  const decodedCursor = options?.cursor
    ? decodeActivityNotificationCursor(options.cursor)
    : null;
  if (decodedCursor) {
    query = query.or(
      `created_at.lt.${decodedCursor.createdAt},and(created_at.eq.${decodedCursor.createdAt},id.lt.${decodedCursor.id})`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  const rawEvents = (data ?? []).map((row) =>
    mapActivityEventRow(row as Record<string, unknown>),
  );
  const hasMore = rawEvents.length > limit;
  const events = hasMore ? rawEvents.slice(0, limit) : rawEvents;

  const applicationIdCache = new Map<string, string | null>();
  const applicationIds: string[] = [];

  for (const event of events) {
    const applicationId = await resolveApplicationId(
      supabase,
      event,
      applicationIdCache,
    );
    applicationIdCache.set(`event:${event.id}`, applicationId);
    if (applicationId) {
      applicationIds.push(applicationId);
    }
  }

  const applicationContexts = await fetchApplicationNotificationContexts(
    supabase,
    applicationIds,
  );
  const paymentContexts = await fetchPaymentNotificationContexts(
    supabase,
    events,
  );
  const tuitionContexts = await fetchTuitionNotificationContexts(
    supabase,
    events,
  );

  const notifications: SchoolAdminActivityNotification[] = [];

  for (const event of events) {
    const applicationId = applicationIdCache.get(`event:${event.id}`) ?? null;
    const link = await resolveActivityNotificationLink(
      supabase,
      slug,
      event,
      applicationId,
    );
    const context = applicationId
      ? applicationContexts.get(applicationId) ?? null
      : null;
    const chargeId = resolveTuitionChargeIdForEvent(event);
    const tuitionContext = chargeId
      ? tuitionContexts.get(chargeId) ?? null
      : null;
    const paymentContext = paymentContexts.get(event.id) ?? null;
    let paymentAmountLabel = formatPaymentAmountLabel(paymentContext);
    if (
      !paymentAmountLabel &&
      event.action === ACTIVITY_ACTIONS.TUITION_AUTOPAY_SUCCEEDED
    ) {
      const amountCents = metadataNumber(event.metadata, "amountCents");
      if (amountCents != null && amountCents > 0) {
        paymentAmountLabel = formatCents(amountCents);
      }
    }
    notifications.push(
      mapActivityEventToNotification(
        event,
        link,
        context,
        paymentAmountLabel,
        tuitionContext,
        paymentContext?.label ?? null,
      ),
    );
  }

  const lastEvent = events.at(-1);
  return {
    notifications,
    nextCursor:
      hasMore && lastEvent
        ? encodeActivityNotificationCursor(lastEvent.created_at, lastEvent.id)
        : null,
    hasMore,
  };
}

export function getActivityNotificationRangeStart(
  days: number = DEFAULT_NOTIFICATION_DAYS,
  now: Date = new Date(),
): Date {
  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - days);
  return rangeStart;
}

export function isUnreadActivityNotificationEvent(
  createdAt: string,
  lastReadAt: string | null,
  rangeStart: Date,
): boolean {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return false;
  if (created < rangeStart) return false;
  if (!lastReadAt) return true;

  const read = new Date(lastReadAt);
  if (Number.isNaN(read.getTime())) return true;
  return created.getTime() > read.getTime();
}

export async function getActivityNotificationReadWatermark(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("school_admin_activity_notification_reads")
    .select("last_read_at")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;
  return data?.last_read_at ? String(data.last_read_at) : null;
}

export async function markActivityNotificationsRead(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  readAt: Date = new Date(),
): Promise<string> {
  const lastReadAt = readAt.toISOString();
  const { data, error } = await supabase
    .from("school_admin_activity_notification_reads")
    .upsert(
      {
        user_id: userId,
        organization_id: organizationId,
        last_read_at: lastReadAt,
      },
      { onConflict: "user_id,organization_id" },
    )
    .select("last_read_at")
    .single();

  if (error) throw error;
  return String(data.last_read_at);
}

export async function countUnreadActivityNotifications(
  supabase: SupabaseClient,
  organizationId: string,
  lastReadAt: string | null,
  options?: { days?: number },
): Promise<number> {
  const days = options?.days ?? DEFAULT_NOTIFICATION_DAYS;
  const rangeStart = getActivityNotificationRangeStart(days);

  let query = supabase
    .from("activity_events")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .in("action", [...SCHOOL_ADMIN_NOTIFICATION_ACTIONS])
    .gte("created_at", rangeStart.toISOString());

  if (lastReadAt) {
    query = query.gt("created_at", lastReadAt);
  }

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function fetchUnreadActivityNotificationCount(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  options?: { days?: number },
): Promise<number> {
  const lastReadAt = await getActivityNotificationReadWatermark(
    supabase,
    userId,
    organizationId,
  );
  return countUnreadActivityNotifications(
    supabase,
    organizationId,
    lastReadAt,
    options,
  );
}
