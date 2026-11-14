"use client";

import { useMemo } from "react";
import { formatInstantInTimezone } from "@/lib/admissions/admissions-availability";
import type { EnrollmentAgreementAmendmentBannerItem } from "@/lib/admissions/enrollment-agreement-amendment-banner";
import type { EnrollmentAgreementIncompleteBannerItem } from "@/lib/admissions/enrollment-agreement-incomplete-banner";
import type { EnrollmentProgressSummary } from "@/lib/admissions/enrollment-checklist-materialization";
import type {
  ApplicationPostSubmitTask,
  FamilyApplication,
  FamilyUserProfile,
} from "@/lib/admissions/parent-portal-access";
import { getPostSubmitStepPresentation } from "@/lib/admissions/post-submit-step-presentations";
import { POST_SUBMIT_ACTION_TEMPLATES } from "@/lib/admissions/post-submit-templates";

/*
 * View-model for the apply dashboard (Garden). The status/action helpers are
 * the original ApplyDashboard logic, moved here unchanged; everything else is
 * derived presentation state (journey stages, next steps, counts).
 */

export type ApplicationAction = { label: string; href: string };

export const JOURNEY_STAGES = [
  "Started",
  "Submitted",
  "In review",
  "Accepted",
  "Enrolled",
] as const;

export type ApplicationJourney =
  | { kind: "progress"; reached: number; complete: boolean; enrolling: boolean }
  | { kind: "closed"; label: string };

export type ApplicationRow = {
  application: FamilyApplication;
  studentName: string;
  action: ApplicationAction;
  statusForDisplay: string;
  dateLabel: string | null;
  sideStatusText: string;
  enrollmentProgress?: EnrollmentProgressSummary;
  journey: ApplicationJourney;
};

export type BookingTarget = {
  applicationId: string;
  task: ApplicationPostSubmitTask;
};

/** One thing the family can do next. Never carries a child's full name as text (see initials). */
export type ApplyTodo = {
  key: string;
  tone: "sign" | "enroll" | "book" | "draft";
  title: string;
  subtitle: string | null;
  cta: string;
  /** Child the to-do belongs to, shown as an initials badge. */
  studentName: string | null;
} & ({ href: string; booking?: undefined } | { href?: undefined; booking: BookingTarget });

/* ---------------- original helpers (unchanged behaviour) ---------------- */

function formatApplicationDate(value: string | null, timezone: string): string | null {
  if (!value) return null;
  return formatInstantInTimezone(value, timezone);
}

export function displayApplicationStatus(
  application: FamilyApplication,
  enrollmentProgress?: EnrollmentProgressSummary,
): string {
  if (application.status === "enrolled") return "enrolled";
  if (
    application.status === "enrolling" &&
    enrollmentProgress?.checklistStatus === "completed"
  ) {
    return "enrolled";
  }
  return application.status;
}

export function isEnrollmentComplete(
  application: FamilyApplication,
  enrollmentProgress?: EnrollmentProgressSummary,
): boolean {
  return displayApplicationStatus(application, enrollmentProgress) === "enrolled";
}

export function applicationAction(
  application: FamilyApplication,
  schoolSlug: string,
  enrollmentProgress?: EnrollmentProgressSummary,
  previewBasePath?: string,
): ApplicationAction {
  if (application.status === "draft" && application.publicSlug) {
    if (previewBasePath) {
      return {
        label: "View draft",
        href: `${previewBasePath}/apply/${application.id}`,
      };
    }
    return {
      label: "Continue",
      href: `/school/${schoolSlug}/forms/${application.publicSlug}`,
    };
  }

  if (
    application.status === "enrolled" ||
    isEnrollmentComplete(application, enrollmentProgress)
  ) {
    const firstName = application.studentName?.split(" ")[0] ?? "enrollment";
    return {
      label: `View ${firstName}'s enrollment`,
      href: previewBasePath
        ? `${previewBasePath}/apply/${application.id}/enrollment`
        : `/school/${schoolSlug}/apply/${application.id}/enrollment`,
    };
  }

  if (application.status === "enrolling") {
    const hasStarted = (enrollmentProgress?.completed ?? 0) > 0;
    return {
      label: hasStarted ? "Continue enrollment" : "Start enrollment",
      href: previewBasePath
        ? `${previewBasePath}/apply/${application.id}/enrollment`
        : `/school/${schoolSlug}/apply/${application.id}/enrollment`,
    };
  }

  return {
    label: "View application",
    href: previewBasePath
      ? `${previewBasePath}/apply/${application.id}`
      : `/school/${schoolSlug}/apply/${application.id}`,
  };
}

function applicationStatusFallbackSide(status: string): string {
  switch (status) {
    case "declined":
      return "Application declined";
    case "withdrawn":
      return "Application withdrawn";
    default:
      return "Application on file";
  }
}

