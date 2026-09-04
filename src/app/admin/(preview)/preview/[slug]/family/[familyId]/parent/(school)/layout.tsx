import type { ReactNode } from "react";
import SchoolParentBaseline from "@/components/school-parent/SchoolParentBaseline";
import {
  familyPreviewBasePath,
  familyPreviewParentBasePath,
} from "@/lib/admissions/family-preview-access";
import { loadParentPortalNavContextsForFamily } from "@/lib/admissions/program-parent-portal-access";
import { getFamilyPreviewProfile } from "@/lib/admissions/family-preview-server-cache";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string; familyId: string }>;
};

export default async function FamilyPreviewMainParentLayout({
  children,
  params,
}: LayoutProps) {
  const { slug, familyId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    return children;
  }

  const userProfile = await getFamilyPreviewProfile(supabase, org.id, familyId);
  const previewBasePath = familyPreviewBasePath(slug, familyId);
  const previewParentBasePath = familyPreviewParentBasePath(slug, familyId);
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
      features={org.features}
      userProfile={userProfile}
      parentPortalContexts={parentPortalContexts}
      previewMode
      previewBasePath={previewBasePath}
      previewParentBasePath={previewParentBasePath}
    >
      {children}
    </SchoolParentBaseline>
  );
}
