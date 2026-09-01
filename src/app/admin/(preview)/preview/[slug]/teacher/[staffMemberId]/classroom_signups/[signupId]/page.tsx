import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TeacherClassroomSignupDetailPage from "@/components/classroom-signups/teacher/TeacherClassroomSignupDetailPage";
import { getTeacherPageLabel } from "@/lib/organization-settings/teacher-nav";
import { isTeacherFeatureEnabled } from "@/lib/organization-settings/teacher-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import {
  getStaffPreviewContext,
} from "@/lib/staff/staff-preview-server-cache";
import { staffPreviewBasePath } from "@/lib/staff/staff-preview-access";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; staffMemberId: string; signupId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isTeacherFeatureEnabled(org.features, "classroom_signups")) {
    return { title: "Preview Not Found" };
  }

  const pageName = getTeacherPageLabel(
    "classroom_signups",
    org.features.feature_nav?.teacher,
  );

  return {
    title: `${pageName} · ${org.name} Staff Preview`,
  };
}

export default async function StaffTeacherSignupDetailPreviewPage({
  params,
}: PageProps) {
  const { slug, staffMemberId, signupId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isTeacherFeatureEnabled(org.features, "classroom_signups")) {
    notFound();
  }

  const previewContext = await getStaffPreviewContext(
    supabase,
    org.id,
    staffMemberId,
  );

  if (!previewContext.portalRole || previewContext.membershipStatus !== "active") {
    notFound();
  }

  const previewBasePath = staffPreviewBasePath(slug, staffMemberId);

  return (
    <TeacherClassroomSignupDetailPage
      slug={slug}
      signupId={signupId}
      teacherName={previewContext.userProfile.displayName}
      teacherBasePath={previewBasePath}
      previewMode
    />
  );
}