export function applicationSideStatusText(
  application: FamilyApplication,
  statusForDisplay: string,
  enrollmentProgress?: EnrollmentProgressSummary,
): string {
  if (statusForDisplay === "enrolled") {
    return "Enrollment complete";
  }
  if (application.status === "enrolling") {
    if (enrollmentProgress && enrollmentProgress.total > 0) {
      return `${enrollmentProgress.completed} of ${enrollmentProgress.total} checklist items`;
    }
    return "Enrollment in progress";
  }
  if (application.status === "draft") {
    return "In progress";
  }
  if (
    statusForDisplay === "submitted" ||
    statusForDisplay === "under_review" ||
    statusForDisplay === "observation" ||
    statusForDisplay === "fee_pending"
  ) {
    return "Under review";
  }
  if (statusForDisplay === "accepted") {
    return "Accepted — enrollment coming";
  }
  return applicationStatusFallbackSide(statusForDisplay);
}

export function familyKickerLabel(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `The ${parts[parts.length - 1]} family`;
  }
  if (parts.length === 1) {
    return `The ${parts[0]} family`;
  }
  return "Your family";
}

export function enrolledCelebrationStorageKey(schoolSlug: string) {
  return `apply-dashboard-enrolled-celebration-v2:${schoolSlug}`;
}

/* ---------------- derived presentation ---------------- */

function journeyFor(statusForDisplay: string): ApplicationJourney {
  switch (statusForDisplay) {
    case "declined":
      return { kind: "closed", label: "Application declined" };
    case "withdrawn":
      return { kind: "closed", label: "Application withdrawn" };
    case "draft":
      return { kind: "progress", reached: 0, complete: false, enrolling: false };
    case "submitted":
    case "fee_pending":
      return { kind: "progress", reached: 1, complete: false, enrolling: false };
    case "under_review":
    case "observation":
      return { kind: "progress", reached: 2, complete: false, enrolling: false };
    case "accepted":
      return { kind: "progress", reached: 3, complete: false, enrolling: false };
    case "enrolling":
      return { kind: "progress", reached: 3, complete: false, enrolling: true };
    case "enrolled":
      return { kind: "progress", reached: 4, complete: true, enrolling: false };
    default:
      return { kind: "progress", reached: 1, complete: false, enrolling: false };
  }
}

export function countPendingRequired(applications: FamilyApplication[]): number {
  return applications.reduce(
    (count, application) =>
      count +
      application.postSubmitTasks.filter(
        (task) => task.required && task.status === "pending",
      ).length,
    0,
  );
}

export type ApplyDashboardModelInput = {
  schoolName: string;
  schoolSlug: string;
  timezone: string;
  applications: FamilyApplication[];
  applicationsWithTasks: FamilyApplication[];
  showScheduleTourCta: boolean;
  scheduleTourLabel?: string;
  scheduleTourDescription?: string;
  hasEnrolledAccess: boolean;
  parentPortalEnabled: boolean;
  parentPortalHref?: string;
  enrollmentProgressByApplicationId: Record<string, EnrollmentProgressSummary>;
  enrollmentAmendmentBannerItems: EnrollmentAgreementAmendmentBannerItem[];
  enrollmentIncompleteBannerItems: EnrollmentAgreementIncompleteBannerItem[];
  userProfile: FamilyUserProfile;
  previewBasePath?: string;
};

