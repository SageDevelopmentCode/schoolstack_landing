import type { SupabaseClient } from "@supabase/supabase-js";
import {
  countAdmissionsAvailabilitySlotsInMonth,
  getOrganizationTimezone,
  todayMonthYearInTimezone,
} from "@/lib/admissions/admissions-availability";
import { countObservationDaysInMonth } from "@/lib/admissions/admissions-observation-availability";
import { listOrgApplicationSubmissions } from "@/lib/admissions/application-submissions";
import {
  listOrganizationPayments,
  summarizePaymentRows,
} from "@/lib/admissions/payment-records";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { AdminFeatures } from "@/lib/organization-settings/types";
import {
  fetchSchoolAdminActivityNotifications,
  getActivityNotificationCategory,
  type SchoolAdminActivityNotification,
} from "@/lib/school-admin/activity-notifications";
import {
  fetchAdmissionsSetupStatus,
  type AdmissionsSetupStatus,
} from "@/lib/school-admin/admissions-setup-status";
import { getAdminMessagesUnreadCount } from "@/lib/messages/unread-count-api";
import { formatCents } from "@/lib/tuition/pricing";
import { formatShortDate } from "@/lib/admissions/application-submissions";

const TERMINAL_APPLICATION_STATUSES = new Set([
  "enrolled",
  "declined",
  "withdrawn",
]);

