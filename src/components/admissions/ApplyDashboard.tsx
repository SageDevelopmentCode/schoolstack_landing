"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import ApplyPortalPageShell from "@/components/admissions/ApplyPortalPageShell";
import { usePreviewPortalOptions } from "@/components/admin/PreviewPortalOptionsProvider";
import ApplyRequiredActionsSection, {
  APPLY_REQUIRED_ACTIONS_ID,
} from "@/components/admissions/ApplyRequiredActionsSection";
import PostSubmitBookingModal from "@/components/admissions/PostSubmitBookingModal";
import ApplyApplicationsCard from "@/components/admissions/apply-dashboard/garden/ApplyApplicationsCard";
import ApplyNextStepCard, {
  ApplyEnrolledCard,
} from "@/components/admissions/apply-dashboard/garden/ApplyNextStepCard";
import {
  ApplyPortalStarterCard,
  ApplySummaryCard,
  ApplyVisitsCard,
} from "@/components/admissions/apply-dashboard/garden/ApplyRailCards";
import {
  enrolledCelebrationStorageKey,
  useApplyDashboardModel,
  type BookingTarget,
} from "@/components/admissions/apply-dashboard/useApplyDashboardModel";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { useCelebrate } from "@/components/school-parent/garden/motion";
import { gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import NavigationLink from "@/components/school/shared/NavigationLink";
import type { EnrollmentAgreementAmendmentBannerItem } from "@/lib/admissions/enrollment-agreement-amendment-banner";
import type { EnrollmentAgreementIncompleteBannerItem } from "@/lib/admissions/enrollment-agreement-incomplete-banner";
import type {
  ApplicationPostSubmitTask,
  FamilyApplication,
  FamilyUserProfile,
} from "@/lib/admissions/parent-portal-access";
import type { EnrollmentProgressSummary } from "@/lib/admissions/enrollment-checklist-materialization";
import type { FamilyScheduledVisit } from "@/lib/admissions/family-tour-booking";
import {
  buildParentThemeTokens,
  parentThemeToAdminCompat,
} from "@/lib/organization-settings/parent-theme";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { ShadowDaySchedulingMode } from "@/lib/admissions/admissions-org-settings";
import type { SchoolPortalOption } from "@/lib/auth/portal-switcher-types";

/*
 * Apply dashboard ("Your applications") in the parent Garden design.
 * Skill: `.claude/skills/parent-portal-garden-design`.
 * Order: header → enrolled welcome → [next step, applications, required
 * actions | visits, at a glance, parent portal]. The booking dialog is
 * portalled (GDialog) and shared by the next-step strip and the steps.
 */

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
  openPortalLinksInNewTab?: boolean;
  previewMode?: boolean;
  previewBasePath?: string;
  focusApplicationId?: string | null;
  shadowDaySchedulingMode?: ShadowDaySchedulingMode;
  suppressHelpFab?: boolean;
};

const EMPTY_AMENDMENTS: EnrollmentAgreementAmendmentBannerItem[] = [];
const EMPTY_INCOMPLETE: EnrollmentAgreementIncompleteBannerItem[] = [];
const EMPTY_VISITS: FamilyScheduledVisit[] = [];
const EMPTY_PORTALS: SchoolPortalOption[] = [];

