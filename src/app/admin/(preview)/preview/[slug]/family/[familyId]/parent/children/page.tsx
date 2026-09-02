import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ParentChildrenPage from "@/components/school-parent/ParentChildrenPage";
import SchoolParentPageShell from "@/components/school-parent/SchoolParentPageShell";
import {
  familyPreviewBasePath,
  listFamilyChildrenForHomeByFamilyId,
} from "@/lib/admissions/family-preview-access";
import { getFamilyPreviewProfile } from "@/lib/admissions/family-preview-server-cache";
import { loadStudentHealthProfilesForStudents } from "@/lib/student-health/load-student-health-profile";
import { createAdminClient } from "@/utils/supabase/admin";
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
  const userProfile = await getFamilyPreviewProfile(supabase, org.id, familyId);

  const admin = createAdminClient();

  const studentIds = familyChildren
    .map((child) => child.studentId)
    .filter((studentId): studentId is string => Boolean(studentId));

  const initialHealthProfiles =
    studentIds.length > 0
      ? await loadStudentHealthProfilesForStudents(admin, org.id, studentIds)
      : {};

  const pageName = getParentPageLabel("children", org.features.feature_nav?.parent);

  return (
    <SchoolParentPageShell title={pageName}>
      <ParentChildrenPage
        branding={org.branding}
        schoolName={org.name}
        schoolSlug={slug}
        organizationId={org.id}
        familyChildren={familyChildren}
        userProfile={userProfile}
        previewBasePath={familyPreviewBasePath(slug, familyId)}
        initialHealthProfiles={initialHealthProfiles}
      />
    </SchoolParentPageShell>
  );
}
