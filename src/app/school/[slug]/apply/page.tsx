import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ApplyAuthPage from "@/components/admissions/ApplyAuthPage";
import ApplyDashboard from "@/components/admissions/ApplyDashboard";
import { listEnrollmentProgressForApplications } from "@/lib/admissions/enrollment-checklist-materialization";
import {
  getFamilyUserProfile,
  listFamilyApplications,
  userHasEnrolledAccess,
} from "@/lib/admissions/parent-portal-access";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { getParentPortalHomeHref } from "@/lib/organization-settings/parent-nav";
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

  const [applications, hasEnrolledAccess, timezoneResult, userProfile, portalOptions] =
    await Promise.all([
    listFamilyApplications(supabase, org.id, user.id),
    userHasEnrolledAccess(supabase, user.id, org.id),
    supabase.from("organizations").select("timezone").eq("id", org.id).maybeSingle(),
    getFamilyUserProfile(supabase, user.id, org.id, user),
    listSchoolPortalOptionsForUser(supabase, user.id, slug),
  ]);

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

  return (
    <ApplyDashboard
      branding={org.branding}
      schoolName={org.name}
      schoolSlug={slug}
      organizationId={org.id}
      timezone={timezone}
      applications={applications}
      applicationsWithTasks={applicationsWithTasks}
      hasEnrolledAccess={hasEnrolledAccess}
      parentPortalEnabled={org.features.parent.portal}
      parentPortalHref={parentPortalHref ?? undefined}
      enrollmentProgressByApplicationId={enrollmentProgressByApplicationId}
      userProfile={userProfile}
      portalOptions={portalOptions}
    />
  );
}
