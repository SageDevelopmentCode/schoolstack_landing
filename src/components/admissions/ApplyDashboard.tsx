"use client";

import Link from "next/link";
import NavigationLink from "@/components/school/shared/NavigationLink";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { ArrowRight, Building2, FileText, Plus } from "lucide-react";
import EnrolledFamilyBanner from "@/components/admissions/EnrolledFamilyBanner";
import ApplyPortalPageShell from "@/components/admissions/ApplyPortalPageShell";
import { usePreviewPortalOptions } from "@/components/admin/PreviewPortalOptionsProvider";
import ApplyRequiredActionsSection from "@/components/admissions/ApplyRequiredActionsSection";
import EnrollmentAgreementAmendmentBanner from "@/components/admissions/EnrollmentAgreementAmendmentBanner";
import type { EnrollmentAgreementAmendmentBannerItem } from "@/lib/admissions/enrollment-agreement-amendment-banner";
import type { EnrollmentAgreementIncompleteBannerItem } from "@/lib/admissions/enrollment-agreement-incomplete-banner";
import {
  applicationStatusBadgeStyle,
  applicationStatusLabel,
} from "@/lib/admissions/application-status-ui";
import {
  type FamilyApplication,
  type FamilyUserProfile,
} from "@/lib/admissions/parent-portal-access";
import type { EnrollmentProgressSummary } from "@/lib/admissions/enrollment-checklist-materialization";
import { formatInstantInTimezone, formatScheduledVisitWhenLabel } from "@/lib/admissions/admissions-availability";
import type { FamilyScheduledVisit } from "@/lib/admissions/family-tour-booking";
import { POST_SUBMIT_ACTION_TEMPLATES } from "@/lib/admissions/post-submit-templates";
import { fireEnrollmentConfetti } from "@/lib/enrollment-confetti";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { ShadowDaySchedulingMode } from "@/lib/admissions/admissions-org-settings";
import type { SchoolPortalOption } from "@/lib/auth/portal-switcher-types";

type ApplyDashboardProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  organizationId?: string;
  timezone: string;
  applications: FamilyApplication[];
  applicationsWithTasks: FamilyApplication[];
  upcomingCampusTours?: FamilyScheduledVisit[];
  showScheduleTourCta?: boolean;
  scheduleTourLabel?: string;
  scheduleTourDescription?: string;
  hasEnrolledAccess: boolean;
  parentPortalEnabled: boolean;
  parentPortalHref?: string;
  enrollmentProgressByApplicationId: Record<string, EnrollmentProgressSummary>;
  enrollmentAmendmentBannerItems?: EnrollmentAgreementAmendmentBannerItem[];
  enrollmentIncompleteBannerItems?: EnrollmentAgreementIncompleteBannerItem[];
  userProfile: FamilyUserProfile;
  portalOptions?: SchoolPortalOption[];
  previewMode?: boolean;
  previewBasePath?: string;
  focusApplicationId?: string | null;
  shadowDaySchedulingMode?: ShadowDaySchedulingMode;
};

function formatApplicationDate(
  value: string | null,
  timezone: string,
): string | null {
  if (!value) return null;
  return formatInstantInTimezone(value, timezone);
}

function studentInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return "?";
}

