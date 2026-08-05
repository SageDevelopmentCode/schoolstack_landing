import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ParentChildrenPage from "@/components/school-parent/ParentChildrenPage";
import SchoolParentPageShell from "@/components/school-parent/SchoolParentPageShell";
import { loadEnrollmentChecklistForApplication } from "@/lib/admissions/enrollment-checklist-materialization";
import {
  familyPreviewBasePath,
  loadApplicationDetailForFamily,
  listFamilyChildrenForHomeByFamilyId,
} from "@/lib/admissions/family-preview-access";
import type { ChildProfileData } from "@/lib/admissions/parent-portal-access";
import { getParentPageLabel } from "@/lib/organization-settings/parent-nav";
import { isParentFeatureEnabled } from "@/lib/organization-settings/parent-routes";
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

  if (!org || !isParentFeatureEnabled(org.features, "children")) {
    return { title: "Preview Not Found" };
  }

  const pageName = getParentPageLabel("children", org.features.feature_nav?.parent);

  return {
    title: `${pageName} · ${org.name} Parent Preview`,
  };
}

export default async function FamilyPreviewParentChildrenPage({ params }: PageProps) {
  const { slug, familyId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentFeatureEnabled(org.features, "children")) {
    notFound();
  }

  const familyChildren = await listFamilyChildrenForHomeByFamilyId(
    supabase,
    org.id,
    familyId,
  );

  const childProfileEntries = await Promise.all(
    familyChildren.map(async (child) => {
      const [application, checklist] = await Promise.all([
        loadApplicationDetailForFamily(
          supabase,
          org.id,
          familyId,
          child.applicationId,
        ),
        loadEnrollmentChecklistForApplication(
          supabase,
          child.applicationId,
          org.id,
        ),
      ]);
      if (!application) return null;
      return [child.applicationId, { application, checklist }] as const;
    }),
  );

  const childProfiles: Record<string, ChildProfileData> = Object.fromEntries(
    childProfileEntries.filter(
      (entry): entry is readonly [string, ChildProfileData] => entry !== null,
    ),
  );

  const pageName = getParentPageLabel("children", org.features.feature_nav?.parent);

  return (
    <SchoolParentPageShell title={pageName}>
      <ParentChildrenPage
        branding={org.branding}
        schoolName={org.name}
        schoolSlug={slug}
        familyChildren={familyChildren}
        childProfiles={childProfiles}
        previewBasePath={familyPreviewBasePath(slug, familyId)}
      />
    </SchoolParentPageShell>
  );
}
