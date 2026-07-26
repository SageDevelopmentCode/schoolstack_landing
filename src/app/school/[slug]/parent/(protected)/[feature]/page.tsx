import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import ParentHomePage from "@/components/school-parent/ParentHomePage";
import ParentBillingPage from "@/components/school-parent/billing/ParentBillingPage";
import SchoolParentComingSoon from "@/components/school-parent/SchoolParentComingSoon";
import SchoolParentPageShell from "@/components/school-parent/SchoolParentPageShell";
import {
  getFamilyUserProfile,
  listFamilyChildrenForHome,
} from "@/lib/admissions/parent-portal-access";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import { buildParentQuickActions } from "@/lib/organization-settings/parent-home";
import { getParentPageLabel } from "@/lib/organization-settings/parent-nav";
import {
  isParentFeatureEnabled,
  schoolParentPath,
} from "@/lib/organization-settings/parent-routes";
import {
  getEnabledFeatureNavChildren,
  mergePortalFeatureNav,
} from "@/lib/organization-settings/feature-nav";
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

  if (!org || !isParentFeatureEnabled(org.features, feature)) {
    return { title: "School Not Found" };
  }

  const pageName = getParentPageLabel(
    feature,
    org.features.feature_nav?.parent,
  );

  return {
    title: `${pageName} · ${org.name} Parent Portal`,
  };
}

export default async function SchoolParentFeaturePage({ params }: PageProps) {
  const { slug, feature } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentFeatureEnabled(org.features, feature)) {
    notFound();
  }

  const portalNav = mergePortalFeatureNav(
    "parent",
    org.features.feature_nav?.parent,
  );
  const children = getEnabledFeatureNavChildren("parent", feature, portalNav);

  if (children.length > 0) {
    redirect(schoolParentPath(slug, feature, children[0].key));
  }

  const pageName = getParentPageLabel(
    feature,
    org.features.feature_nav?.parent,
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  if (feature === "portal") {
    const [userProfile, familyChildren] = await Promise.all([
      getFamilyUserProfile(supabase, user.id, org.id, user),
      listFamilyChildrenForHome(supabase, org.id, user.id),
    ]);
    const quickActions = buildParentQuickActions(slug, org.features);

    return (
      <SchoolParentPageShell title={pageName}>
        <ParentHomePage
          branding={org.branding}
          schoolSlug={slug}
          userProfile={userProfile}
          familyChildren={familyChildren}
          quickActions={quickActions}
        />
      </SchoolParentPageShell>
    );
  }

  const userProfile = await getFamilyUserProfile(
    supabase,
    user.id,
    org.id,
    user,
  );

  if (feature === "billing") {
    const familyIds = await getFamilyIdsForUser(supabase, user.id, org.id);
    const familyId = familyIds[0];

    if (!familyId) {
      return (
        <SchoolParentPageShell title={pageName}>
          <SchoolParentComingSoon
            branding={org.branding}
            schoolSlug={slug}
            schoolName={org.name}
            organizationId={org.id}
            featureKey={feature}
            featureLabel={pageName}
            userProfile={userProfile}
          />
        </SchoolParentPageShell>
      );
    }

    return (
      <SchoolParentPageShell title={pageName}>
        <ParentBillingPage
          organizationId={org.id}
          familyId={familyId}
          branding={org.branding}
          slug={slug}
        />
      </SchoolParentPageShell>
    );
  }

  return (
    <SchoolParentPageShell title={pageName}>
      <SchoolParentComingSoon
        branding={org.branding}
        schoolSlug={slug}
        schoolName={org.name}
        organizationId={org.id}
        featureKey={feature}
        featureLabel={pageName}
        userProfile={userProfile}
      />
    </SchoolParentPageShell>
  );
}
