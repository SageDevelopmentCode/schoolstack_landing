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
import { loadAdminMessagesPageData } from "@/lib/messages/load-messages-page-data";
import { getRequestUser } from "@/lib/auth/session";
import { fetchAdminDashboardSummary } from "@/lib/school-admin/dashboard-summary";
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
const NotificationsSettingsPage = nextDynamic(
  () => import("@/components/school-admin/notifications/NotificationsSettingsPage"),
  { loading: () => <AdminPageSkeleton label="Loading notifications" /> },
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
    const user = await getRequestUser();
    const admin = createAdminClient();
    const initialSummary = await fetchAdminDashboardSummary(
      supabase,
      admin,
      org.id,
      slug,
      org.features.admin,
      {
        userId: user?.id,
        schoolName: org.name,
      },
    );

    const userFirstName =
      user?.user_metadata?.first_name ??
      user?.user_metadata?.full_name?.split(" ")?.[0] ??
      user?.email?.split("@")?.[0] ??
      null;

    return (
      <AdminDashboardPage
        organizationId={org.id}
        slug={slug}
        branding={org.branding}
        schoolName={org.name}
        userFirstName={userFirstName}
        initialSummary={initialSummary}
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

  if (feature === "notifications") {
    return (
      <NotificationsSettingsPage
        organizationId={org.id}
        slug={slug}
        branding={org.branding}
        schoolName={org.name}
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
