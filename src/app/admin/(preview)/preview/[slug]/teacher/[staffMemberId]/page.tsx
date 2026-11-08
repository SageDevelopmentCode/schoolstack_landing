import { notFound, redirect } from "next/navigation";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { getTeacherPortalHomeHref } from "@/lib/organization-settings/teacher-nav";
import { staffPreviewBasePath } from "@/lib/staff/staff-preview-access";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; staffMemberId: string }>;
};

export default async function StaffTeacherPreviewIndexPage({
  params,
}: PageProps) {
  const { slug, staffMemberId } = await params;
  const org = await fetchOrganizationWithSettings(slug);

  if (!org) {
    notFound();
  }

  const previewBasePath = staffPreviewBasePath(slug, staffMemberId);
  const homeHref = getTeacherPortalHomeHref(
    slug,
    org.features.teacher,
    org.features.feature_nav?.teacher,
    previewBasePath,
  );

  if (homeHref) {
    redirect(homeHref);
  }

  redirect(`${previewBasePath}/dashboard`);
}
