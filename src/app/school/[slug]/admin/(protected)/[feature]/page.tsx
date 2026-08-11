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
import { loadAdminMessagesPageData } from "@/lib/messages/load-messages-page-data";
import { getRequestUser } from "@/lib/auth/session";
import { createAdminClient } from "@/utils/supabase/admin";
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
const AdminMessagesPage = nextDynamic(
  () => import("@/components/school-admin/AdminMessagesPage"),
  { loading: () => <AdminPageSkeleton label="Loading messages" /> },
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

  if (feature === "messages") {
    const user = await getRequestUser();
    if (!user) notFound();

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const admin = createAdminClient();
    const initialInbox = await loadAdminMessagesPageData(
      admin,
      supabase,
      org.id,
      user.id,
      org.name,
    );

    return (
      <AdminMessagesPage
        organizationId={org.id}
        organizationSlug={slug}
        schoolName={org.name}
        branding={org.branding}
        initialInbox={initialInbox}
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
