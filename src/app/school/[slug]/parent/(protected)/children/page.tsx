import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ParentChildrenPage from "@/components/school-parent/ParentChildrenPage";
import SchoolParentPageShell from "@/components/school-parent/SchoolParentPageShell";
import { getFamilyUserProfile, listFamilyChildrenForHome } from "@/lib/admissions/parent-portal-access";
import { getParentPageLabel } from "@/lib/organization-settings/parent-nav";
import { isParentFeatureEnabled } from "@/lib/organization-settings/parent-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentFeatureEnabled(org.features, "children")) {
    return { title: "School Not Found" };
  }

  const pageName = getParentPageLabel("children", org.features.feature_nav?.parent);

  return {
    title: `${pageName} · ${org.name} Parent Portal`,
  };
}

export default async function SchoolParentChildrenPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentFeatureEnabled(org.features, "children")) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Overview cards only — full application schemas load when a profile panel opens.
  const [familyChildren, userProfile] = await Promise.all([
    listFamilyChildrenForHome(supabase, org.id, user.id),
    getFamilyUserProfile(supabase, user.id, org.id, user),
  ]);

  const pageName = getParentPageLabel("children", org.features.feature_nav?.parent);

  return (
    <SchoolParentPageShell title={pageName}>
      <ParentChildrenPage
        branding={org.branding}
        schoolName={org.name}
        schoolSlug={slug}
        organizationId={org.id}
        familyChildren={familyChildren}
        userProfile={userProfile}
      />
    </SchoolParentPageShell>
  );
}
