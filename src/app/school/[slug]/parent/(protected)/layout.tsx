import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import ParentAuthPage from "@/components/admissions/ParentAuthPage";
import SchoolParentBaseline from "@/components/school-parent/SchoolParentBaseline";
import { getRequestUser } from "@/lib/auth/session";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { getParentPortalUserProfile } from "@/lib/parent-portal/parent-portal-server-cache";
import { listSchoolPortalOptionsForUser } from "@/lib/auth/portal-switcher-server";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { isParentPortalEnabled } from "@/lib/organization-settings/parent-routes";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function SchoolParentProtectedLayout({
  children,
  params,
}: LayoutProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  if (!isParentPortalEnabled(org.features)) {
    redirect(`/school/${slug}/apply`);
  }

  const user = await getRequestUser();

  if (!user) {
    return (
      <ParentAuthPage
        branding={org.branding}
        schoolName={org.name}
        organizationId={org.id}
        organizationSlug={slug}
      />
    );
  }

  const hasEnrolledAccess = await userHasEnrolledAccess(
    supabase,
    user.id,
    org.id,
  );

  if (!hasEnrolledAccess) {
    redirect(`/school/${slug}/apply`);
  }

  // Enrolled parents always have family access; skip re-checking both in the switcher.
  const [userProfile, portalOptions] = await Promise.all([
    getParentPortalUserProfile(supabase, org.id),
    listSchoolPortalOptionsForUser(supabase, user.id, slug, {
      org,
      hasEnrolledAccess: true,
      hasFamilyAccess: true,
    }),
  ]);

  return (
    <SchoolParentBaseline
      slug={slug}
      organizationId={org.id}
      schoolName={org.name}
      branding={org.branding}
      features={org.features}
      userProfile={userProfile}
      portalOptions={portalOptions}
    >
      {children}
    </SchoolParentBaseline>
  );
}
