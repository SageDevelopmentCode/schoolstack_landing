import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ScheduleTourExperience from "@/components/admissions/ScheduleTourExperience";
import {
  familyPreviewBasePath,
  getFamilyPreviewProfile,
  listFamilyApplicationsForFamilyId,
} from "@/lib/admissions/family-preview-access";
import {
  familyHasScheduledCampusTour,
  hasPreEnrollmentApplication,
} from "@/lib/admissions/family-tour-booking";
import { getEnabledTourAuthEntryOption } from "@/lib/organization-settings/apply-auth-entry";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; familyId: string }>;
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
    title: `Schedule a tour · Family Preview · ${org.name}`,
  };
}

export default async function FamilyPreviewScheduleTourPage({ params }: PageProps) {
  const { slug, familyId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  const tourEntryOption = getEnabledTourAuthEntryOption(org.features);
  if (!tourEntryOption) {
    notFound();
  }

  const applications = await listFamilyApplicationsForFamilyId(
    supabase,
    org.id,
    familyId,
  );
  const hasPreEnrollmentApp = hasPreEnrollmentApplication(applications);
  const hasOnlyNewFamilyIntent = applications.length === 0;

  if (!hasPreEnrollmentApp && !hasOnlyNewFamilyIntent) {
    notFound();
  }

  const admin = createAdminClient();
  const applicationIds = applications.map((application) => application.id);
  const hasTour = await familyHasScheduledCampusTour(
    admin,
    org.id,
    familyId,
    applicationIds,
  );
  if (hasTour) {
    notFound();
  }

  const previewBasePath = familyPreviewBasePath(slug, familyId);

  const [timezoneResult, userProfile] = await Promise.all([
    supabase.from("organizations").select("timezone").eq("id", org.id).maybeSingle(),
    getFamilyPreviewProfile(supabase, org.id, familyId),
  ]);

  if (!userProfile.displayName) {
    notFound();
  }

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
      previewMode
      previewBasePath={previewBasePath}
      tourLabel={tourEntryOption.label}
      tourDescription={tourEntryOption.description}
    />
  );
}
