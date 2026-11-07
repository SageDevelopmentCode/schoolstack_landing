import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTeacherPageLabel } from "@/lib/organization-settings/teacher-nav";
import {
  isTeacherFeatureEnabled,
  teacherClassroomSignupPath,
} from "@/lib/organization-settings/teacher-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { staffPreviewBasePath } from "@/lib/staff/staff-preview-access";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; staffMemberId: string; signupId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const org = await fetchOrganizationWithSettings(slug);

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
  const org = await fetchOrganizationWithSettings(slug);

  if (!org || !isTeacherFeatureEnabled(org.features, "classroom_signups")) {
    notFound();
  }

  const previewBasePath = staffPreviewBasePath(slug, staffMemberId);
  redirect(
    teacherClassroomSignupPath(slug, signupId, `${previewBasePath}/classroom_signups`),
  );
}
