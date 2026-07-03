import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAdminPageLabel } from "@/lib/organization-settings/admin-nav";
import { isAdminFeatureEnabled } from "@/lib/organization-settings/admin-routes";
import SchoolAdminComingSoon from "@/components/school-admin/SchoolAdminComingSoon";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

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

  if (!org || !isAdminFeatureEnabled(org.features, feature)) {
    return { title: "School Not Found" };
  }

  const pageName = getAdminPageLabel(
    feature,
    org.features.feature_nav?.admin,
  );

  return {
    title: `${pageName} · ${org.name} Admin`,
  };
}

export default async function SchoolAdminFeaturePage({ params }: PageProps) {
  const { slug, feature } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isAdminFeatureEnabled(org.features, feature)) {
    notFound();
  }

  const pageName = getAdminPageLabel(
    feature,
    org.features.feature_nav?.admin,
  );

  return (
    <SchoolAdminComingSoon branding={org.branding} pageName={pageName} />
  );
}
