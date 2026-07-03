import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAdminPageLabel,
  getAdminSubtabLabel,
} from "@/lib/organization-settings/admin-nav";
import { isAdminNavPathEnabled } from "@/lib/organization-settings/admin-routes";
import SchoolAdminComingSoon from "@/components/school-admin/SchoolAdminComingSoon";
import ApplicationFormsPage from "@/components/school-admin/admissions/ApplicationFormsPage";
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

  if (!org || !isAdminNavPathEnabled(org.features, feature, subtab)) {
    return { title: "School Not Found" };
  }

  const subtabLabel = getAdminSubtabLabel(
    feature,
    subtab,
    org.features.feature_nav?.admin,
  );
  const parentLabel = getAdminPageLabel(
    feature,
    org.features.feature_nav?.admin,
  );

  return {
    title: `${subtabLabel} · ${parentLabel} · ${org.name} Admin`,
  };
}

export default async function SchoolAdminSubtabPage({ params }: PageProps) {
  const { slug, feature, subtab } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isAdminNavPathEnabled(org.features, feature, subtab)) {
    notFound();
  }

  const subtabLabel = getAdminSubtabLabel(
    feature,
    subtab,
    org.features.feature_nav?.admin,
  );
  const parentLabel = getAdminPageLabel(
    feature,
    org.features.feature_nav?.admin,
  );

  if (feature === "admissions" && subtab === "flows") {
    return (
      <ApplicationFormsPage
        organizationId={org.id}
        branding={org.branding}
      />
    );
  }

  return (
    <SchoolAdminComingSoon
      branding={org.branding}
      pageName={`${subtabLabel} · ${parentLabel}`}
    />
  );
}
