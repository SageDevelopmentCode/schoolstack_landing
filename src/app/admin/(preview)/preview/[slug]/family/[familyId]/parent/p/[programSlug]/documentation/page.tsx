import { cookies } from "next/headers";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ParentDocumentationPage from "@/components/school-parent/ParentDocumentationPage";
import SchoolParentPageShell from "@/components/school-parent/SchoolParentPageShell";
import { familyPreviewBasePath } from "@/lib/admissions/family-preview-access";
import {
  familyHasEnrolledAccessInProgram,
  loadProgramParentPortalContext,
} from "@/lib/admissions/program-parent-portal-access";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import {
  isParentPortalEnabled,
  parentDocumentationPath,
} from "@/lib/organization-settings/parent-routes";
import { programParentPortalHasEnabledFeatures } from "@/lib/organization-settings/resolve-program-parent-features";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; familyId: string; programSlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, programSlug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentPortalEnabled(org.features)) {
    return { title: "Preview Not Found" };
  }

  const programContext = await loadProgramParentPortalContext({
    supabase,
    organizationId: org.id,
    schoolSlug: slug,
    programSlug,
    orgFeatures: org.features,
  });

  if (!programContext) {
    return { title: "Preview Not Found" };
  }

  return {
    title: `How-to guides · ${programContext.displayLabel} Preview`,
  };
}

export default async function FamilyPreviewProgramParentDocumentationPage({
  params,
}: PageProps) {
  const { slug, familyId, programSlug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentPortalEnabled(org.features)) {
    notFound();
  }

  const previewBasePath = familyPreviewBasePath(slug, familyId);
  const programContext = await loadProgramParentPortalContext({
    supabase,
    organizationId: org.id,
    schoolSlug: slug,
    programSlug,
    orgFeatures: org.features,
    previewParentBasePath: `${previewBasePath}/parent`,
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

  const documentationBasePath = parentDocumentationPath(slug, {
    programSlug,
    previewBasePath,
  });
  const bulletinEnabled = Boolean(org.features.admin?.bulletin);

  return (
    <SchoolParentPageShell title="How-to guides">
      <Suspense fallback={null}>
        <ParentDocumentationPage
          slug={slug}
          schoolName={org.name}
          branding={org.branding}
          features={programContext.effectiveFeatures}
          coopModeEnabled={programContext.coopMode}
          bulletinEnabled={bulletinEnabled}
          programSlug={programSlug}
          parentNavBasePath={programContext.parentNavBasePath}
          previewBasePath={previewBasePath}
          documentationBasePath={documentationBasePath}
        />
      </Suspense>
    </SchoolParentPageShell>
  );
}
