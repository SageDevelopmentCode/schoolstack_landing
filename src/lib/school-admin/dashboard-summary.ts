import type { SupabaseClient } from "@supabase/supabase-js";
import {
  countAdmissionsAvailabilitySlotsInMonth,
  getOrganizationTimezone,
  todayMonthYearInTimezone,
} from "@/lib/admissions/admissions-availability";
import { countObservationDaysInMonth } from "@/lib/admissions/admissions-observation-availability";
import { dateKey } from "@/lib/committees/calendar-utils";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { AdminFeatures } from "@/lib/organization-settings/types";
import { loadAttendanceRoster } from "@/lib/school-admin/attendance/attendance-roster";
import type {
  AttendanceRosterStudent,
  AttendanceRosterSummary,
} from "@/lib/school-admin/attendance/attendance-types";
import {
  fetchSchoolAdminActivityNotifications,
  getActivityNotificationCategory,
  type SchoolAdminActivityNotification,
} from "@/lib/school-admin/activity-notifications";
import {
  fetchAdmissionsSetupStatus,
  type AdmissionsSetupStatus,
} from "@/lib/school-admin/admissions-setup-status";
import {
  fetchCollectedThisMonthCents,
  fetchDashboardAggregateMetrics,
  fetchDashboardApplicationMetrics,
  fetchLatestSubmittedApplication,
} from "@/lib/school-admin/dashboard-metrics";
import { getCachedAdminMessagesUnreadCount } from "@/lib/school-admin/cached-admin-unread-counts";
import {
  fetchAdminFeatureAnnouncements,
  type ResolvedAdminFeatureAnnouncement,
} from "@/lib/school-admin/admin-feature-announcements";
import { reportOperationalError } from "@/lib/operational-errors";
import { formatCents } from "@/lib/tuition/pricing";
import { formatShortDate } from "@/lib/admissions/application-submissions";

export type DashboardFocusItem = {
  id: string;
  icon: "application" | "schedule" | "message" | "setup" | "attendance";
  title: string;
  subtitle: string;
  href: string;
  ctaLabel: string;
};

export type DashboardMetric = {
  id: string;
  label: string;
  value: string;
  accent: "forest" | "sky" | "gold" | "berry";
  enabled: boolean;
};

export type DashboardQuickAction =
  | {
      id: string;
      title: string;
      subtitle: string;
      kind: "link";
      href: string;
    }
  | {
      id: string;
      title: string;
      subtitle: string;
      kind: "copy-apply-link";
      applyFormPublicPath: string;
    };

export type AdminDashboardToday = {
  setupStatus: AdmissionsSetupStatus;
  focusItems: DashboardFocusItem[];
  signal: {
    headline: string;
    body: string;
    href: string;
    ctaLabel: string;
  } | null;
  metrics: DashboardMetric[];
  messagesUnreadCount: number;
  setupComplete: boolean;
  attendanceToday: {
    date: string;
    summary: AttendanceRosterSummary;
    students: AttendanceRosterStudent[];
  } | null;
};

export type AdminDashboardActivity = {
  recentActivity: SchoolAdminActivityNotification[];
  quickActions: DashboardQuickAction[];
};

export type AdminDashboardGuides = {
  featureAnnouncements: ResolvedAdminFeatureAnnouncement[];
};

export type AdminDashboardSummary = AdminDashboardToday &
  AdminDashboardActivity &
  AdminDashboardGuides;

export type AdminDashboardSection = "today" | "activity" | "guides";

const DASHBOARD_SECTIONS = new Set<AdminDashboardSection>([
  "today",
  "activity",
  "guides",
]);

export function parseAdminDashboardSection(
  value: string | null,
): AdminDashboardSection | null {
  if (value && DASHBOARD_SECTIONS.has(value as AdminDashboardSection)) {
    return value as AdminDashboardSection;
  }
  return null;
}

type DashboardFetchContext = {
  supabase: SupabaseClient;
  admin: SupabaseClient;
  organizationId: string;
  slug: string;
  features: AdminFeatures;
  userId?: string;
  schoolName?: string;
};

