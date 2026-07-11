import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import SchoolParentEmptyState from "@/components/school-parent/SchoolParentEmptyState";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { getFirstParentNavPath } from "@/lib/organization-settings/parent-nav";
import { schoolParentPath } from "@/lib/organization-settings/parent-routes";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SchoolParentIndexPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  const firstPath = getFirstParentNavPath(
    slug,
    org.features.parent,
    org.features.feature_nav?.parent,
  );

  if (firstPath) {
    redirect(schoolParentPath(slug, firstPath.feature, firstPath.subtab));
  }

  return <SchoolParentEmptyState branding={org.branding} />;
}
