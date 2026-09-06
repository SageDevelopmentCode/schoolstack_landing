import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { familyPreviewParentPath } from "@/lib/admissions/family-preview-access";
import { getFirstParentNavPath } from "@/lib/organization-settings/parent-nav";
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

export default async function FamilyPreviewParentIndexPage({ params }: PageProps) {
  const { slug, familyId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  const firstPath = getFirstParentNavPath(
    slug,
    org.features.parent,
    org.features.feature_nav?.parent,
  );

  if (firstPath) {
    redirect(
      familyPreviewParentPath(slug, familyId, firstPath.feature, firstPath.subtab),
    );
  }

  redirect(familyPreviewParentPath(slug, familyId, "portal"));
}