export type DashboardFocusItem = {
  id: string;
  icon: "application" | "schedule" | "message" | "setup";
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

export type DashboardQuickAction = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

export type AdminDashboardSummary = {
  setupStatus: AdmissionsSetupStatus;
  focusItems: DashboardFocusItem[];
  signal: {
    headline: string;
    body: string;
    href: string;
    ctaLabel: string;
  } | null;
  metrics: DashboardMetric[];
  recentActivity: SchoolAdminActivityNotification[];
  quickActions: DashboardQuickAction[];
  messagesUnreadCount: number;
  setupComplete: boolean;
};

export async function fetchAdminDashboardSummary(
  supabase: SupabaseClient,
  admin: SupabaseClient,
  organizationId: string,
  slug: string,
  features: AdminFeatures,
  options?: { userId?: string; schoolName?: string },
): Promise<AdminDashboardSummary> {
  const setupStatus = await fetchAdmissionsSetupStatus(
    supabase,
    organizationId,
    slug,
  );
  const setupComplete =
    setupStatus.completedCount === setupStatus.totalCount;

  const [
    submissions,
    payments,
    activityPage,
    messagesUnreadCount,
    scheduleStats,
  ] = await Promise.all([
    features.admissions
      ? listOrgApplicationSubmissions(supabase, organizationId, { limit: 200 })
      : Promise.resolve([]),
    features.admissions
      ? listOrganizationPayments(supabase, organizationId, { limit: 500 })
      : Promise.resolve([]),
    fetchSchoolAdminActivityNotifications(supabase, organizationId, slug, {
      limit: 8,
    }).catch(() => ({
      notifications: [] as SchoolAdminActivityNotification[],
      nextCursor: null,
      hasMore: false,
    })),
    options?.userId && features.messages
      ? getAdminMessagesUnreadCount(
          admin,
          organizationId,
          options.userId,
          options.schoolName ?? "School",
        ).catch(() => 0)
      : Promise.resolve(0),
    features.schedule
      ? loadScheduleStats(supabase, organizationId)
      : Promise.resolve({ shadowDaysThisMonth: null, openSlots: null }),
  ]);

  const paymentSummary = summarizePaymentRows(payments);
  const activeApplications = submissions.filter(
    (row) => !TERMINAL_APPLICATION_STATUSES.has(row.status),
  ).length;
  const enrolledCount = submissions.filter((row) => row.status === "enrolled").length;
  const submittedAwaitingReview = submissions.filter(
    (row) => row.status === "submitted",
  );
  const latestSubmitted = submittedAwaitingReview[0] ?? null;

  const focusItems: DashboardFocusItem[] = [];

  if (features.admissions && !setupComplete) {
    const nextStep = setupStatus.steps.find(
      (step) => step.id === setupStatus.firstIncompleteStepId,
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

  if (features.admissions && latestSubmitted) {
    focusItems.push({
      id: `review-${latestSubmitted.id}`,
      icon: "application",
      title: `Review ${latestSubmitted.guardianName ?? "family"}'s application`,
      subtitle: latestSubmitted.submittedAt
        ? `Submitted ${formatShortDate(latestSubmitted.submittedAt)} · ready for decision`
        : "Submitted · ready for decision",
      href: `${schoolAdminPath(slug, "admissions", "submissions")}?applicationId=${latestSubmitted.id}`,
      ctaLabel: "Open →",
    });
  }

  if (
    features.schedule &&
    scheduleStats.openSlots === 0 &&
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

  if (features.messages && messagesUnreadCount > 0 && focusItems.length < 3) {
    focusItems.push({
      id: "unread-messages",
      icon: "message",
      title: `Reply to ${messagesUnreadCount} unread message${messagesUnreadCount === 1 ? "" : "s"}`,
      subtitle: "Families are waiting on your response",
      href: schoolAdminPath(slug, "messages"),
      ctaLabel: "Reply →",
    });
  }

  const signal =
    features.admissions && (enrolledCount > 0 || submittedAwaitingReview.length > 0)
      ? {
          headline:
            enrolledCount > 0 ? "Enrollment is on track." : "Applications need attention.",
          body:
            enrolledCount > 0
              ? `${enrolledCount} learner${enrolledCount === 1 ? "" : "s"} enrolled${
                  submittedAwaitingReview.length > 0
                    ? `, with ${submittedAwaitingReview.length} application${
                        submittedAwaitingReview.length === 1 ? "" : "s"
                      } ready for review.`
                    : "."
                }`
              : `${submittedAwaitingReview.length} application${
                  submittedAwaitingReview.length === 1 ? "" : "s"
                } waiting for your review.`,
          href: schoolAdminPath(slug, "admissions", "submissions"),
          ctaLabel: "Open admissions →",
        }
      : null;

  const metrics: DashboardMetric[] = [
    {
      id: "active-applications",
      label: "Active applications",
      value: String(activeApplications),
      accent: "forest",
      enabled: features.admissions,
    },
    {
      id: "shadow-days",
      label: "Shadow days this month",
      value:
        scheduleStats.shadowDaysThisMonth != null
          ? String(scheduleStats.shadowDaysThisMonth)
          : "—",
      accent: "sky",
      enabled: features.schedule,
    },
    {
      id: "collected-month",
      label: "Collected this month",
      value: formatCents(paymentSummary.collectedThisMonthCents),
      accent: "gold",
      enabled: features.admissions,
    },
    {
      id: "unread-messages",
      label: "Unread family messages",
      value: String(messagesUnreadCount),
      accent: "berry",
      enabled: features.messages,
    },
  ];

  const quickActions: DashboardQuickAction[] = [];
  if (features.admissions) {
    quickActions.push({
      id: "submissions",
      title: "Review submissions",
      subtitle: "See every family application in one place.",
      href: schoolAdminPath(slug, "admissions", "submissions"),
    });
    if (setupStatus.applyFormPublicPath) {
      quickActions.push({
        id: "share-apply",
        title: "Share public application",
        subtitle: "Copy the family-facing application link.",
        href: schoolAdminPath(slug, "admissions", "flows"),
      });
    }
  }
  if (features.messages) {
    quickActions.push({
      id: "messages",
      title: "Send school update",
      subtitle: "Write to one family or a group.",
      href: schoolAdminPath(slug, "messages"),
    });
  }

  return {
    setupStatus,
    focusItems: focusItems.slice(0, 3),
    signal,
    metrics: metrics.filter((metric) => metric.enabled),
    recentActivity: activityPage.notifications,
    quickActions,
    messagesUnreadCount,
    setupComplete,
  };
}

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
