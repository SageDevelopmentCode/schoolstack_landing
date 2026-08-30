"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Building2, FileText } from "lucide-react";
import ApplyPortalPageShell from "@/components/admissions/ApplyPortalPageShell";
import { usePreviewPortalOptions } from "@/components/admin/PreviewPortalOptionsProvider";
import ApplyRequiredActionsSection from "@/components/admissions/ApplyRequiredActionsSection";
import EnrollmentAgreementAmendmentBanner from "@/components/admissions/EnrollmentAgreementAmendmentBanner";
import ApplyApplicationStoryCard from "@/components/admissions/apply-dashboard/ApplyApplicationStoryCard";
import ApplyDashboardStoryHeader from "@/components/admissions/apply-dashboard/ApplyDashboardStoryHeader";
import ApplyEnrolledCelebrationCard from "@/components/admissions/apply-dashboard/ApplyEnrolledCelebrationCard";
import ApplyPortalStarterCard from "@/components/admissions/apply-dashboard/ApplyPortalStarterCard";
import { applyDashboardFadeUp } from "@/components/admissions/apply-dashboard/apply-dashboard-motion";
import ParentButtonLink from "@/components/school-parent/ui/ParentButtonLink";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import type { EnrollmentAgreementAmendmentBannerItem } from "@/lib/admissions/enrollment-agreement-amendment-banner";
import type { EnrollmentAgreementIncompleteBannerItem } from "@/lib/admissions/enrollment-agreement-incomplete-banner";
import {
  type FamilyApplication,
  type FamilyUserProfile,
} from "@/lib/admissions/parent-portal-access";
import type { EnrollmentProgressSummary } from "@/lib/admissions/enrollment-checklist-materialization";
import { formatInstantInTimezone, formatScheduledVisitWhenLabel } from "@/lib/admissions/admissions-availability";
import type { FamilyScheduledVisit } from "@/lib/admissions/family-tour-booking";
import { POST_SUBMIT_ACTION_TEMPLATES } from "@/lib/admissions/post-submit-templates";
import { fireEnrollmentConfetti } from "@/lib/enrollment-confetti";
import {
  buildParentThemeTokens,
  parentThemeToAdminCompat,
} from "@/lib/organization-settings/parent-theme";
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

