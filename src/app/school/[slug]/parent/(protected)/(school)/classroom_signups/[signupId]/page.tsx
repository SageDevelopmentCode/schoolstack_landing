import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ParentClassroomSignupDetailPage from "@/components/classroom-signups/parent/ParentClassroomSignupDetailPage";
import SchoolParentPageShell from "@/components/school-parent/SchoolParentPageShell";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import {
  listFamilyChildrenForHome,
  userHasEnrolledAccess,
} from "@/lib/admissions/parent-portal-access";
import {
  getFamilyClassroomSignupResponse,
  listClassroomSignupResponses,
} from "@/lib/classroom-signups/load-teacher-signups";
import { getParentVisibleClassroomSignup } from "@/lib/classroom-signups/load-parent-signups";
import { isParentFeatureEnabled } from "@/lib/organization-settings/parent-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { getRequestUser } from "@/lib/auth/session";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; signupId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentFeatureEnabled(org.features, "classroom_signups")) {
    return { title: "School Not Found" };
  }

  return {
    title: `Help in the classroom · ${org.name} Parent Portal`,
  };
}

export default async function ParentClassroomSignupDetailRoute({
  params,
}: PageProps) {
  const { slug, signupId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentFeatureEnabled(org.features, "classroom_signups")) {
    notFound();
  }

  const user = await getRequestUser();
  if (!user) {
    notFound();
  }

  const hasAccess = await userHasEnrolledAccess(supabase, user.id, org.id);
  if (!hasAccess) {
    notFound();
  }

  const familyIds = await getFamilyIdsForUser(supabase, user.id, org.id);
  const familyId = familyIds[0];
  if (!familyId) {
    notFound();
  }

  const admin = createAdminClient();
  const [initialSignup, initialResponses, initialFamilyResponse, familyChildren] =
    await Promise.all([
      getParentVisibleClassroomSignup(admin, org.id, familyId, signupId),
      listClassroomSignupResponses(admin, org.id, signupId),
      getFamilyClassroomSignupResponse(admin, org.id, signupId, familyId),
      listFamilyChildrenForHome(supabase, org.id, user.id),
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
      />
    </SchoolParentPageShell>
  );
}