function displayApplicationStatus(
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

function isEnrollmentComplete(
  application: FamilyApplication,
  enrollmentProgress?: EnrollmentProgressSummary,
): boolean {
  return displayApplicationStatus(application, enrollmentProgress) === "enrolled";
}

function applicationAction(
  application: FamilyApplication,
  schoolSlug: string,
  enrollmentProgress?: EnrollmentProgressSummary,
  previewBasePath?: string,
): { label: string; href: string } {
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
    return {
      label: "View enrollment",
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
    label: "View",
    href: previewBasePath
      ? `${previewBasePath}/apply/${application.id}`
      : `/school/${schoolSlug}/apply/${application.id}`,
  };
}

function enrolledCelebrationStorageKey(schoolSlug: string) {
  return `apply-dashboard-enrolled-celebration-v2:${schoolSlug}`;
}

export default function ApplyDashboard({
  branding,
  schoolName,
  schoolSlug,
  organizationId,
  timezone,
  applications,
  applicationsWithTasks,
  upcomingCampusTours = [],
  showScheduleTourCta = false,
  scheduleTourLabel,
  scheduleTourDescription,
  hasEnrolledAccess,
  parentPortalEnabled,
  parentPortalHref,
  enrollmentProgressByApplicationId,
  enrollmentAmendmentBannerItems = [],
  enrollmentIncompleteBannerItems = [],
  userProfile,
  portalOptions = [],
  previewMode = false,
  previewBasePath,
  focusApplicationId = null,
  shadowDaySchedulingMode,
}: ApplyDashboardProps) {
  const router = useRouter();
  const previewPortalOptions = usePreviewPortalOptions();
  const resolvedPortalOptions = previewMode
    ? previewPortalOptions.length > 0
      ? previewPortalOptions
      : portalOptions
    : portalOptions;
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const previewHomeHref = previewBasePath ?? undefined;

  useEffect(() => {
    if (!focusApplicationId || typeof window === "undefined") return;
    const element = document.getElementById("preview-focus");
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusApplicationId]);

  useEffect(() => {
    if (previewMode || !hasEnrolledAccess) return;
    if (typeof window === "undefined") return;
    const storageKey = enrolledCelebrationStorageKey(schoolSlug);
    if (sessionStorage.getItem(storageKey)) return;

    sessionStorage.setItem(storageKey, "1");
    fireEnrollmentConfetti();
  }, [hasEnrolledAccess, previewMode, schoolSlug]);

  const scheduleTourHref = previewBasePath
    ? `${previewBasePath}/apply/schedule-tour`
    : `/school/${schoolSlug}/apply/schedule-tour`;
  const scheduleTourTitle =
    scheduleTourLabel?.trim() ||
    POST_SUBMIT_ACTION_TEMPLATES.schedule_campus_tour.label;
  const scheduleTourSubtitle =
    scheduleTourDescription?.trim() ||
    POST_SUBMIT_ACTION_TEMPLATES.schedule_campus_tour.defaultInstructions;

  return (
    <ApplyPortalPageShell
      branding={branding}
      schoolName={schoolName}
      schoolSlug={schoolSlug}
      organizationId={organizationId}
      userEmail={userProfile.email}
      userDisplayName={userProfile.displayName}
      profilePhotoUrl={userProfile.profilePhotoUrl}
      portalOptions={resolvedPortalOptions}
      previewMode={previewMode}
      previewHomeHref={previewHomeHref}
    >
      <div className="flex flex-col gap-8">
        {hasEnrolledAccess && parentPortalEnabled && parentPortalHref ? (
          <EnrolledFamilyBanner
            C={C}
            schoolName={schoolName}
            parentPortalHref={parentPortalHref}
          />
        ) : null}

        {enrollmentAmendmentBannerItems.length > 0 ||
        enrollmentIncompleteBannerItems.length > 0 ? (
          <EnrollmentAgreementAmendmentBanner
            C={C}
            items={enrollmentAmendmentBannerItems}
            incompleteItems={enrollmentIncompleteBannerItems}
          />
        ) : null}

        {upcomingCampusTours.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold" style={{ color: C.accentDark }}>
              Upcoming visits
            </h2>
            <div className="mt-4 space-y-3">
              {upcomingCampusTours.map((visit) => {
                const whenLabel = formatScheduledVisitWhenLabel({
                  schedulingMode: visit.schedulingMode,
                  scheduledDate: visit.scheduledDate,
                  startTimeSlot: visit.startTimeSlot,
                  durationMinutes: visit.durationMinutes,
                });

                return (
                  <div
                    key={visit.id}
                    className="rounded-md border px-5 py-5"
                    style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
                  >
                    <h3 className="text-base font-semibold" style={{ color: C.accentDark }}>
                      {visit.title}
                    </h3>
                    <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
                      {whenLabel}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {showScheduleTourCta ? (
          <section>
            <div
              className="rounded-md border px-5 py-5"
              style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: C.clayBg, color: C.clay }}
                  >
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold" style={{ color: C.accentDark }}>
                      {scheduleTourTitle}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                      {scheduleTourSubtitle}
                    </p>
                  </div>
                </div>
                {previewMode ? (
                  <span
                    aria-disabled="true"
                    className="inline-flex shrink-0 cursor-not-allowed items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium opacity-50"
                    style={{ backgroundColor: C.accent, color: "#FFFFFF" }}
                  >
                    Schedule tour
                  </span>
                ) : (
                  <Link
                    href={scheduleTourHref}
                    className="inline-flex shrink-0 items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                    style={{ backgroundColor: C.accent }}
                  >
                    Schedule tour
                  </Link>
                )}
              </div>
            </div>
          </section>
        ) : null}

        <section>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold sm:text-3xl" style={{ color: C.accentDark }}>
                Your applications
              </h1>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                Track submitted applications and continue drafts for {schoolName}.
              </p>
            </div>
            {previewMode ? (
              <span
                aria-disabled="true"
                className="inline-flex w-full shrink-0 cursor-not-allowed items-center justify-center gap-2 whitespace-nowrap rounded-md border border-dashed px-4 py-2.5 text-sm font-medium opacity-50 sm:w-auto"
                style={{
                  color: C.accent,
                  borderColor: `color-mix(in srgb, ${C.accent} 30%, transparent)`,
                  backgroundColor: "transparent",
                }}
              >
                <Plus className="h-4 w-4 shrink-0" />
                New application
              </span>
            ) : (
              <Link
                href={`/school/${schoolSlug}/forms/apply?new=1`}
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-dashed px-4 py-2.5 text-sm font-medium transition hover:opacity-90 sm:w-auto"
                style={{
                  color: C.accent,
                  borderColor: `color-mix(in srgb, ${C.accent} 30%, transparent)`,
                  backgroundColor: "transparent",
                }}
              >
                <Plus className="h-4 w-4 shrink-0" />
                New application
              </Link>
            )}
          </div>

        {applications.length === 0 ? (
          <div
            className="mt-4 rounded-md border px-6 py-10 text-center"
            style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
          >
            <FileText className="mx-auto h-8 w-8" style={{ color: C.accent }} />
            <h2 className="mt-4 text-lg font-semibold" style={{ color: C.accentDark }}>
              No applications yet
            </h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
              {upcomingCampusTours.length > 0
                ? `When you're ready, start your application to ${schoolName}.`
                : `Start an application to apply to ${schoolName}.`}
            </p>
            {previewMode ? (
              <span
                aria-disabled="true"
                className="mt-6 inline-flex cursor-not-allowed items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium opacity-50"
                style={{ backgroundColor: C.accent, color: "#FFFFFF" }}
              >
                Start application
              </span>
            ) : (
              <Link
                href={`/school/${schoolSlug}/forms/apply`}
                className="mt-6 inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                style={{ backgroundColor: C.accent }}
              >
                Start application
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {applications.map((application) => {
              const enrollmentProgress =
                enrollmentProgressByApplicationId[application.id];
              const action = applicationAction(
                application,
                schoolSlug,
                enrollmentProgress,
                previewBasePath,
              );
              const statusForDisplay = displayApplicationStatus(
                application,
                enrollmentProgress,
              );
              const submittedLabel = formatApplicationDate(application.submittedAt, timezone);
              const createdLabel = formatApplicationDate(application.createdAt, timezone);
              const dateLabel =
                submittedLabel ?? (application.status === "draft" ? `Started ${createdLabel}` : null);

              return (
                <div
                  key={application.id}
                  id={focusApplicationId === application.id ? "preview-focus" : undefined}
                  className="rounded-md border px-5 py-5"
                  style={{
                    borderColor:
                      focusApplicationId === application.id ? C.accent : C.border,
                    backgroundColor: "#FFFFFF",
                    boxShadow:
                      focusApplicationId === application.id
                        ? `0 0 0 1px ${C.accent}33`
                        : undefined,
                  }}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      {application.studentName ? (
                        <div className="mb-2 flex items-center gap-2.5">
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                            style={{ backgroundColor: C.accentLight, color: C.accent }}
                          >
                            {studentInitials(application.studentName)}
                          </span>
                          <span className="text-sm" style={{ color: C.textSecondary }}>
                            {application.studentName}
                          </span>
                        </div>
                      ) : null}
                      <div className="flex flex-col items-start gap-2">
                        <h2 className="text-base font-semibold" style={{ color: C.accentDark }}>
                          {application.formTitle}
                        </h2>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={applicationStatusBadgeStyle(statusForDisplay, C)}
                        >
                          {applicationStatusLabel(statusForDisplay)}
                        </span>
                      </div>
                      {dateLabel ? (
                        <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
                          {application.status === "draft" ? dateLabel : `Submitted ${submittedLabel}`}
                        </p>
                      ) : null}
                      {application.status === "accepted" ? (
                        <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>
                          Congratulations — your application was accepted. The school will
                          start your enrollment checklist soon.
                        </p>
                      ) : null}
                    </div>
                    <NavigationLink
                      href={action.href}
                      className="inline-flex shrink-0 items-center gap-1.5 self-end text-sm font-medium underline-offset-2 transition hover:underline sm:self-center"
                      style={{ color: C.accent }}
                    >
                      {action.label}
                      <ArrowRight className="h-4 w-4" />
                    </NavigationLink>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </section>

        {applicationsWithTasks.length > 0 ? (
          <ApplyRequiredActionsSection
            C={C}
            timezone={timezone}
            applications={applicationsWithTasks}
            onBooked={() => router.refresh()}
            previewMode={previewMode}
            shadowDaySchedulingMode={shadowDaySchedulingMode}
          />
        ) : null}
      </div>
    </ApplyPortalPageShell>
  );
}
