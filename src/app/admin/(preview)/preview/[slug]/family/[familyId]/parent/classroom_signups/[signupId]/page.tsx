import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ParentClassroomSignupDetailPage from "@/components/classroom-signups/parent/ParentClassroomSignupDetailPage";
import SchoolParentPageShell from "@/components/school-parent/SchoolParentPageShell";
import { familyPreviewBasePath } from "@/lib/admissions/family-preview-access";
import { isParentFeatureEnabled } from "@/lib/organization-settings/parent-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; familyId: string; signupId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentFeatureEnabled(org.features, "classroom_signups")) {
    return { title: "Preview Not Found" };
  }

  return {
    title: `Help in the classroom · ${org.name} Parent Preview`,
  };
}

export default async function FamilyPreviewClassroomSignupPage({
  params,
}: PageProps) {
  const { slug, familyId, signupId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentFeatureEnabled(org.features, "classroom_signups")) {
    notFound();
  }

  const previewBasePath = familyPreviewBasePath(slug, familyId);

  return (
    <SchoolParentPageShell title="Help in the classroom">
      <ParentClassroomSignupDetailPage
        slug={slug}
        signupId={signupId}
        previewBasePath={previewBasePath}
        readOnly
      />
    </SchoolParentPageShell>
  );
}
