import { cookies } from "next/headers";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ParentDocumentationPage from "@/components/school-parent/ParentDocumentationPage";
import SchoolParentPageShell from "@/components/school-parent/SchoolParentPageShell";
import {
  loadProgramParentPortalContext,
  userHasEnrolledAccessInProgram,
} from "@/lib/admissions/program-parent-portal-access";
import { getRequestUser } from "@/lib/auth/session";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import {
  isParentPortalEnabled,
  parentDocumentationPath,
} from "@/lib/organization-settings/parent-routes";
import { programParentPortalHasEnabledFeatures } from "@/lib/organization-settings/resolve-program-parent-features";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; programSlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, programSlug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentPortalEnabled(org.features)) {
    return { title: "School Not Found" };
  }

  const programContext = await loadProgramParentPortalContext({
    supabase,
    organizationId: org.id,
    schoolSlug: slug,
    programSlug,
    orgFeatures: org.features,
  });

  if (!programContext) {
    return { title: "School Not Found" };
  }

  return {
    title: `How-to guides · ${programContext.displayLabel}`,
  };
}

export default async function SchoolProgramParentDocumentationRoute({
  params,
}: PageProps) {
  const { slug, programSlug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);
  const user = await getRequestUser();

  if (!org || !user || !isParentPortalEnabled(org.features)) {
    notFound();
  }

  const programContext = await loadProgramParentPortalContext({
    supabase,
    organizationId: org.id,
    schoolSlug: slug,
    programSlug,
    orgFeatures: org.features,
  });

  if (
    !programContext ||
    !programParentPortalHasEnabledFeatures(org.features, programContext.settings)
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

  const documentationBasePath = parentDocumentationPath(slug, {
    programSlug,
    parentNavBasePath: programContext.parentNavBasePath,
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
          documentationBasePath={documentationBasePath}
        />
      </Suspense>
    </SchoolParentPageShell>
  );
}
