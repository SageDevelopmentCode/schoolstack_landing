import nextDynamic from "next/dynamic";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import AdminPageSkeleton from "@/components/school-admin/AdminPageSkeleton";
import ApplicationSubmissionsPageShell from "@/components/school-admin/admissions/ApplicationSubmissionsPageShell";
import ApplicationSubmissionsTableLoader from "@/components/school-admin/admissions/ApplicationSubmissionsTableLoader";
import ApplicationSubmissionsTableSkeleton from "@/components/school-admin/admissions/ApplicationSubmissionsTableSkeleton";
import SchoolAdminComingSoon from "@/components/school-admin/SchoolAdminComingSoon";
import {
  getAdminPageLabel,
  getAdminSubtabLabel,
} from "@/lib/organization-settings/admin-nav";
import { isAdminNavPathEnabled } from "@/lib/organization-settings/admin-routes";
import { fetchStudentsPageMeta } from "@/lib/school-admin/students-page-meta";
import { fetchSubmissionPageMeta } from "@/lib/school-admin/submissions-page-meta";
import StudentsPageShell from "@/components/school-admin/students/StudentsPageShell";
import StudentsTableLoader from "@/components/school-admin/students/StudentsTableLoader";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { parseProgramParentPortalOrgConfig } from "@/lib/admissions/program-parent-portal-governance";
import { parseAdmissionsOrgSettings } from "@/lib/admissions/admissions-org-settings";
import { createClient } from "@/utils/supabase/server";

const ProgramsPage = nextDynamic(
  () => import("@/components/school-admin/admissions/ProgramsPage"),
  { loading: () => <AdminPageSkeleton label="Loading programs" /> },
);
import EnrollmentFlowsPageShell from "@/components/school-admin/admissions/EnrollmentFlowsPageShell";
import EnrollmentFlowsListLoader from "@/components/school-admin/admissions/EnrollmentFlowsListLoader";
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
import TuitionPageShell from "@/components/school-admin/tuition/TuitionPageShell";
import TuitionDashboardLoader from "@/components/school-admin/tuition/TuitionDashboardLoader";
import { fetchTuitionSetupStatus } from "@/lib/tuition/setup-status";
const StaffPage = nextDynamic(
  () => import("@/components/school-admin/staff/StaffPage"),
  { loading: () => <AdminPageSkeleton label="Loading staff" /> },
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
    const { data: settingsRow } = await supabase
      .from("organization_settings")
      .select("admissions")
      .eq("organization_id", org.id)
      .maybeSingle();
    const programParentPortalConfig = parseProgramParentPortalOrgConfig(
      parseAdmissionsOrgSettings(settingsRow?.admissions),
    );

    return (
      <ProgramsPage
        organizationId={org.id}
        branding={org.branding}
        orgFeatures={org.features}
        slug={slug}
        programParentPortalConfig={programParentPortalConfig}
      />
    );
  }

  if (feature === "admissions" && subtab === "flows") {
    return (
      <EnrollmentFlowsPageShell
        organizationId={org.id}
        branding={org.branding}
        schoolName={org.name}
        slug={slug}
      >
        <Suspense fallback={null}>
          <EnrollmentFlowsListLoader organizationId={org.id} />
        </Suspense>
      </EnrollmentFlowsPageShell>
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
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const initialMeta = await fetchSubmissionPageMeta(supabase, org.id);

    return (
      <ApplicationSubmissionsPageShell
        organizationId={org.id}
        branding={org.branding}
        schoolName={org.name}
        slug={slug}
        initialMeta={initialMeta}
      >
        <Suspense fallback={<ApplicationSubmissionsTableSkeleton />}>
          <ApplicationSubmissionsTableLoader organizationId={org.id} />
        </Suspense>
      </ApplicationSubmissionsPageShell>
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
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const setupStatus = await fetchTuitionSetupStatus(supabase, org.id);

    return (
      <TuitionPageShell
        organizationId={org.id}
        branding={org.branding}
        slug={slug}
        setupStatus={setupStatus}
      >
        <Suspense fallback={null}>
          <TuitionDashboardLoader organizationId={org.id} />
        </Suspense>
      </TuitionPageShell>
    );
  }

  if (feature === "my_school" && subtab === "students") {
    const initialMeta = await fetchStudentsPageMeta(supabase, org.id);

    return (
      <StudentsPageShell
        organizationId={org.id}
        branding={org.branding}
        slug={slug}
        initialMeta={initialMeta}
      >
        <Suspense fallback={null}>
          <StudentsTableLoader organizationId={org.id} />
        </Suspense>
      </StudentsPageShell>
    );
  }

  if (feature === "my_school" && subtab === "staff") {
    return (
      <Suspense>
        <StaffPage
          organizationId={org.id}
          branding={org.branding}
          slug={slug}
        />
      </Suspense>
    );
  }

  return (
    <SchoolAdminComingSoon
      branding={org.branding}
      pageName={`${subtabLabel} · ${parentLabel}`}
    />
  );
}