function applicationSideStatusText(
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

function familyKickerLabel(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `The ${parts[parts.length - 1]} family`;
  }
  if (parts.length === 1) {
    return `The ${parts[0]} family`;
  }
  return "Your family";
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
  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const adminCompat = useMemo(
    () => parentThemeToAdminCompat(theme),
    [theme],
  );
  const previewHomeHref = previewBasePath ?? undefined;

  const allApplicationsEnrolled =
    applications.length > 0 &&
    applications.every((application) =>
      isEnrollmentComplete(
        application,
        enrollmentProgressByApplicationId[application.id],
      ),
    );

  const headerKicker = allApplicationsEnrolled
    ? "Admissions archive"
    : familyKickerLabel(userProfile.displayName);
  const headerTitle = allApplicationsEnrolled
    ? "Your family's applications"
    : "Your applications";
  const headerSubtitle = allApplicationsEnrolled
    ? "These applications are complete. You can revisit enrollment details whenever you need them."
    : `Track submitted applications and continue drafts for ${schoolName}.`;

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

  const showPortalStarter =
    hasEnrolledAccess && parentPortalEnabled && Boolean(parentPortalHref);

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
      <div className="flex flex-col gap-7">
        {showPortalStarter && parentPortalHref ? (
          <ApplyEnrolledCelebrationCard
            theme={theme}
            schoolName={schoolName}
            parentPortalHref={parentPortalHref}
          />
        ) : null}

        {enrollmentAmendmentBannerItems.length > 0 ||
        enrollmentIncompleteBannerItems.length > 0 ? (
          <EnrollmentAgreementAmendmentBanner
            C={adminCompat}
            items={enrollmentAmendmentBannerItems}
            incompleteItems={enrollmentIncompleteBannerItems}
          />
        ) : null}

        {upcomingCampusTours.length > 0 ? (
          <motion.section
            custom={1}
            initial="hidden"
            animate="visible"
            variants={applyDashboardFadeUp}
          >
            <h2
              className="text-lg font-semibold"
              style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
            >
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
                  <ParentCard key={visit.id} theme={theme} className="!p-5">
                    <h3
                      className="text-base font-semibold"
                      style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                    >
                      {visit.title}
                    </h3>
                    <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                      {whenLabel}
                    </p>
                  </ParentCard>
                );
              })}
            </div>
          </motion.section>
        ) : null}

        {showScheduleTourCta ? (
          <motion.section
            custom={2}
            initial="hidden"
            animate="visible"
            variants={applyDashboardFadeUp}
          >
            <ParentCard theme={theme} className="!p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: theme.warningBg, color: theme.warning }}
                  >
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2
                      className="text-base font-semibold"
                      style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                    >
                      {scheduleTourTitle}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed" style={{ color: theme.muted }}>
                      {scheduleTourSubtitle}
                    </p>
                  </div>
                </div>
                {previewMode ? (
                  <span
                    aria-disabled="true"
                    className="inline-flex shrink-0 cursor-not-allowed items-center justify-center rounded-[10px] px-[15px] py-[11px] text-[13px] font-bold text-white opacity-50"
                    style={{ backgroundColor: theme.primary }}
                  >
                    Schedule tour
                  </span>
                ) : (
                  <ParentButtonLink
                    theme={theme}
                    href={scheduleTourHref}
                    variant="primary"
                    className="w-full shrink-0 sm:w-auto"
                  >
                    Schedule tour
                  </ParentButtonLink>
                )}
              </div>
            </ParentCard>
          </motion.section>
        ) : null}

        <motion.section
          custom={3}
          initial="hidden"
          animate="visible"
          variants={applyDashboardFadeUp}
          className="flex flex-col gap-5"
        >
          <ApplyDashboardStoryHeader
            theme={theme}
            kicker={headerKicker}
            title={headerTitle}
            subtitle={headerSubtitle}
            schoolSlug={schoolSlug}
            previewMode={previewMode}
          />

          {applications.length === 0 ? (
            <ParentCard theme={theme} className="px-6 py-10 text-center">
              <FileText className="mx-auto h-8 w-8" style={{ color: theme.primary }} />
              <h2
                className="mt-4 text-lg font-semibold"
                style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
              >
                No applications yet
              </h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: theme.muted }}>
                {upcomingCampusTours.length > 0
                  ? `When you're ready, start your application to ${schoolName}.`
                  : `Start an application to apply to ${schoolName}.`}
              </p>
              {previewMode ? (
                <span
                  aria-disabled="true"
                  className="mt-6 inline-flex cursor-not-allowed items-center justify-center rounded-[10px] px-[15px] py-[11px] text-[13px] font-bold text-white opacity-50"
                  style={{ backgroundColor: theme.primary }}
                >
                  Start application
                </span>
              ) : (
                <ParentButtonLink
                  theme={theme}
                  href={`/school/${schoolSlug}/forms/apply`}
                  variant="primary"
                  className="mt-6 inline-flex w-auto"
                >
                  Start application
                </ParentButtonLink>
              )}
            </ParentCard>
          ) : (
            <div className="space-y-3.5">
              {applications.map((application, index) => {
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
                const submittedLabel = formatApplicationDate(
                  application.submittedAt,
                  timezone,
                );
                const createdLabel = formatApplicationDate(
                  application.createdAt,
                  timezone,
                );
                const dateLabel =
                  application.status === "draft"
                    ? createdLabel
                      ? `Started ${createdLabel}`
                      : null
                    : submittedLabel
                      ? `Submitted ${submittedLabel}`
                      : null;

                return (
                  <ApplyApplicationStoryCard
                    key={application.id}
                    theme={theme}
                    adminCompat={adminCompat}
                    application={application}
                    action={action}
                    statusForDisplay={statusForDisplay}
                    dateLabel={dateLabel}
                    sideStatusText={applicationSideStatusText(
                      application,
                      statusForDisplay,
                      enrollmentProgress,
                    )}
                    index={index}
                    isFocused={focusApplicationId === application.id}
                  />
                );
              })}
            </div>
          )}
        </motion.section>

        {applicationsWithTasks.length > 0 ? (
          <ApplyRequiredActionsSection
            theme={theme}
            adminCompat={adminCompat}
            timezone={timezone}
            applications={applicationsWithTasks}
            onBooked={() => router.refresh()}
            previewMode={previewMode}
            shadowDaySchedulingMode={shadowDaySchedulingMode}
          />
        ) : null}

        {showPortalStarter && parentPortalHref ? (
          <ApplyPortalStarterCard
            theme={theme}
            parentPortalHref={parentPortalHref}
          />
        ) : null}
      </div>
    </ApplyPortalPageShell>
  );
}
