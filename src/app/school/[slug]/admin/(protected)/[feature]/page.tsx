import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getAdminPageLabel } from "@/lib/organization-settings/admin-nav";
import {
  isAdminFeatureEnabled,
  schoolAdminPath,
} from "@/lib/organization-settings/admin-routes";
import {
  getEnabledFeatureNavChildren,
  mergePortalFeatureNav,
} from "@/lib/organization-settings/feature-nav";
import SchedulePage from "@/components/school-admin/SchedulePage";
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

  const portalNav = mergePortalFeatureNav("admin", org.features.feature_nav?.admin);
  const children = getEnabledFeatureNavChildren("admin", feature, portalNav);

  if (children.length > 0) {
    redirect(schoolAdminPath(slug, feature, children[0].key));
  }

  if (feature === "schedule") {
    return (
      <SchedulePage
        organizationId={org.id}
        branding={org.branding}
        schoolName={org.name}
        slug={slug}
      />
    );
  }

  const pageName = getAdminPageLabel(
    feature,
    org.features.feature_nav?.admin,
  );

  return (
    <SchoolAdminComingSoon branding={org.branding} pageName={pageName} />
  );
}
