import { notFound, redirect } from "next/navigation";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { getFirstTeacherNavPath } from "@/lib/organization-settings/teacher-nav";
import { schoolTeacherPath } from "@/lib/organization-settings/teacher-routes";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SchoolTeacherIndexPage({ params }: PageProps) {
  const { slug } = await params;
  const org = await fetchOrganizationWithSettings(slug);

  if (!org) {
    notFound();
  }

  const firstPath = getFirstTeacherNavPath(
    slug,
    org.features.teacher,
    org.features.feature_nav?.teacher,
  );

  if (firstPath) {
    redirect(schoolTeacherPath(slug, firstPath.feature, firstPath.subtab));
  }

  redirect(schoolTeacherPath(slug, "dashboard"));
}
