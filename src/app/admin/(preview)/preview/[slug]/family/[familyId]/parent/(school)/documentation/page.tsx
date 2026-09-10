import { cookies } from "next/headers";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ParentDocumentationPage from "@/components/school-parent/ParentDocumentationPage";
import SchoolParentPageShell from "@/components/school-parent/SchoolParentPageShell";
import { familyPreviewBasePath } from "@/lib/admissions/family-preview-access";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import {
  isParentPortalEnabled,
  parentDocumentationPath,
} from "@/lib/organization-settings/parent-routes";
import { resolveMainParentOrganizationFeatures } from "@/lib/organization-settings/resolve-program-parent-features";
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

  if (!org || !isParentPortalEnabled(org.features)) {
    return { title: "Preview Not Found" };
  }

  return {
    title: `How-to guides · ${org.name} Parent Preview`,
  };
}

export default async function FamilyPreviewParentDocumentationPage({
  params,
}: PageProps) {
  const { slug, familyId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentPortalEnabled(org.features)) {
    notFound();
  }

  const features = resolveMainParentOrganizationFeatures(org.features);
  const previewBasePath = familyPreviewBasePath(slug, familyId);
  const documentationBasePath = parentDocumentationPath(slug, {
    previewBasePath,
  });

  return (
    <SchoolParentPageShell title="How-to guides">
      <Suspense fallback={null}>
        <ParentDocumentationPage
          slug={slug}
          schoolName={org.name}
          branding={org.branding}
          features={features}
          coopModeEnabled={false}
          previewBasePath={previewBasePath}
          documentationBasePath={documentationBasePath}
        />
      </Suspense>
    </SchoolParentPageShell>
  );
}
