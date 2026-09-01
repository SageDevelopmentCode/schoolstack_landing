import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TeacherClassroomSignupDetailPage from "@/components/classroom-signups/teacher/TeacherClassroomSignupDetailPage";
import { getTeacherPageLabel } from "@/lib/organization-settings/teacher-nav";
import { isTeacherFeatureEnabled } from "@/lib/organization-settings/teacher-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import {
  getTeacherClassroomSignupById,
  listClassroomSignupResponses,
} from "@/lib/classroom-signups/load-teacher-signups";
import {
  getStaffMemberIdForUser,
  getStaffUserProfile,
  requireTeacherPortalUser,
} from "@/lib/staff/teacher-portal-access";
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

  if (!org || !isTeacherFeatureEnabled(org.features, "classroom_signups")) {
    return { title: "School Not Found" };
  }

  const pageName = getTeacherPageLabel(
    "classroom_signups",
    org.features.feature_nav?.teacher,
  );

  return {
    title: `${pageName} · ${org.name} Staff`,
  };
}

export default async function TeacherClassroomSignupDetailRoute({
  params,
}: PageProps) {
  const { slug, signupId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isTeacherFeatureEnabled(org.features, "classroom_signups")) {
    notFound();
  }

  const user = await requireTeacherPortalUser(supabase, org.id);
  const userProfile = await getStaffUserProfile(supabase, user.id, org.id, user);
  const staffMemberId = await getStaffMemberIdForUser(supabase, user.id, org.id);

  const admin = createAdminClient();
  const initialSignup =
    staffMemberId != null
      ? await getTeacherClassroomSignupById(
          admin,
          org.id,
          staffMemberId,
          signupId,
        )
      : null;
  const initialResponses = initialSignup
    ? await listClassroomSignupResponses(admin, org.id, signupId)
    : [];

  return (
    <TeacherClassroomSignupDetailPage
      slug={slug}
      organizationId={org.id}
      signupId={signupId}
      teacherName={userProfile.displayName}
      initialSignup={initialSignup}
      initialResponses={initialResponses}
    />
  );
}
