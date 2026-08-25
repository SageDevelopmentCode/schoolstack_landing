import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ApplyDashboard from "@/components/admissions/ApplyDashboard";
import {
  familyPreviewBasePath,
  familyPreviewParentBasePath,
  listFamilyApplicationsForFamilyId,
} from "@/lib/admissions/family-preview-access";
import {
  familyHasEnrolledAccess,
  getFamilyPreviewProfile,
} from "@/lib/admissions/family-preview-server-cache";
import {
  familyHasScheduledCampusTour,
  listUpcomingCampusToursForFamily,
  shouldOfferApplyPortalTourBooking,
} from "@/lib/admissions/family-tour-booking";
import { getEnabledTourAuthEntryOption } from "@/lib/organization-settings/apply-auth-entry";
import { listEnrollmentProgressForApplications, listEnrollmentAgreementAmendmentsForApplications } from "@/lib/admissions/enrollment-checklist-materialization";
import { buildEnrollmentAgreementAmendmentBannerItemsFromApplications } from "@/lib/admissions/enrollment-agreement-amendment-banner";
import { getParentPortalHomeHref } from "@/lib/organization-settings/parent-nav";
import { isParentPortalEnabled } from "@/lib/organization-settings/parent-routes";
import {
  getAdmissionsOrgSettings,
  resolveShadowDaySchedulingMode,
} from "@/lib/admissions/admissions-org-settings";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; familyId: string }>;
  searchParams: Promise<{ focus?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    return { title: "Preview Not Found" };
  }

  return {
    title: `Family Preview · ${org.name}`,
  };
}

export default async function FamilyPreviewApplyPage({
  params,
  searchParams,
}: PageProps) {
  const { slug, familyId } = await params;
  const { focus } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  const previewBasePath = familyPreviewBasePath(slug, familyId);
  const previewParentBasePath = familyPreviewParentBasePath(slug, familyId);

  const [applications, hasEnrolledAccess, timezoneResult, userProfile] =
    await Promise.all([
      listFamilyApplicationsForFamilyId(supabase, org.id, familyId),
      familyHasEnrolledAccess(supabase, org.id, familyId),
      supabase.from("organizations").select("timezone").eq("id", org.id).maybeSingle(),
      getFamilyPreviewProfile(supabase, org.id, familyId),
    ]);

  if (applications.length === 0 && !userProfile.displayName) {
    notFound();
  }

  const timezone =
    typeof timezoneResult.data?.timezone === "string" &&
    timezoneResult.data.timezone.trim()
      ? timezoneResult.data.timezone
      : "America/Chicago";

  const applicationsWithTasks = applications.filter(
    (application) =>
      application.status !== "draft" && application.postSubmitTasks.length > 0,
  );

  const upcomingCampusTours = await listUpcomingCampusToursForFamily(
    supabase,
    org.id,
    [familyId],
    applications,
  );

  const tourEntryOption = getEnabledTourAuthEntryOption(org.features);
  const admin = createAdminClient();
  const applicationIds = applications.map((application) => application.id);
  const hasScheduledCampusTour = await familyHasScheduledCampusTour(
    admin,
    org.id,
    familyId,
    applicationIds,
  );
  const showScheduleTourCta = shouldOfferApplyPortalTourBooking({
    tourEntryEnabled: Boolean(tourEntryOption),
    applications,
    hasScheduledCampusTour,
  });

  const enrollmentProgressByApplicationId = Object.fromEntries(
    (
      await listEnrollmentProgressForApplications(
        supabase,
        org.id,
        applications.map((application) => application.id),
      )
    ).entries(),
  );

  const amendmentsByApplicationId = Object.fromEntries(
    (
      await listEnrollmentAgreementAmendmentsForApplications(
        supabase,
        org.id,
        applications.map((application) => application.id),
      )
    ).entries(),
  );
  const enrollmentAmendmentBannerItems =
    buildEnrollmentAgreementAmendmentBannerItemsFromApplications({
      schoolSlug: slug,
      applications,
      amendmentsByApplicationId,
      previewBasePath,
    });

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
      parentPortalEnabled={isParentPortalEnabled(org.features)}
      parentPortalHref={
        hasEnrolledAccess && isParentPortalEnabled(org.features)
          ? getParentPortalHomeHref(
              slug,
              org.features.parent,
              org.features.feature_nav?.parent,
              previewParentBasePath,
            ) ?? `${previewBasePath}/parent`
          : undefined
      }
      enrollmentProgressByApplicationId={enrollmentProgressByApplicationId}
      enrollmentAmendmentBannerItems={enrollmentAmendmentBannerItems}
      userProfile={userProfile}
      previewMode
      previewBasePath={previewBasePath}
      focusApplicationId={focus ?? null}
      shadowDaySchedulingMode={shadowDaySchedulingMode}
    />
  );
}
