import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { getFirstTeacherNavPath } from "@/lib/organization-settings/teacher-nav";
import { schoolTeacherPath } from "@/lib/organization-settings/teacher-routes";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SchoolTeacherIndexPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

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
