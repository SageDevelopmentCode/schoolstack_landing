import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SchoolParentComingSoon from "@/components/school-parent/SchoolParentComingSoon";
import SchoolParentPageShell from "@/components/school-parent/SchoolParentPageShell";
import { getRequestUser } from "@/lib/auth/session";
import { loadProgramParentPortalContext } from "@/lib/admissions/program-parent-portal-access";
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
  params: Promise<{ slug: string; programSlug: string; feature: string; subtab: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, programSlug, feature, subtab } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);
  const programContext = org
    ? await loadProgramParentPortalContext({
        supabase,
        organizationId: org.id,
        schoolSlug: slug,
        programSlug,
        orgFeatures: org.features,
      })
    : null;

  if (
    !org ||
    !programContext ||
    !isParentNavPathEnabled(programContext.effectiveFeatures, feature, subtab)
  ) {
    return { title: "School Not Found" };
  }

  const subtabLabel = getParentSubtabLabel(
    feature,
    subtab,
    programContext.effectiveFeatures.feature_nav?.parent,
  );
  const parentLabel = getParentPageLabel(
    feature,
    programContext.effectiveFeatures.feature_nav?.parent,
  );

  return {
    title: `${subtabLabel} · ${parentLabel} · ${org.name} Parent Portal`,
  };
}

export default async function SchoolProgramParentSubtabPage({ params }: PageProps) {
  const { slug, programSlug, feature, subtab } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  const programContext = await loadProgramParentPortalContext({
    supabase,
    organizationId: org.id,
    schoolSlug: slug,
    programSlug,
    orgFeatures: org.features,
  });

  if (
    !programContext ||
    !isParentNavPathEnabled(programContext.effectiveFeatures, feature, subtab)
  ) {
    notFound();
  }

  const pageName = getParentSubtabLabel(
    feature,
    subtab,
    programContext.effectiveFeatures.feature_nav?.parent,
  );

  const user = await getRequestUser();

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