async function loadScheduleStats(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<{ shadowDaysThisMonth: number | null; openSlots: number | null }> {
  try {
    const tz = await getOrganizationTimezone(supabase, organizationId);
    const { year, month } = todayMonthYearInTimezone(tz);
    const [openSlots, shadowDaysThisMonth] = await Promise.all([
      countAdmissionsAvailabilitySlotsInMonth(supabase, organizationId, year, month),
      countObservationDaysInMonth(supabase, organizationId, year, month),
    ]);
    return { shadowDaysThisMonth, openSlots };
  } catch {
    return { shadowDaysThisMonth: null, openSlots: null };
  }
}

async function resolveMessagesUnreadCount(
  ctx: DashboardFetchContext,
  aggregateMessagesUnread: number | undefined,
): Promise<number> {
  if (aggregateMessagesUnread != null) {
    return aggregateMessagesUnread;
  }
  if (!ctx.userId || !ctx.features.messages) {
    return 0;
  }
  return getCachedAdminMessagesUnreadCount(
    ctx.admin,
    ctx.organizationId,
    ctx.userId,
    ctx.schoolName ?? "School",
  ).catch((err) => {
    void reportOperationalError({
      supabase: ctx.admin,
      surface: "school_admin",
      organizationId: ctx.organizationId,
      operation: "dashboard.load_messages_unread_count",
      error:
        err instanceof Error
          ? err.message
          : "Failed to load messages unread count.",
      severity: "warning",
      notify: true,
      actor: { type: "system" },
      cause: err,
    });
    return 0;
  });
}

async function resolveApplicationMetrics(
  ctx: DashboardFetchContext,
  aggregateMetrics: Awaited<ReturnType<typeof fetchDashboardAggregateMetrics>> | null,
): Promise<{
  activeApplications: number;
  enrolledCount: number;
  submittedAwaitingReview: number;
  collectedThisMonthCents: number;
}> {
  let activeApplications = aggregateMetrics?.activeApplications ?? 0;
  let enrolledCount = aggregateMetrics?.enrolledCount ?? 0;
  let submittedAwaitingReview = aggregateMetrics?.submittedCount ?? 0;
  let collectedThisMonthCents = aggregateMetrics?.collectedThisMonthCents ?? 0;

  if (ctx.features.admissions && !aggregateMetrics) {
    const fallbackMetrics = await fetchDashboardApplicationMetrics(
      ctx.supabase,
      ctx.organizationId,
    );
    activeApplications = fallbackMetrics.activeApplications;
    enrolledCount = fallbackMetrics.enrolledCount;
    submittedAwaitingReview = fallbackMetrics.submittedCount;
    collectedThisMonthCents = await fetchCollectedThisMonthCents(
      ctx.supabase,
      ctx.organizationId,
    );
  }

  return {
    activeApplications,
    enrolledCount,
    submittedAwaitingReview,
    collectedThisMonthCents,
  };
}

function buildFocusItems(
  ctx: DashboardFetchContext,
  input: {
    setupStatus: AdmissionsSetupStatus;
    setupComplete: boolean;
    latestSubmitted: Awaited<ReturnType<typeof fetchLatestSubmittedApplication>>;
    scheduleStats: { shadowDaysThisMonth: number | null; openSlots: number | null };
    messagesUnreadCount: number;
    attendanceToday: AdminDashboardToday["attendanceToday"];
  },
): DashboardFocusItem[] {
  const { slug, features } = ctx;
  const focusItems: DashboardFocusItem[] = [];

  if (features.admissions && !input.setupComplete) {
    const nextStep = input.setupStatus.steps.find(
      (step) => step.id === input.setupStatus.firstIncompleteStepId,
    );
    if (nextStep) {
      focusItems.push({
        id: `setup-${nextStep.id}`,
        icon: "setup",
        title: nextStep.title,
        subtitle: nextStep.description,
        href: nextStep.href,
        ctaLabel: "Continue →",
      });
    }
  }

  if (features.admissions && input.latestSubmitted) {
    focusItems.push({
      id: `review-${input.latestSubmitted.id}`,
      icon: "application",
      title: `Review ${input.latestSubmitted.guardianName ?? "family"}'s application`,
      subtitle: input.latestSubmitted.submittedAt
        ? `Submitted ${formatShortDate(input.latestSubmitted.submittedAt)} · ready for decision`
        : "Submitted · ready for decision",
      href: `${schoolAdminPath(slug, "admissions", "submissions")}?applicationId=${input.latestSubmitted.id}`,
      ctaLabel: "Open →",
    });
  }

  if (
    features.schedule &&
    input.scheduleStats.openSlots === 0 &&
    focusItems.length < 3
  ) {
    focusItems.push({
      id: "schedule-slots",
      icon: "schedule",
      title: "Set admissions visit slots",
      subtitle: "Families can book after you open tour or observation times",
      href: schoolAdminPath(slug, "schedule"),
      ctaLabel: "Schedule →",
    });
  }

  if (features.messages && input.messagesUnreadCount > 0 && focusItems.length < 3) {
    focusItems.push({
      id: "unread-messages",
      icon: "message",
      title: `Reply to ${input.messagesUnreadCount} unread message${input.messagesUnreadCount === 1 ? "" : "s"}`,
      subtitle: "Families are waiting on your response",
      href: schoolAdminPath(slug, "messages"),
      ctaLabel: "Reply →",
    });
  }

  if (
    features.my_school &&
    input.attendanceToday &&
    input.attendanceToday.summary.notMarkedCount > 0 &&
    focusItems.length < 3
  ) {
    const count = input.attendanceToday.summary.notMarkedCount;
    focusItems.push({
      id: "attendance-not-marked",
      icon: "attendance",
      title: `Mark attendance for ${count} student${count === 1 ? "" : "s"}`,
      subtitle: "Today's roster still has unmarked students",
      href: schoolAdminPath(slug, "my_school", "attendance"),
      ctaLabel: "Open →",
    });
  }

  return focusItems.slice(0, 3);
}

function buildSignal(
  ctx: DashboardFetchContext,
  enrolledCount: number,
  submittedAwaitingReview: number,
): AdminDashboardToday["signal"] {
  const { slug, features } = ctx;
  if (!features.admissions || (enrolledCount <= 0 && submittedAwaitingReview <= 0)) {
    return null;
  }

  return {
    headline:
      enrolledCount > 0 ? "Enrollment is on track." : "Applications need attention.",
    body:
      enrolledCount > 0
        ? `${enrolledCount} learner${enrolledCount === 1 ? "" : "s"} enrolled${
            submittedAwaitingReview > 0
              ? `, with ${submittedAwaitingReview} application${
                  submittedAwaitingReview === 1 ? "" : "s"
                } ready for review.`
              : "."
          }`
        : `${submittedAwaitingReview} application${
            submittedAwaitingReview === 1 ? "" : "s"
          } waiting for your review.`,
    href: schoolAdminPath(slug, "admissions", "submissions"),
    ctaLabel: "Open admissions →",
  };
}

function buildMetrics(
  ctx: DashboardFetchContext,
  input: {
    activeApplications: number;
    collectedThisMonthCents: number;
    messagesUnreadCount: number;
    scheduleStats: { shadowDaysThisMonth: number | null; openSlots: number | null };
  },
): DashboardMetric[] {
  const { features } = ctx;
  const metrics: DashboardMetric[] = [
    {
      id: "active-applications",
      label: "Active applications",
      value: String(input.activeApplications),
      accent: "forest",
      enabled: features.admissions,
    },
    {
      id: "shadow-days",
      label: "Shadow days this month",
      value:
        input.scheduleStats.shadowDaysThisMonth != null
          ? String(input.scheduleStats.shadowDaysThisMonth)
          : "—",
      accent: "sky",
      enabled: features.schedule,
    },
    {
      id: "collected-month",
      label: "Collected this month",
      value: formatCents(input.collectedThisMonthCents),
      accent: "gold",
      enabled: features.admissions,
    },
    {
      id: "unread-messages",
      label: "Unread family messages",
      value: String(input.messagesUnreadCount),
      accent: "berry",
      enabled: features.messages,
    },
  ];

  return metrics.filter((metric) => metric.enabled);
}

function buildQuickActions(
  ctx: DashboardFetchContext,
  setupStatus: AdmissionsSetupStatus,
): DashboardQuickAction[] {
  const { slug, features } = ctx;
  const quickActions: DashboardQuickAction[] = [];
  if (features.admissions) {
    quickActions.push({
      id: "submissions",
      title: "Review submissions",
      subtitle: "See every family application in one place.",
      kind: "link",
      href: schoolAdminPath(slug, "admissions", "submissions"),
    });
    if (setupStatus.applyFormPublicPath) {
      quickActions.push({
        id: "copy-apply-link",
        title: "Copy application link",
        subtitle:
          "Same link for every family — parents choose their program inside the application.",
        kind: "copy-apply-link",
        applyFormPublicPath: setupStatus.applyFormPublicPath,
      });
    }
    quickActions.push({
      id: "edit-apply-form",
      title: "Edit application form",
      subtitle: "Update questions, fees, and publish settings.",
      kind: "link",
      href: `${schoolAdminPath(slug, "admissions", "flows")}?flow=apply`,
    });
  }
  if (features.messages) {
    quickActions.push({
      id: "messages",
      title: "Send school update",
      subtitle: "Write to one family or a group.",
      kind: "link",
      href: schoolAdminPath(slug, "messages"),
    });
  }
  return quickActions;
}

async function loadAttendanceToday(
  ctx: DashboardFetchContext,
): Promise<AdminDashboardToday["attendanceToday"]> {
  if (!ctx.features.my_school) {
    return null;
  }
  const todayKey = dateKey(new Date());
  return loadAttendanceRoster(ctx.admin, ctx.organizationId, todayKey)
    .then((roster) => ({
      date: roster.date,
      summary: roster.summary,
      students: roster.students,
    }))
    .catch((err) => {
      void reportOperationalError({
        supabase: ctx.admin,
        surface: "school_admin",
        organizationId: ctx.organizationId,
        operation: "dashboard.load_attendance_roster",
        error:
          err instanceof Error
            ? err.message
            : "Failed to load today's attendance roster.",
        severity: "warning",
        notify: true,
        actor: { type: "system" },
        cause: err,
      });
      return null;
    });
}

export async function fetchAdminDashboardToday(
  supabase: SupabaseClient,
  admin: SupabaseClient,
  organizationId: string,
  slug: string,
  features: AdminFeatures,
  options?: { userId?: string; schoolName?: string },
): Promise<AdminDashboardToday> {
  const ctx: DashboardFetchContext = {
    supabase,
    admin,
    organizationId,
    slug,
    features,
    userId: options?.userId,
    schoolName: options?.schoolName,
  };

  const [
    setupStatus,
    aggregateMetrics,
    latestSubmitted,
    scheduleStats,
    attendanceToday,
  ] = await Promise.all([
    fetchAdmissionsSetupStatus(supabase, organizationId, slug),
    features.admissions || (options?.userId && features.messages)
      ? fetchDashboardAggregateMetrics(supabase, organizationId, options?.userId)
      : Promise.resolve(null),
    features.admissions
      ? fetchLatestSubmittedApplication(supabase, organizationId)
      : Promise.resolve(null),
    features.schedule
      ? loadScheduleStats(supabase, organizationId)
      : Promise.resolve({ shadowDaysThisMonth: null, openSlots: null }),
    loadAttendanceToday(ctx),
  ]);

  const setupComplete =
    setupStatus.completedCount === setupStatus.totalCount;

  const messagesUnreadCount = await resolveMessagesUnreadCount(
    ctx,
    aggregateMetrics?.messagesUnread,
  );

  const {
    activeApplications,
    enrolledCount,
    submittedAwaitingReview,
    collectedThisMonthCents,
  } = await resolveApplicationMetrics(ctx, aggregateMetrics);

  const focusItems = buildFocusItems(ctx, {
    setupStatus,
    setupComplete,
    latestSubmitted,
    scheduleStats,
    messagesUnreadCount,
    attendanceToday,
  });

  return {
    setupStatus,
    focusItems,
    signal: buildSignal(ctx, enrolledCount, submittedAwaitingReview),
    metrics: buildMetrics(ctx, {
      activeApplications,
      collectedThisMonthCents,
      messagesUnreadCount,
      scheduleStats,
    }),
    messagesUnreadCount,
    setupComplete,
    attendanceToday,
  };
}

export async function fetchAdminDashboardActivity(
  supabase: SupabaseClient,
  admin: SupabaseClient,
  organizationId: string,
  slug: string,
  features: AdminFeatures,
): Promise<AdminDashboardActivity> {
  const ctx: DashboardFetchContext = {
    supabase,
    admin,
    organizationId,
    slug,
    features,
  };

  const [setupStatus, activityPage] = await Promise.all([
    fetchAdmissionsSetupStatus(supabase, organizationId, slug),
    fetchSchoolAdminActivityNotifications(supabase, organizationId, slug, {
      limit: 8,
    }).catch((err) => {
      void reportOperationalError({
        supabase,
        surface: "school_admin",
        organizationId,
        operation: "dashboard.load_activity_notifications",
        error:
          err instanceof Error
            ? err.message
            : "Failed to load activity notifications.",
        severity: "warning",
        notify: true,
        actor: { type: "system" },
        cause: err,
      });
      return {
        notifications: [] as SchoolAdminActivityNotification[],
        nextCursor: null,
        hasMore: false,
      };
    }),
  ]);

  return {
    recentActivity: activityPage.notifications,
    quickActions: buildQuickActions(ctx, setupStatus),
  };
}

export async function fetchAdminDashboardGuides(
  admin: SupabaseClient,
  organizationId: string,
  slug: string,
  features: AdminFeatures,
): Promise<AdminDashboardGuides> {
  return {
    featureAnnouncements: await fetchAdminFeatureAnnouncements(
      admin,
      organizationId,
      slug,
      features,
    ),
  };
}

export async function fetchAdminDashboardSummary(
  supabase: SupabaseClient,
  admin: SupabaseClient,
  organizationId: string,
  slug: string,
  features: AdminFeatures,
  options?: { userId?: string; schoolName?: string },
): Promise<AdminDashboardSummary> {
  const [today, activity, guides] = await Promise.all([
    fetchAdminDashboardToday(
      supabase,
      admin,
      organizationId,
      slug,
      features,
      options,
    ),
    fetchAdminDashboardActivity(supabase, admin, organizationId, slug, features),
    fetchAdminDashboardGuides(admin, organizationId, slug, features),
  ]);

  return {
    ...today,
    ...activity,
    ...guides,
  };
}

export function activityCategoryChipTone(
  category: ReturnType<typeof getActivityNotificationCategory>,
): "success" | "warning" | "info" | "purple" {
  switch (category) {
    case "payments":
      return "success";
    case "applications":
      return "warning";
    case "enrollment":
      return "info";
    case "committees":
      return "purple";
    case "program_signups":
      return "warning";
    case "messages":
      return "info";
    default:
      return "info";
  }
}

export function activityCategoryLabel(
  category: ReturnType<typeof getActivityNotificationCategory>,
): string {
  switch (category) {
    case "payments":
      return "Payments";
    case "applications":
      return "Admissions";
    case "enrollment":
      return "Enrollment";
    case "committees":
      return "Community";
    case "program_signups":
      return "Program sign-ups";
    case "messages":
      return "Messages";
    default:
      return "School";
  }
}

export function greetingParts(): { prefix: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { prefix: "Good morning", emoji: "☀️" };
  if (hour < 17) return { prefix: "Good afternoon", emoji: "🌤️" };
  return { prefix: "Good evening", emoji: "🌙" };
}

export function greetingForTimeOfDay(): string {
  return greetingParts().prefix;
}
