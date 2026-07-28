import nextDynamic from "next/dynamic";
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
import { Suspense } from "react";
import AdminPageSkeleton from "@/components/school-admin/AdminPageSkeleton";
import SchoolAdminComingSoon from "@/components/school-admin/SchoolAdminComingSoon";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { fetchAdmissionsSetupStatus } from "@/lib/school-admin/admissions-setup-status";
import { createClient } from "@/utils/supabase/server";

const SchedulePage = nextDynamic(
  () => import("@/components/school-admin/SchedulePage"),
  { loading: () => <AdminPageSkeleton label="Loading schedule" /> },
);
const CommitteesPage = nextDynamic(
  () => import("@/components/school-admin/committees/CommitteesPage"),
  { loading: () => <AdminPageSkeleton label="Loading committees" /> },
);
const AdminDashboardPage = nextDynamic(
  () => import("@/components/school-admin/AdminDashboardPage"),
  { loading: () => <AdminPageSkeleton label="Loading dashboard" /> },
);

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

  if (feature === "committees") {
    return (
      <Suspense>
        <CommitteesPage
          organizationId={org.id}
          branding={org.branding}
          schoolName={org.name}
          slug={slug}
        />
      </Suspense>
    );
  }

  if (feature === "dashboard") {
    const setupStatus = await fetchAdmissionsSetupStatus(supabase, org.id, slug);

    return (
      <AdminDashboardPage
        organizationId={org.id}
        slug={slug}
        branding={org.branding}
        schoolName={org.name}
        initialStatus={setupStatus}
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
