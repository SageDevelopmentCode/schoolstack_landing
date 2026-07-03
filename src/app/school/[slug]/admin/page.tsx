import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getFirstAdminNavPath } from "@/lib/organization-settings/admin-nav";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import SchoolAdminEmptyState from "@/components/school-admin/SchoolAdminEmptyState";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SchoolAdminPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    return null;
  }

  const firstPath = getFirstAdminNavPath(
    org.features.admin,
    org.features.feature_nav?.admin,
  );

  if (firstPath) {
    redirect(schoolAdminPath(slug, firstPath.feature, firstPath.subtab));
  }

  return <SchoolAdminEmptyState branding={org.branding} />;
}
