import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ParentClassroomSignupDetailPage from "@/components/classroom-signups/parent/ParentClassroomSignupDetailPage";
import SchoolParentPageShell from "@/components/school-parent/SchoolParentPageShell";
import { familyPreviewBasePath } from "@/lib/admissions/family-preview-access";
import {
  getFamilyClassroomSignupResponse,
  listClassroomSignupResponses,
} from "@/lib/classroom-signups/load-teacher-signups";
import { getParentVisibleClassroomSignup } from "@/lib/classroom-signups/load-parent-signups";
import { isParentFeatureEnabled } from "@/lib/organization-settings/parent-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { listFamilyChildrenForHomeByFamilyId } from "@/lib/admissions/family-preview-access";
import { createAdminClient } from "@/utils/supabase/admin";
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
  const admin = createAdminClient();
  const [initialSignup, initialResponses, initialFamilyResponse, familyChildren] =
    await Promise.all([
      getParentVisibleClassroomSignup(admin, org.id, familyId, signupId),
      listClassroomSignupResponses(admin, org.id, signupId),
      getFamilyClassroomSignupResponse(admin, org.id, signupId, familyId),
      listFamilyChildrenForHomeByFamilyId(supabase, org.id, familyId),
    ]);

  return (
    <SchoolParentPageShell title="Help in the classroom">
      <ParentClassroomSignupDetailPage
        slug={slug}
        organizationId={org.id}
        signupId={signupId}
        initialSignup={initialSignup}
        initialResponses={initialResponses}
        initialFamilyResponse={
          initialFamilyResponse?.status === "confirmed"
            ? initialFamilyResponse
            : null
        }
        studentOptions={familyChildren
          .filter((child) => child.studentId)
          .map((child) => ({
            id: child.studentId!,
            name: child.studentName,
          }))}
        previewBasePath={previewBasePath}
        readOnly
      />
    </SchoolParentPageShell>
  );
}
