import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
  getAdminPageLabel,
  getAdminSubtabLabel,
} from "@/lib/organization-settings/admin-nav";
import { isAdminNavPathEnabled } from "@/lib/organization-settings/admin-routes";
import SchoolAdminComingSoon from "@/components/school-admin/SchoolAdminComingSoon";
import ApplicationFormsPage from "@/components/school-admin/admissions/ApplicationFormsPage";
import ApplicationSubmissionsPage from "@/components/school-admin/admissions/ApplicationSubmissionsPage";
import PaymentsSetupPage from "@/components/school-admin/admissions/PaymentsSetupPage";
import ProgramsPage from "@/components/school-admin/admissions/ProgramsPage";
import FinancesRevenuePage from "@/components/school-admin/finances/FinancesRevenuePage";
import FinancesTransactionsPage from "@/components/school-admin/finances/FinancesTransactionsPage";
import TuitionPage from "@/components/school-admin/tuition/TuitionPage";
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

  if (
    (feature === "admissions" && subtab === "programs") ||
    (feature === "my_school" && subtab === "programs")
  ) {
    return (
      <ProgramsPage
        organizationId={org.id}
        branding={org.branding}
        slug={slug}
      />
    );
  }

  if (feature === "admissions" && subtab === "flows") {
    return (
      <Suspense>
        <ApplicationFormsPage
          organizationId={org.id}
          branding={org.branding}
          schoolName={org.name}
          slug={slug}
        />
      </Suspense>
    );
  }

  if (feature === "admissions" && subtab === "payments") {
    return (
      <Suspense>
        <PaymentsSetupPage
          organizationId={org.id}
          orgSlug={slug}
          branding={org.branding}
          schoolName={org.name}
        />
      </Suspense>
    );
  }

  if (feature === "admissions" && subtab === "submissions") {
    return (
      <Suspense>
        <ApplicationSubmissionsPage
          organizationId={org.id}
          branding={org.branding}
          schoolName={org.name}
          slug={slug}
        />
      </Suspense>
    );
  }

  if (feature === "finances" && subtab === "revenue") {
    return (
      <FinancesRevenuePage
        organizationId={org.id}
        slug={slug}
        branding={org.branding}
      />
    );
  }

  if (feature === "finances" && subtab === "transactions") {
    return (
      <FinancesTransactionsPage
        organizationId={org.id}
        slug={slug}
        branding={org.branding}
      />
    );
  }

  if (feature === "my_school" && subtab === "tuition") {
    return (
      <TuitionPage
        organizationId={org.id}
        branding={org.branding}
        slug={slug}
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
