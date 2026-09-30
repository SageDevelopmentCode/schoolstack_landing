import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { familyPreviewBasePath } from "@/lib/admissions/family-preview-access";
import { resolveFamilyPreviewParentPortalHref } from "@/lib/admissions/preview-portal-options";
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

  const entryHref = await resolveFamilyPreviewParentPortalHref(
    supabase,
    org,
    familyId,
  );

  if (entryHref) {
    redirect(entryHref);
  }

  redirect(familyPreviewBasePath(slug, familyId));
}
