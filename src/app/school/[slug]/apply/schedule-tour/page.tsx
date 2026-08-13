import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import ScheduleTourExperience from "@/components/admissions/ScheduleTourExperience";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import {
  familyHasScheduledCampusTour,
  hasPreEnrollmentApplication,
} from "@/lib/admissions/family-tour-booking";
import {
  getFamilyUserProfile,
  listFamilyApplications,
  userHasEnrolledAccess,
} from "@/lib/admissions/parent-portal-access";
import { getEnabledTourAuthEntryOption } from "@/lib/organization-settings/apply-auth-entry";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { listSchoolPortalOptionsForUser } from "@/lib/auth/portal-switcher-server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

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
    title: `Schedule a tour | ${org.name}`,
    description: `Book a campus tour at ${org.name}.`,
  };
}

export default async function ScheduleTourPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  const tourEntryOption = getEnabledTourAuthEntryOption(org.features);
  if (!tourEntryOption) {
    redirect(`/school/${slug}/forms/apply`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/school/${slug}/apply`);
  }

  const familyIds = await getFamilyIdsForUser(supabase, user.id, org.id);
  if (familyIds.length === 0) {
    redirect(`/school/${slug}/forms/apply`);
  }

  const applications = await listFamilyApplications(supabase, org.id, user.id);
  const hasPreEnrollmentApp = hasPreEnrollmentApplication(applications);
  const hasOnlyNewFamilyIntent = applications.length === 0;

  if (!hasPreEnrollmentApp && !hasOnlyNewFamilyIntent) {
    redirect(`/school/${slug}/apply`);
  }

  const admin = createAdminClient();
  const primaryFamilyId = familyIds[0];
  const applicationIds = applications.map((application) => application.id);
  const hasTour = await familyHasScheduledCampusTour(
    admin,
    org.id,
    primaryFamilyId,
    applicationIds,
  );
  if (hasTour) {
    redirect(`/school/${slug}/apply`);
  }

  const [timezoneResult, userProfile, hasEnrolledAccess] = await Promise.all([
    supabase.from("organizations").select("timezone").eq("id", org.id).maybeSingle(),
    getFamilyUserProfile(supabase, user.id, org.id, user),
    userHasEnrolledAccess(supabase, user.id, org.id),
  ]);

  const portalOptions = await listSchoolPortalOptionsForUser(supabase, user.id, slug, {
    org,
    hasEnrolledAccess,
  });

  const timezone =
    typeof timezoneResult.data?.timezone === "string" &&
    timezoneResult.data.timezone.trim()
      ? timezoneResult.data.timezone
      : "America/Chicago";

  return (
    <ScheduleTourExperience
      branding={org.branding}
      schoolName={org.name}
      schoolSlug={slug}
      organizationId={org.id}
      timezone={timezone}
      userProfile={userProfile}
      portalOptions={portalOptions}
      tourLabel={tourEntryOption.label}
      tourDescription={tourEntryOption.description}
    />
  );
}
