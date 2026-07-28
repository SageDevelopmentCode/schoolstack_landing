import nextDynamic from "next/dynamic";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import AdminPageSkeleton from "@/components/school-admin/AdminPageSkeleton";
import SchoolAdminComingSoon from "@/components/school-admin/SchoolAdminComingSoon";
import {
  getAdminPageLabel,
  getAdminSubtabLabel,
} from "@/lib/organization-settings/admin-nav";
import { isAdminNavPathEnabled } from "@/lib/organization-settings/admin-routes";
import { loadApplicationSubmissionsPageData } from "@/lib/school-admin/load-submissions-page-data";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

const ProgramsPage = nextDynamic(
  () => import("@/components/school-admin/admissions/ProgramsPage"),
  { loading: () => <AdminPageSkeleton label="Loading programs" /> },
);
const ApplicationFormsPage = nextDynamic(
  () => import("@/components/school-admin/admissions/ApplicationFormsPage"),
  { loading: () => <AdminPageSkeleton label="Loading enrollment flows" /> },
);
const ApplicationSubmissionsPage = nextDynamic(
  () => import("@/components/school-admin/admissions/ApplicationSubmissionsPage"),
  { loading: () => <AdminPageSkeleton label="Loading submissions" /> },
);
const PaymentsSetupPage = nextDynamic(
  () => import("@/components/school-admin/admissions/PaymentsSetupPage"),
  { loading: () => <AdminPageSkeleton label="Loading payments setup" /> },
);
const FinancesRevenuePage = nextDynamic(
  () => import("@/components/school-admin/finances/FinancesRevenuePage"),
  { loading: () => <AdminPageSkeleton label="Loading revenue" /> },
);
const FinancesTransactionsPage = nextDynamic(
  () => import("@/components/school-admin/finances/FinancesTransactionsPage"),
  { loading: () => <AdminPageSkeleton label="Loading transactions" /> },
);
const TuitionPage = nextDynamic(
  () => import("@/components/school-admin/tuition/TuitionPage"),
  { loading: () => <AdminPageSkeleton label="Loading tuition" /> },
);

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
    const initialData = await loadApplicationSubmissionsPageData(org.id);

    return (
      <Suspense>
        <ApplicationSubmissionsPage
          organizationId={org.id}
          branding={org.branding}
          schoolName={org.name}
          slug={slug}
          initialSubmissions={initialData.submissions}
          initialLoginStatusByGuardianId={initialData.loginStatusByGuardianId}
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
