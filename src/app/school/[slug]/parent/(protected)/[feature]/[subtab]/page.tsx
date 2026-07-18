import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SchoolParentComingSoon from "@/components/school-parent/SchoolParentComingSoon";
import SchoolParentPageShell from "@/components/school-parent/SchoolParentPageShell";
import { getFamilyUserProfile } from "@/lib/admissions/parent-portal-access";
import {
  getParentPageLabel,
  getParentSubtabLabel,
} from "@/lib/organization-settings/parent-nav";
import { isParentNavPathEnabled } from "@/lib/organization-settings/parent-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; feature: string; subtab: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, feature, subtab } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentNavPathEnabled(org.features, feature, subtab)) {
    return { title: "School Not Found" };
  }

  const subtabLabel = getParentSubtabLabel(
    feature,
    subtab,
    org.features.feature_nav?.parent,
  );
  const parentLabel = getParentPageLabel(
    feature,
    org.features.feature_nav?.parent,
  );

  return {
    title: `${subtabLabel} · ${parentLabel} · ${org.name} Parent Portal`,
  };
}

export default async function SchoolParentSubtabPage({ params }: PageProps) {
  const { slug, feature, subtab } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentNavPathEnabled(org.features, feature, subtab)) {
    notFound();
  }

  const pageName = getParentSubtabLabel(
    feature,
    subtab,
    org.features.feature_nav?.parent,
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const userProfile = await getFamilyUserProfile(
    supabase,
    user.id,
    org.id,
    user,
  );

  return (
    <SchoolParentPageShell title={pageName}>
      <SchoolParentComingSoon
        branding={org.branding}
        schoolSlug={slug}
        schoolName={org.name}
        organizationId={org.id}
        featureKey={`${feature}/${subtab}`}
        featureLabel={pageName}
        userProfile={userProfile}
      />
    </SchoolParentPageShell>
  );
}
