import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import SchoolTeacherComingSoon from "@/components/school-teacher/SchoolTeacherComingSoon";
import TeacherDashboardPage from "@/components/school-teacher/TeacherDashboardPage";
import TeacherMyStudentsPage from "@/components/school-teacher/TeacherMyStudentsPage";
import TeacherMessagesPage from "@/components/school-teacher/TeacherMessagesPage";
import { getTeacherPageLabel } from "@/lib/organization-settings/teacher-nav";
import { isTeacherFeatureEnabled } from "@/lib/organization-settings/teacher-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { loadTeacherMessagesPageData } from "@/lib/messages/load-messages-page-data";
import { loadTeacherMyStudentsPageData } from "@/lib/school-teacher/load-my-students-page-data";
import { loadTeacherDashboardInitialData } from "@/lib/school-teacher/load-teacher-dashboard-data";
import { loadTeacherCalendarInitialData } from "@/lib/school-events/load-teacher-calendar-data";
import {
  getStaffMemberIdForUser,
  getStaffUserProfile,
  requireTeacherPortalUser,
} from "@/lib/staff/teacher-portal-access";
import type { StaffPortalRole } from "@/lib/staff/staff-members";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const TeacherCalendarPage = nextDynamic(
  () => import("@/components/school-teacher/TeacherCalendarPage"),
);

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; feature: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, feature } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isTeacherFeatureEnabled(org.features, feature)) {
    return { title: "School Not Found" };
  }

  const pageName = getTeacherPageLabel(
    feature,
    org.features.feature_nav?.teacher,
  );

  return {
    title: `${pageName} · ${org.name} Staff`,
  };
}

export default async function SchoolTeacherFeaturePage({ params }: PageProps) {
  const { slug, feature } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isTeacherFeatureEnabled(org.features, feature)) {
    notFound();
  }

  const pageName = getTeacherPageLabel(
    feature,
    org.features.feature_nav?.teacher,
  );

  if (feature === "dashboard") {
    const user = await requireTeacherPortalUser(supabase, org.id);
    const userProfile = await getStaffUserProfile(
      supabase,
      user.id,
      org.id,
      user,
    );

    const { data: staffMember } = await supabase
      .from("staff_members")
      .select("role_title")
      .eq("organization_id", org.id)
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: membership } = await supabase
      .from("organization_memberships")
      .select("role")
      .eq("organization_id", org.id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    const portalRole =
      membership?.role === "teacher" || membership?.role === "staff"
        ? (membership.role as StaffPortalRole)
        : null;

    const initialSummary = await loadTeacherDashboardInitialData({
      organizationId: org.id,
      slug,
      features: org.features,
      userId: user.id,
      schoolName: org.name,
    });

    return (
      <TeacherDashboardPage
        organizationId={org.id}
        slug={slug}
        schoolName={org.name}
        branding={org.branding}
        features={org.features}
        userProfile={userProfile}
        roleTitle={
          typeof staffMember?.role_title === "string"
            ? staffMember.role_title
            : null
        }
        portalRole={portalRole}
        initialSummary={initialSummary}
      />
    );
  }

  if (feature === "my_students") {
    const user = await requireTeacherPortalUser(supabase, org.id);
    const initialData = await loadTeacherMyStudentsPageData(org.id, user.id);

    return (
      <TeacherMyStudentsPage
        organizationId={org.id}
        branding={org.branding}
        slug={slug}
        staffMemberId={initialData.staffMemberId}
        initialStudents={initialData.students}
      />
    );
  }

  if (feature === "messages") {
    const user = await requireTeacherPortalUser(supabase, org.id);
    const staffMemberId = await getStaffMemberIdForUser(
      supabase,
      user.id,
      org.id,
    );
    const admin = createAdminClient();
    const initialInbox = staffMemberId
      ? await loadTeacherMessagesPageData(
          admin,
          org.id,
          user.id,
          staffMemberId,
          org.name,
        )
      : { threads: [], contacts: [] };

    return (
      <TeacherMessagesPage
        organizationId={org.id}
        organizationSlug={slug}
        schoolName={org.name}
        branding={org.branding}
        staffMemberId={staffMemberId}
        initialInbox={initialInbox}
      />
    );
  }

  if (feature === "calendar") {
    await requireTeacherPortalUser(supabase, org.id);
    const initialData = await loadTeacherCalendarInitialData({
      organizationId: org.id,
    });

    return (
      <TeacherCalendarPage branding={org.branding} initialData={initialData} />
    );
  }

  return (
    <SchoolTeacherComingSoon branding={org.branding} featureLabel={pageName} />
  );
}
