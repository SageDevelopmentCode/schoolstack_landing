import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import SchoolParentBaseline from "@/components/school-parent/SchoolParentBaseline";
import { getRequestUser } from "@/lib/auth/session";
import {
  loadParentPortalNavContextsForUser,
  shouldRedirectAwayFromMainParentPortal,
} from "@/lib/admissions/program-parent-portal-access";
import { getParentPortalUserProfile } from "@/lib/parent-portal/parent-portal-server-cache";
import { listSchoolPortalOptionsForUser } from "@/lib/auth/portal-switcher-server";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function SchoolParentMainLayout({
  children,
  params,
}: LayoutProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);
  const user = await getRequestUser();

  if (!org || !user) {
    return children;
  }

  const [userProfile, portalOptions, parentPortalContexts] = await Promise.all([
    getParentPortalUserProfile(supabase, org.id),
    listSchoolPortalOptionsForUser(supabase, user.id, slug, {
      org,
      hasEnrolledAccess: true,
      hasFamilyAccess: true,
    }),
    loadParentPortalNavContextsForUser({
      supabase,
      userId: user.id,
      organizationId: org.id,
      schoolSlug: slug,
      schoolName: org.name,
      orgFeatures: org.features,
    }),
  ]);

  if (shouldRedirectAwayFromMainParentPortal(parentPortalContexts)) {
    const entryHref = parentPortalContexts[0]?.entryHref;
    if (entryHref) {
      redirect(entryHref);
    }
  }

  return (
    <SchoolParentBaseline
      slug={slug}
      organizationId={org.id}
      schoolName={org.name}
      branding={org.branding}
      features={org.features}
      userProfile={userProfile}
      portalOptions={portalOptions}
      parentPortalContexts={parentPortalContexts}
    >
      {children}
    </SchoolParentBaseline>
  );
}
