import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import SchoolParentComingSoon from "@/components/school-parent/SchoolParentComingSoon";
import SchoolParentPageShell from "@/components/school-parent/SchoolParentPageShell";
import ParentBillingDataLoader from "@/components/school-parent/billing/ParentBillingDataLoader";
import ParentBillingMetaLoader from "@/components/school-parent/billing/ParentBillingMetaLoader";
import ParentBillingPageShell from "@/components/school-parent/billing/ParentBillingPageShell";
import ParentCalendarEventsLoader from "@/components/school-parent/calendar/ParentCalendarEventsLoader";
import ParentCalendarPageShell from "@/components/school-parent/calendar/ParentCalendarPageShell";
import ParentCommitteesPageShell from "@/components/school-parent/committees/ParentCommitteesPageShell";
import ParentHomeContentLoader from "@/components/school-parent/home/ParentHomeContentLoader";
import ParentHomePageShell from "@/components/school-parent/home/ParentHomePageShell";
import ParentMessagesInboxLoader from "@/components/school-parent/messages/ParentMessagesInboxLoader";
import ParentMessagesPageShell from "@/components/school-parent/messages/ParentMessagesPageShell";
import { getRequestUser } from "@/lib/auth/session";
import { loadParentCommitteesInitialData } from "@/lib/committees/load-parent-committees-data";
import { buildParentQuickActions } from "@/lib/organization-settings/parent-home";
import { getParentPageLabel } from "@/lib/organization-settings/parent-nav";
import {
  isParentFeatureEnabled,
  schoolParentPath,
} from "@/lib/organization-settings/parent-routes";
import {
  getEnabledFeatureNavChildren,
  mergePortalFeatureNav,
} from "@/lib/organization-settings/feature-nav";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { fetchParentPortalHomeMetaFromRpc } from "@/lib/parent-portal/parent-portal-home-meta";
import {
  getParentPortalPrimaryFamilyId,
  getParentPortalUserProfile,
} from "@/lib/parent-portal/parent-portal-server-cache";
import { listUpcomingEventsForOrg } from "@/lib/school-events/events";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; feature: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, feature } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentFeatureEnabled(org.features, feature)) {
    return { title: "School Not Found" };
  }

  const pageName = getParentPageLabel(
    feature,
    org.features.feature_nav?.parent,
  );

  return {
    title: `${pageName} · ${org.name} Parent Portal`,
  };
}

export default async function SchoolParentFeaturePage({
  params,
  searchParams,
}: PageProps) {
  const { slug, feature } = await params;
  const resolvedSearchParams = await searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentFeatureEnabled(org.features, feature)) {
    notFound();
  }

  const portalNav = mergePortalFeatureNav(
    "parent",
    org.features.feature_nav?.parent,
  );
  const children = getEnabledFeatureNavChildren("parent", feature, portalNav);

  if (children.length > 0) {
    redirect(schoolParentPath(slug, feature, children[0].key));
  }

  const pageName = getParentPageLabel(
    feature,
    org.features.feature_nav?.parent,
  );

  const user = await getRequestUser();

  if (!user) {
    notFound();
  }

  const userProfile = await getParentPortalUserProfile(supabase, org.id);
  const familyId = await getParentPortalPrimaryFamilyId(supabase, org.id);

  if (feature === "portal") {
    const [upcomingEvents, homeMeta] = await Promise.all([
      listUpcomingEventsForOrg(supabase, org.id, 3),
      familyId
        ? fetchParentPortalHomeMetaFromRpc(supabase, org.id, familyId)
        : Promise.resolve(null),
    ]);
    const quickActions = buildParentQuickActions(slug, org.features);

    return (
      <SchoolParentPageShell title={pageName}>
        <ParentHomePageShell
          branding={org.branding}
          schoolSlug={slug}
          organizationId={org.id}
          familyId={familyId ?? undefined}
          userProfile={userProfile}
          quickActions={quickActions}
          upcomingEvents={upcomingEvents}
          homeMeta={homeMeta}
        >
          {familyId ? (
            <Suspense fallback={null}>
              <ParentHomeContentLoader
                organizationId={org.id}
                familyId={familyId}
                slug={slug}
                features={org.features}
              />
            </Suspense>
          ) : null}
        </ParentHomePageShell>
      </SchoolParentPageShell>
    );
  }

  if (feature === "billing") {
    if (!familyId) {
      return (
        <SchoolParentPageShell title={pageName}>
          <SchoolParentComingSoon
            branding={org.branding}
            schoolSlug={slug}
            schoolName={org.name}
            organizationId={org.id}
            featureKey={feature}
            featureLabel={pageName}
            userProfile={userProfile}
          />
        </SchoolParentPageShell>
      );
    }

    return (
      <SchoolParentPageShell title={pageName} layout="embedded">
        <ParentBillingPageShell
          organizationId={org.id}
          familyId={familyId}
          branding={org.branding}
          slug={slug}
        >
          <Suspense fallback={null}>
            <ParentBillingMetaLoader
              organizationId={org.id}
              familyId={familyId}
            />
          </Suspense>
          <Suspense fallback={null}>
            <ParentBillingDataLoader
              organizationId={org.id}
              familyId={familyId}
              slug={slug}
            />
          </Suspense>
        </ParentBillingPageShell>
      </SchoolParentPageShell>
    );
  }

  if (feature === "committees") {
    const guardianName = userProfile.displayName || user.email || "Parent";
    const selectedCommitteeId =
      typeof resolvedSearchParams.committee === "string"
        ? resolvedSearchParams.committee
        : null;
    const initialData = await loadParentCommitteesInitialData({
      organizationId: org.id,
      userId: user.id,
      selectedCommitteeId,
    });

    return (
      <SchoolParentPageShell title={pageName}>
        <ParentCommitteesPageShell
          organizationId={org.id}
          schoolSlug={slug}
          schoolName={org.name}
          branding={org.branding}
          guardianName={guardianName}
          initialData={initialData}
        />
      </SchoolParentPageShell>
    );
  }

  if (feature === "messages") {
    return (
      <SchoolParentPageShell title={pageName} layout="embedded">
        <ParentMessagesPageShell
          organizationId={org.id}
          organizationSlug={slug}
          schoolName={org.name}
          branding={org.branding}
          familyId={familyId ?? undefined}
        >
          <Suspense fallback={null}>
            <ParentMessagesInboxLoader
              organizationId={org.id}
              schoolName={org.name}
            />
          </Suspense>
        </ParentMessagesPageShell>
      </SchoolParentPageShell>
    );
  }

  if (feature === "calendar") {
    return (
      <SchoolParentPageShell title={pageName} layout="embedded">
        <ParentCalendarPageShell
          organizationId={org.id}
          organizationSlug={slug}
          branding={org.branding}
        >
          <Suspense fallback={null}>
            <ParentCalendarEventsLoader organizationId={org.id} />
          </Suspense>
        </ParentCalendarPageShell>
      </SchoolParentPageShell>
    );
  }

  return (
    <SchoolParentPageShell title={pageName}>
      <SchoolParentComingSoon
        branding={org.branding}
        schoolSlug={slug}
        schoolName={org.name}
        organizationId={org.id}
        featureKey={feature}
        featureLabel={pageName}
        userProfile={userProfile}
      />
    </SchoolParentPageShell>
  );
}
