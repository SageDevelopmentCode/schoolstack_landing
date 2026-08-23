import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SchoolTeacherComingSoon from "@/components/school-teacher/SchoolTeacherComingSoon";
import TeacherDashboardPage from "@/components/school-teacher/TeacherDashboardPage";
import TeacherMyStudentsPage from "@/components/school-teacher/TeacherMyStudentsPage";
import TeacherMessagesPage from "@/components/school-teacher/TeacherMessagesPage";
import { getTeacherPageLabel } from "@/lib/organization-settings/teacher-nav";
import { isTeacherFeatureEnabled } from "@/lib/organization-settings/teacher-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import {
  getStaffPreviewContext,
} from "@/lib/staff/staff-preview-server-cache";
import {
  loadTeacherMessagesPreviewInbox,
  loadTeacherMyStudentsPreviewData,
  staffPreviewBasePath,
} from "@/lib/staff/staff-preview-access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; staffMemberId: string; feature: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, feature } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isTeacherFeatureEnabled(org.features, feature)) {
    return { title: "Preview Not Found" };
  }

  const pageName = getTeacherPageLabel(
    feature,
    org.features.feature_nav?.teacher,
  );

  return {
    title: `${pageName} · ${org.name} Staff Preview`,
  };
}

export default async function StaffTeacherPreviewFeaturePage({
  params,
}: PageProps) {
  const { slug, staffMemberId, feature } = await params;
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

  const previewContext = await getStaffPreviewContext(
    supabase,
    org.id,
    staffMemberId,
  );

  if (!previewContext.portalRole || previewContext.membershipStatus !== "active") {
    notFound();
  }

  const previewBasePath = staffPreviewBasePath(slug, staffMemberId);
  const admin = createAdminClient();

  if (feature === "dashboard") {
    return (
      <TeacherDashboardPage
        slug={slug}
        schoolName={org.name}
        branding={org.branding}
        features={org.features}
        userProfile={previewContext.userProfile}
        roleTitle={previewContext.roleTitle}
        portalRole={previewContext.portalRole}
        previewMode
        teacherBasePath={previewBasePath}
      />
    );
  }

  if (feature === "my_students") {
    const initialData = await loadTeacherMyStudentsPreviewData(
      admin,
      org.id,
      staffMemberId,
    );

    return (
      <TeacherMyStudentsPage
        organizationId={org.id}
        branding={org.branding}
        slug={slug}
        staffMemberId={initialData.staffMemberId}
        initialStudents={initialData.students}
        previewMode
      />
    );
  }

  if (feature === "messages") {
    const initialInbox = await loadTeacherMessagesPreviewInbox(
      admin,
      org.id,
      staffMemberId,
      org.name,
    );

    return (
      <TeacherMessagesPage
        organizationId={org.id}
        organizationSlug={slug}
        schoolName={org.name}
        branding={org.branding}
        staffMemberId={staffMemberId}
        initialInbox={initialInbox}
        previewMode
      />
    );
  }

  return (
    <SchoolTeacherComingSoon branding={org.branding} featureLabel={pageName} />
  );
}
