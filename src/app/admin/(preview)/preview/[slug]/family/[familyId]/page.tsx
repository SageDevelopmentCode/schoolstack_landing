import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ApplyDashboard from "@/components/admissions/ApplyDashboard";
import {
  familyHasEnrolledAccess,
  familyPreviewBasePath,
  getFamilyPreviewProfile,
  listFamilyApplicationsForFamilyId,
} from "@/lib/admissions/family-preview-access";
import { listEnrollmentProgressForApplications } from "@/lib/admissions/enrollment-checklist-materialization";
import { isParentPortalEnabled } from "@/lib/organization-settings/parent-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
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

  const enrollmentProgressByApplicationId = Object.fromEntries(
    (
      await listEnrollmentProgressForApplications(
        supabase,
        org.id,
        applications.map((application) => application.id),
      )
    ).entries(),
  );

  return (
    <ApplyDashboard
      branding={org.branding}
      schoolName={org.name}
      schoolSlug={slug}
      timezone={timezone}
      applications={applications}
      applicationsWithTasks={applicationsWithTasks}
      hasEnrolledAccess={hasEnrolledAccess}
      parentPortalEnabled={isParentPortalEnabled(org.features)}
      enrollmentProgressByApplicationId={enrollmentProgressByApplicationId}
      userProfile={userProfile}
      previewMode
      previewBasePath={previewBasePath}
      focusApplicationId={focus ?? null}
    />
  );
}
