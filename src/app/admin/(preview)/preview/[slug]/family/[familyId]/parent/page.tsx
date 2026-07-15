import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import ParentHomePage from "@/components/school-parent/ParentHomePage";
import {
  familyHasEnrolledAccess,
  familyPreviewBasePath,
  getFamilyPreviewProfile,
  listFamilyChildrenForHomeByFamilyId,
} from "@/lib/admissions/family-preview-access";
import { buildParentQuickActions } from "@/lib/organization-settings/parent-home";
import { isParentPortalEnabled } from "@/lib/organization-settings/parent-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; familyId: string }>;
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
    title: `Parent Preview · ${org.name}`,
  };
}

export default async function FamilyPreviewParentPage({ params }: PageProps) {
  const { slug, familyId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  if (!isParentPortalEnabled(org.features)) {
    redirect(familyPreviewBasePath(slug, familyId));
  }

  const hasEnrolledAccess = await familyHasEnrolledAccess(supabase, org.id, familyId);
  if (!hasEnrolledAccess) {
    redirect(familyPreviewBasePath(slug, familyId));
  }

  const [userProfile, familyChildren] = await Promise.all([
    getFamilyPreviewProfile(supabase, org.id, familyId),
    listFamilyChildrenForHomeByFamilyId(supabase, org.id, familyId),
  ]);

  const quickActions = buildParentQuickActions(slug, org.features);
  const previewBasePath = familyPreviewBasePath(slug, familyId);

  return (
    <ParentHomePage
      branding={org.branding}
      schoolSlug={slug}
      userProfile={userProfile}
      familyChildren={familyChildren}
      quickActions={quickActions}
      previewMode
      previewBasePath={previewBasePath}
    />
  );
}
