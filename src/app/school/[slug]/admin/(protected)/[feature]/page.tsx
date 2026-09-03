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
import AdminDashboardContentSkeleton from "@/components/school-admin/AdminDashboardContentSkeleton";
import AdminDashboardHeader from "@/components/school-admin/AdminDashboardHeader";
import AdminDashboardSummaryLoader from "@/components/school-admin/AdminDashboardSummaryLoader";
import AdminPageSkeleton from "@/components/school-admin/AdminPageSkeleton";
import AdminMessagesPageShell from "@/components/school-admin/messages/AdminMessagesPageShell";
import AdminMessagesInboxLoader from "@/components/school-admin/messages/AdminMessagesInboxLoader";
import SchoolAdminComingSoon from "@/components/school-admin/SchoolAdminComingSoon";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { loadAdminMessagesViewerContext } from "@/lib/messages/admin-messages";
import { getRequestUser } from "@/lib/auth/session";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

import SchedulePageShell from "@/components/school-admin/schedule/SchedulePageShell";
import ScheduleVisitsLoader from "@/components/school-admin/schedule/ScheduleVisitsLoader";
import { fetchSchedulePageMeta } from "@/lib/school-admin/schedule-page-meta";
const CommitteesPage = nextDynamic(
  () => import("@/components/school-admin/committees/CommitteesPage"),
  { loading: () => <AdminPageSkeleton label="Loading committees" /> },
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
    const initialMeta = await fetchSchedulePageMeta(supabase, org.id);

    return (
      <SchedulePageShell
        organizationId={org.id}
        branding={org.branding}
        schoolName={org.name}
        slug={slug}
        initialMeta={initialMeta}
      >
        <Suspense fallback={null}>
          <ScheduleVisitsLoader organizationId={org.id} />
        </Suspense>
      </SchedulePageShell>
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
    const userFirstName =
      user?.user_metadata?.first_name ??
      user?.user_metadata?.full_name?.split(" ")?.[0] ??
      user?.email?.split("@")?.[0] ??
      null;

    return (
      <div className="mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px] pb-14">
        <AdminDashboardHeader
          slug={slug}
          schoolName={org.name}
          userFirstName={userFirstName}
        />
        <Suspense fallback={<AdminDashboardContentSkeleton />}>
          <AdminDashboardSummaryLoader org={org} slug={slug} user={user} />
        </Suspense>
      </div>
    );
  }

  if (feature === "messages") {
    const user = await getRequestUser();
    if (!user) notFound();

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const admin = createAdminClient();
    const viewerContext = await loadAdminMessagesViewerContext(
      admin,
      supabase,
      org.id,
      user.id,
    );

    return (
      <AdminMessagesPageShell
        organizationId={org.id}
        organizationSlug={slug}
        schoolName={org.name}
        branding={org.branding}
        viewerContext={viewerContext}
      >
        <Suspense fallback={null}>
          <AdminMessagesInboxLoader
            organizationId={org.id}
            schoolName={org.name}
          />
        </Suspense>
      </AdminMessagesPageShell>
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