export function useApplyDashboardModel(input: ApplyDashboardModelInput) {
  const {
    schoolName,
    schoolSlug,
    timezone,
    applications,
    applicationsWithTasks,
    scheduleTourLabel,
    scheduleTourDescription,
    hasEnrolledAccess,
    parentPortalEnabled,
    parentPortalHref,
    enrollmentProgressByApplicationId,
    enrollmentAmendmentBannerItems,
    enrollmentIncompleteBannerItems,
    userProfile,
    previewBasePath,
  } = input;

  return useMemo(() => {
    const rows: ApplicationRow[] = applications.map((application) => {
      const enrollmentProgress = enrollmentProgressByApplicationId[application.id];
      const statusForDisplay = displayApplicationStatus(application, enrollmentProgress);
      const submittedLabel = formatApplicationDate(application.submittedAt, timezone);
      const createdLabel = formatApplicationDate(application.createdAt, timezone);
      const dateLabel =
        application.status === "draft"
          ? createdLabel
            ? `Started ${createdLabel}`
            : null
          : submittedLabel
            ? `Submitted ${submittedLabel}`
            : null;
      return {
        application,
        studentName: application.studentName ?? application.formTitle,
        action: applicationAction(application, schoolSlug, enrollmentProgress, previewBasePath),
        statusForDisplay,
        dateLabel,
        sideStatusText: applicationSideStatusText(application, statusForDisplay, enrollmentProgress),
        enrollmentProgress,
        journey: journeyFor(statusForDisplay),
      };
    });

    const allApplicationsEnrolled =
      applications.length > 0 &&
      applications.every((application) =>
        isEnrollmentComplete(application, enrollmentProgressByApplicationId[application.id]),
      );

    const header = allApplicationsEnrolled
      ? {
          kicker: "Admissions archive",
          title: "Your family's applications",
          subtitle:
            "These applications are complete. You can revisit enrollment details whenever you need them.",
        }
      : {
          kicker: familyKickerLabel(userProfile.displayName),
          title: "Your applications",
          subtitle: `Track submitted applications and continue drafts for ${schoolName}.`,
        };

    const pendingRequiredCount = countPendingRequired(applicationsWithTasks);

    // To-dos, most important first.
    const todos: ApplyTodo[] = [];
    for (const item of enrollmentAmendmentBannerItems) {
      todos.push({
        key: `amendment:${item.applicationId}:${item.checklistItemLabel}`,
        tone: "sign",
        title: "Enrollment agreement update",
        subtitle: item.checklistItemLabel,
        cta: "Review and re-sign",
        studentName: item.studentName,
        href: item.enrollmentHref,
      });
    }
    for (const item of enrollmentIncompleteBannerItems) {
      todos.push({
        key: `incomplete:${item.applicationId}:${item.checklistItemLabel}`,
        tone: "sign",
        title: "Enrollment agreement incomplete",
        subtitle: item.checklistItemLabel,
        cta: "Continue signing",
        studentName: item.studentName,
        href: item.enrollmentHref,
      });
    }
    for (const row of rows) {
      if (row.application.status === "enrolling" && row.statusForDisplay !== "enrolled") {
        const progress = row.enrollmentProgress;
        todos.push({
          key: `enroll:${row.application.id}`,
          tone: "enroll",
          title: row.action.label,
          subtitle:
            progress && progress.total > 0
              ? `${progress.completed} of ${progress.total} checklist items done`
              : "Your enrollment checklist is ready",
          cta: row.action.label.startsWith("Start") ? "Start" : "Continue",
          studentName: row.application.studentName,
          href: row.action.href,
        });
      }
    }
    for (const application of applicationsWithTasks) {
      for (const task of application.postSubmitTasks) {
        if (!task.required || task.status !== "pending") continue;
        todos.push({
          key: `task:${application.id}:${task.actionId}`,
          tone: "book",
          title: task.title,
          subtitle: task.instructions || null,
          cta: getPostSubmitStepPresentation(task.type).ctaLabel,
          studentName: application.studentName,
          booking: { applicationId: application.id, task },
        });
      }
    }
    for (const row of rows) {
      if (row.application.status === "draft" && row.application.publicSlug) {
        todos.push({
          key: `draft:${row.application.id}`,
          tone: "draft",
          title: "Finish your application",
          subtitle: row.dateLabel,
          cta: row.action.label,
          studentName: row.application.studentName,
          href: row.action.href,
        });
      }
    }

    const scheduleTourHref = previewBasePath
      ? `${previewBasePath}/apply/schedule-tour`
      : `/school/${schoolSlug}/apply/schedule-tour`;
    const scheduleTourTitle =
      scheduleTourLabel?.trim() || POST_SUBMIT_ACTION_TEMPLATES.schedule_campus_tour.label;
    const scheduleTourSubtitle =
      scheduleTourDescription?.trim() ||
      POST_SUBMIT_ACTION_TEMPLATES.schedule_campus_tour.defaultInstructions;

    const showPortalStarter =
      hasEnrolledAccess && parentPortalEnabled && Boolean(parentPortalHref);

    return {
      rows,
      header,
      allApplicationsEnrolled,
      pendingRequiredCount,
      todos,
      scheduleTourHref,
      scheduleTourTitle,
      scheduleTourSubtitle,
      showPortalStarter,
      newApplicationHref: `/school/${schoolSlug}/forms/apply?new=1`,
      startApplicationHref: `/school/${schoolSlug}/forms/apply`,
    };
  }, [
    applications,
    applicationsWithTasks,
    enrollmentAmendmentBannerItems,
    enrollmentIncompleteBannerItems,
    enrollmentProgressByApplicationId,
    hasEnrolledAccess,
    parentPortalEnabled,
    parentPortalHref,
    previewBasePath,
    scheduleTourDescription,
    scheduleTourLabel,
    schoolName,
    schoolSlug,
    timezone,
    userProfile.displayName,
  ]);
}

export type ApplyDashboardModel = ReturnType<typeof useApplyDashboardModel>;
