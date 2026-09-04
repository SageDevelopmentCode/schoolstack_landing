import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import SchoolParentBaseline from "@/components/school-parent/SchoolParentBaseline";
import { getRequestUser } from "@/lib/auth/session";
import {
  loadParentPortalNavContextsForUser,
  loadProgramParentPortalContext,
  userHasEnrolledAccessInProgram,
} from "@/lib/admissions/program-parent-portal-access";
import { programParentPortalHasEnabledFeatures } from "@/lib/organization-settings/resolve-program-parent-features";
import { getParentPortalUserProfile } from "@/lib/parent-portal/parent-portal-server-cache";
import { listSchoolPortalOptionsForUser } from "@/lib/auth/portal-switcher-server";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string; programSlug: string }>;
};

export default async function SchoolProgramParentLayout({
  children,
  params,
}: LayoutProps) {
  const { slug, programSlug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);
  const user = await getRequestUser();

  if (!org || !user) {
    notFound();
  }

  const programContext = await loadProgramParentPortalContext({
    supabase,
    organizationId: org.id,
    schoolSlug: slug,
    programSlug,
    orgFeatures: org.features,
  });

  if (!programContext) {
    notFound();
  }

  if (
    !programParentPortalHasEnabledFeatures(
      org.features,
      programContext.settings,
    )
  ) {
    notFound();
  }

  const hasProgramAccess = await userHasEnrolledAccessInProgram(
    supabase,
    user.id,
    org.id,
    programContext.programId,
  );

  if (!hasProgramAccess) {
    notFound();
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

  return (
    <SchoolParentBaseline
      slug={slug}
      organizationId={org.id}
      schoolName={org.name}
      branding={org.branding}
      features={programContext.effectiveFeatures}
      userProfile={userProfile}
      portalOptions={portalOptions}
      parentPortalContexts={parentPortalContexts}
      parentNavBasePath={programContext.parentNavBasePath}
      coopModeEnabled={programContext.coopMode}
      coopProgramLabel={programContext.displayLabel}
    >
      {children}
    </SchoolParentBaseline>
  );
}
