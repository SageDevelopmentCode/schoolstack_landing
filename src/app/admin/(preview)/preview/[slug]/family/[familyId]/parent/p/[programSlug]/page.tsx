import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  familyPreviewParentBasePath,
  familyPreviewProgramParentPath,
} from "@/lib/admissions/family-preview-access";
import { loadProgramParentPortalContext } from "@/lib/admissions/program-parent-portal-access";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { getFirstParentNavPath } from "@/lib/organization-settings/parent-nav";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; familyId: string; programSlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, familyId, programSlug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);
  const previewParentBasePath = familyPreviewParentBasePath(slug, familyId);
  const programContext = org
    ? await loadProgramParentPortalContext({
        supabase,
        organizationId: org.id,
        schoolSlug: slug,
        programSlug,
        orgFeatures: org.features,
        previewParentBasePath,
      })
    : null;

  if (!org || !programContext) {
    return { title: "Preview Not Found" };
  }

  return {
    title: `${programContext.displayLabel} · ${org.name} Parent Preview`,
  };
}

export default async function FamilyPreviewProgramParentIndexPage({
  params,
}: PageProps) {
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

  if (!programContext) {
    notFound();
  }

  const firstPath = getFirstParentNavPath(
    slug,
    programContext.effectiveFeatures.parent,
    programContext.effectiveFeatures.feature_nav?.parent,
    programContext.parentNavBasePath,
  );

  if (firstPath) {
    redirect(
      familyPreviewProgramParentPath(
        slug,
        familyId,
        programSlug,
        firstPath.feature,
        firstPath.subtab,
      ),
    );
  }

  redirect(familyPreviewProgramParentPath(slug, familyId, programSlug, "portal"));
}