export default function ApplyDashboard({
  branding,
  schoolName,
  schoolSlug,
  organizationId,
  timezone,
  applications,
  applicationsWithTasks,
  upcomingCampusTours = EMPTY_VISITS,
  showScheduleTourCta = false,
  scheduleTourLabel,
  scheduleTourDescription,
  hasEnrolledAccess,
  parentPortalEnabled,
  parentPortalHref,
  enrollmentProgressByApplicationId,
  enrollmentAmendmentBannerItems = EMPTY_AMENDMENTS,
  enrollmentIncompleteBannerItems = EMPTY_INCOMPLETE,
  userProfile,
  portalOptions = EMPTY_PORTALS,
  openPortalLinksInNewTab = false,
  previewMode = false,
  previewBasePath,
  focusApplicationId = null,
  shadowDaySchedulingMode,
  suppressHelpFab = false,
}: ApplyDashboardProps) {
  const router = useRouter();
  const previewPortalOptions = usePreviewPortalOptions();
  const resolvedPortalOptions = previewMode
    ? previewPortalOptions.length > 0
      ? previewPortalOptions
      : portalOptions
    : portalOptions;
  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const adminCompat = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const previewHomeHref = previewBasePath ?? undefined;
  const [bookingTarget, setBookingTarget] = useState<BookingTarget | null>(null);

  const model = useApplyDashboardModel({
    schoolName,
    schoolSlug,
    timezone,
    applications,
    applicationsWithTasks,
    showScheduleTourCta,
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
  });

  useEffect(() => {
    if (!focusApplicationId || typeof window === "undefined") return;
    const element = document.getElementById("preview-focus");
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusApplicationId]);

  // Enrollment confetti: once per browser session per school, never in previews.
  useCelebrate(
    hasEnrolledAccess && !previewMode,
    theme,
    enrolledCelebrationStorageKey(schoolSlug),
  );

  const handleSchedule = useCallback(
    (applicationId: string, task: ApplicationPostSubmitTask) =>
      setBookingTarget({ applicationId, task }),
    [],
  );

  const scrollToRequiredActions = useCallback(() => {
    document
      .getElementById(APPLY_REQUIRED_ACTIONS_ID)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const requiredTasks = applicationsWithTasks.flatMap((application) =>
    application.postSubmitTasks.filter((task) => task.required),
  );
  const requiredDone = requiredTasks.filter((task) => task.status === "scheduled").length;
  const hasRequiredSection = applicationsWithTasks.length > 0;

  const hasRows = model.rows.length > 0;
  const showNextStep = hasRows && !(model.showPortalStarter && model.todos.length === 0);
  const showVisits = upcomingCampusTours.length > 0 || showScheduleTourCta;
  const showRail = showVisits || hasRows || model.showPortalStarter;

  const header = (
    <ParentGardenPageHeader
      kicker={model.header.kicker}
      title={model.header.title}
      subtitle={model.header.subtitle}
      data-testid="apply-dashboard-header"
      actions={
        previewMode ? (
          <span aria-disabled="true" className={`${gBtnOutlineSm} w-full cursor-not-allowed whitespace-nowrap opacity-50 sm:w-auto`}>
            <Plus className="h-4 w-4 shrink-0" aria-hidden />
            New application
          </span>
        ) : (
          <NavigationLink href={model.newApplicationHref} className={`${gBtnOutlineSm} w-full whitespace-nowrap sm:w-auto`}>
            <Plus className="h-4 w-4 shrink-0" aria-hidden />
            New application
          </NavigationLink>
        )
      }
    />
  );

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
      openPortalLinksInNewTab={openPortalLinksInNewTab}
      previewMode={previewMode}
      previewHomeHref={previewHomeHref}
      suppressHelpFab={suppressHelpFab}
      toasterAppearance="garden"
      fullBleed
    >
      <ParentGardenFrame theme={theme} className="!min-h-[calc(100dvh-72px)] bg-[var(--sf-cream)]">
        <div className={`${PORTAL_HOME_CONTAINER_CLASS} pb-28`}>
          {header}

          {model.showPortalStarter && parentPortalHref ? (
            <ApplyEnrolledCard
              index={1}
              schoolName={schoolName}
              parentPortalHref={parentPortalHref}
              primary={model.todos.length === 0}
            />
          ) : null}

          <div
            className={`grid items-start gap-5 ${showRail ? "lg:grid-cols-[1.55fr_1fr]" : ""}`}
          >
            <div className="flex min-w-0 flex-col gap-5">
              {showNextStep ? (
                <ApplyNextStepCard
                  index={2}
                  todos={model.todos}
                  requiredDone={requiredDone}
                  requiredTotal={requiredTasks.length}
                  onBook={setBookingTarget}
                  onSeeAllSteps={hasRequiredSection ? scrollToRequiredActions : undefined}
                />
              ) : null}

              <ApplyApplicationsCard
                index={3}
                rows={model.rows}
                schoolName={schoolName}
                hasUpcomingVisits={upcomingCampusTours.length > 0}
                startApplicationHref={model.startApplicationHref}
                previewMode={previewMode}
                focusApplicationId={focusApplicationId}
              />

              {hasRequiredSection ? (
                <ApplyRequiredActionsSection
                  index={4}
                  applications={applicationsWithTasks}
                  onSchedule={handleSchedule}
                />
              ) : null}
            </div>

            {showRail ? (
              <div className="flex min-w-0 flex-col gap-5">
                {showVisits ? (
                  <ApplyVisitsCard
                    index={3}
                    visits={upcomingCampusTours}
                    showScheduleTourCta={showScheduleTourCta}
                    scheduleTourTitle={model.scheduleTourTitle}
                    scheduleTourSubtitle={model.scheduleTourSubtitle}
                    scheduleTourHref={model.scheduleTourHref}
                    previewMode={previewMode}
                  />
                ) : null}
                <ApplySummaryCard
                  index={4}
                  applicationCount={model.rows.length}
                  enrolledCount={model.enrolledCount}
                  pendingRequiredCount={model.pendingRequiredCount}
                  onPendingClick={hasRequiredSection ? scrollToRequiredActions : undefined}
                />
                {model.showPortalStarter && parentPortalHref ? (
                  <ApplyPortalStarterCard index={5} parentPortalHref={parentPortalHref} />
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </ParentGardenFrame>

      {bookingTarget ? (
        <PostSubmitBookingModal
          C={adminCompat}
          theme={theme}
          organizationId={organizationId}
          applicationId={bookingTarget.applicationId}
          task={bookingTarget.task}
          timezone={timezone}
          open={Boolean(bookingTarget)}
          onClose={() => setBookingTarget(null)}
          onBooked={() => router.refresh()}
          previewMode={previewMode}
          shadowDaySchedulingMode={shadowDaySchedulingMode}
        />
      ) : null}
    </ApplyPortalPageShell>
  );
}
