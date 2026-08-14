import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import ApplyAuthPage from "@/components/admissions/ApplyAuthPage";
import ApplyDashboard from "@/components/admissions/ApplyDashboard";
import { listEnrollmentProgressForApplications } from "@/lib/admissions/enrollment-checklist-materialization";
import {
  familyHasScheduledCampusTour,
  listUpcomingCampusToursForFamily,
  shouldOfferApplyPortalTourBooking,
} from "@/lib/admissions/family-tour-booking";
import { getEnabledTourAuthEntryOption } from "@/lib/organization-settings/apply-auth-entry";
import {
  getFamilyUserProfile,
  listFamilyApplications,
  userHasEnrolledAccess,
} from "@/lib/admissions/parent-portal-access";
import {
  getAdmissionsOrgSettings,
  resolveShadowDaySchedulingMode,
} from "@/lib/admissions/admissions-org-settings";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { getParentPortalHomeHref } from "@/lib/organization-settings/parent-nav";
import { getTeacherPortalHomeHref } from "@/lib/organization-settings/teacher-nav";
import { isTeacherPortalEnabled } from "@/lib/organization-settings/teacher-routes";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import { userHasFamilyPortalAccess } from "@/lib/auth/portal-switcher-server";
import { userHasTeacherPortalAccess } from "@/lib/staff/teacher-portal-access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { listSchoolPortalOptionsForUser } from "@/lib/auth/portal-switcher-server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    return { title: "School Not Found" };
  }

  return {
    title: `Your Applications | ${org.name}`,
    description: `View and manage your applications to ${org.name}.`,
  };
}

export default async function SchoolApplyDashboardPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const [hasTeacherAccess, hasFamilyAccess] = await Promise.all([
      userHasTeacherPortalAccess(supabase, user.id, org.id),
      userHasFamilyPortalAccess(supabase, user.id, org.id),
    ]);

    if (
      hasTeacherAccess &&
      !hasFamilyAccess &&
      isTeacherPortalEnabled(org.features)
    ) {
      const teacherHref = getTeacherPortalHomeHref(
        slug,
        org.features.teacher,
        org.features.feature_nav?.teacher,
      );
      redirect(teacherHref ?? `/school/${slug}/teacher`);
    }
  }

  if (!user) {
    return (
      <ApplyAuthPage
        branding={org.branding}
        schoolName={org.name}
        organizationId={org.id}
        organizationSlug={slug}
      />
    );
  }

  const [applications, hasEnrolledAccess, timezoneResult, userProfile, familyIds] =
    await Promise.all([
    listFamilyApplications(supabase, org.id, user.id),
    userHasEnrolledAccess(supabase, user.id, org.id),
    supabase.from("organizations").select("timezone").eq("id", org.id).maybeSingle(),
    getFamilyUserProfile(supabase, user.id, org.id, user),
    getFamilyIdsForUser(supabase, user.id, org.id),
  ]);

  const upcomingCampusTours = await listUpcomingCampusToursForFamily(
    supabase,
    org.id,
    familyIds,
    applications,
  );

  const tourEntryOption = getEnabledTourAuthEntryOption(org.features);
  const admin = createAdminClient();
  const primaryFamilyId = familyIds[0];
  const applicationIds = applications.map((application) => application.id);
  const hasScheduledCampusTour =
    primaryFamilyId
      ? await familyHasScheduledCampusTour(
          admin,
          org.id,
          primaryFamilyId,
          applicationIds,
        )
      : false;

  const showScheduleTourCta = shouldOfferApplyPortalTourBooking({
    tourEntryEnabled: Boolean(tourEntryOption),
    applications,
    hasScheduledCampusTour,
  });

  const portalOptions = await listSchoolPortalOptionsForUser(supabase, user.id, slug, {
    org,
    hasEnrolledAccess,
  });

  const timezone =
    typeof timezoneResult.data?.timezone === "string" &&
    timezoneResult.data.timezone.trim()
      ? timezoneResult.data.timezone
      : "America/Chicago";

  const applicationsWithTasks = applications.filter(
    (application) =>
      application.status !== "draft" && application.postSubmitTasks.length > 0,
  );

  const enrollmentProgressByApplicationId = Object.fromEntries(
    (
      await listEnrollmentProgressForApplications(
        supabase,
        org.id,
        applications.map((application) => application.id),
      )
    ).entries(),
  );

  const parentPortalHref = getParentPortalHomeHref(
    slug,
    org.features.parent,
    org.features.feature_nav?.parent,
  );

  const admissionsSettings = await getAdmissionsOrgSettings(supabase, org.id);
  const shadowDaySchedulingMode = resolveShadowDaySchedulingMode(admissionsSettings);

  return (
    <ApplyDashboard
      branding={org.branding}
      schoolName={org.name}
      schoolSlug={slug}
      organizationId={org.id}
      timezone={timezone}
      applications={applications}
      applicationsWithTasks={applicationsWithTasks}
      upcomingCampusTours={upcomingCampusTours}
      showScheduleTourCta={showScheduleTourCta}
      scheduleTourLabel={tourEntryOption?.label}
      scheduleTourDescription={tourEntryOption?.description}
      hasEnrolledAccess={hasEnrolledAccess}
      parentPortalEnabled={org.features.parent.portal}
      parentPortalHref={parentPortalHref ?? undefined}
      enrollmentProgressByApplicationId={enrollmentProgressByApplicationId}
      userProfile={userProfile}
      portalOptions={portalOptions}
      shadowDaySchedulingMode={shadowDaySchedulingMode}
    />
  );
}
