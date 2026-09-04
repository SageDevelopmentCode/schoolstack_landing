import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import SchoolParentBaseline from "@/components/school-parent/SchoolParentBaseline";
import {
  familyPreviewBasePath,
  familyPreviewParentBasePath,
} from "@/lib/admissions/family-preview-access";
import {
  familyHasEnrolledAccessInProgram,
  loadParentPortalNavContextsForFamily,
  loadProgramParentPortalContext,
} from "@/lib/admissions/program-parent-portal-access";
import { getFamilyPreviewProfile } from "@/lib/admissions/family-preview-server-cache";
import { programParentPortalHasEnabledFeatures } from "@/lib/organization-settings/resolve-program-parent-features";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string; familyId: string; programSlug: string }>;
};

export default async function FamilyPreviewProgramParentLayout({
  children,
  params,
}: LayoutProps) {
  const { slug, familyId, programSlug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  const previewParentBasePath = familyPreviewParentBasePath(slug, familyId);
  const programContext = await loadProgramParentPortalContext({
    supabase,
    organizationId: org.id,
    schoolSlug: slug,
    programSlug,
    orgFeatures: org.features,
    previewParentBasePath,
  });

  if (
    !programContext ||
    !programParentPortalHasEnabledFeatures(org.features, programContext.settings)
  ) {
    notFound();
  }

  const hasProgramAccess = await familyHasEnrolledAccessInProgram(
    supabase,
    org.id,
    familyId,
    programContext.programId,
  );

  if (!hasProgramAccess) {
    notFound();
  }

  const userProfile = await getFamilyPreviewProfile(supabase, org.id, familyId);
  const parentPortalContexts = await loadParentPortalNavContextsForFamily({
    supabase,
    organizationId: org.id,
    familyId,
    schoolSlug: slug,
    schoolName: org.name,
    orgFeatures: org.features,
    previewParentBasePath,
  });

  return (
    <SchoolParentBaseline
      slug={slug}
      organizationId={org.id}
      schoolName={org.name}
      branding={org.branding}
      features={programContext.effectiveFeatures}
      userProfile={userProfile}
      parentPortalContexts={parentPortalContexts}
      previewMode
      previewBasePath={familyPreviewBasePath(slug, familyId)}
      previewParentBasePath={previewParentBasePath}
      parentNavBasePath={programContext.parentNavBasePath}
      coopModeEnabled={programContext.coopMode}
      coopProgramLabel={programContext.displayLabel}
    >
      {children}
    </SchoolParentBaseline>
  );
}
