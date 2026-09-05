import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import SchoolParentComingSoon from "@/components/school-parent/SchoolParentComingSoon";
import SchoolParentPageShell from "@/components/school-parent/SchoolParentPageShell";
import ParentBillingPage from "@/components/school-parent/billing/ParentBillingPage";
import ParentCalendarPageShell from "@/components/school-parent/calendar/ParentCalendarPageShell";
import ParentCalendarPreviewEventsLoader from "@/components/school-parent/calendar/ParentCalendarPreviewEventsLoader";
import ParentCommitteesPageShell from "@/components/school-parent/committees/ParentCommitteesPageShell";
import ParentHomePageShell from "@/components/school-parent/home/ParentHomePageShell";
import ParentHomePreviewContentLoader from "@/components/school-parent/home/ParentHomePreviewContentLoader";
import ParentMessagesPage from "@/components/school-parent/ParentMessagesPage";
import {
  familyPreviewBasePath,
  familyPreviewParentBasePath,
  familyPreviewParentPath,
} from "@/lib/admissions/family-preview-access";
import { getFamilyPreviewProfile } from "@/lib/admissions/family-preview-server-cache";
import { loadParentCommitteesPreviewData } from "@/lib/committees/load-parent-committees-data";
import { loadParentSignupAttentionItems } from "@/lib/classroom-signups/load-parent-signups";
import { loadParentMessagesPreviewInbox } from "@/lib/messages/parent-messages";
import { buildParentQuickActions } from "@/lib/organization-settings/parent-home";
import { getParentPageLabel } from "@/lib/organization-settings/parent-nav";
import {
  getEnabledFeatureNavChildren,
  mergePortalFeatureNav,
} from "@/lib/organization-settings/feature-nav";
import { isParentFeatureEnabled } from "@/lib/organization-settings/parent-routes";
import { fetchParentPortalHomeMetaFromRpc } from "@/lib/parent-portal/parent-portal-home-meta";
import { loadParentBillingPreviewData } from "@/lib/tuition/load-parent-billing-preview-data";
import { listUpcomingEventsForOrg } from "@/lib/school-events/events";
import { loadHomeBulletinPosts } from "@/lib/school-bulletin/posts";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; familyId: string; feature: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, feature } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentFeatureEnabled(org.features, feature)) {
    return { title: "Preview Not Found" };
  }

  const pageName = getParentPageLabel(
    feature,
    org.features.feature_nav?.parent,
  );

  return {
    title: `${pageName} · ${org.name} Parent Preview`,
  };
}

export default async function FamilyPreviewParentFeaturePage({
  params,
  searchParams,
}: PageProps) {
  const { slug, familyId, feature } = await params;
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
    redirect(familyPreviewParentPath(slug, familyId, feature, children[0].key));
  }

  const pageName = getParentPageLabel(
    feature,
    org.features.feature_nav?.parent,
  );
  const previewBasePath = familyPreviewBasePath(slug, familyId);
  const previewParentBasePath = familyPreviewParentBasePath(slug, familyId);
  const userProfile = await getFamilyPreviewProfile(supabase, org.id, familyId);
  const admin = createAdminClient();

  if (feature === "portal") {
    const bulletinEnabled = Boolean(org.features.admin?.bulletin);
    const [upcomingEvents, homeMeta, classroomSignupAttentionItems, bulletinPosts] =
      await Promise.all([
      listUpcomingEventsForOrg(admin, org.id, 3),
      fetchParentPortalHomeMetaFromRpc(supabase, org.id, familyId),
      isParentFeatureEnabled(org.features, "classroom_signups")
        ? loadParentSignupAttentionItems(admin, org.id, familyId)
        : Promise.resolve([]),
      loadHomeBulletinPosts({
        supabase: admin,
        signedUrlClient: admin,
        organizationId: org.id,
        bulletinEnabled,
        viewer: "parent",
      }),
    ]);
    const quickActions = buildParentQuickActions(
      slug,
      org.features,
      previewParentBasePath,
    );

    return (
      <SchoolParentPageShell title={pageName}>
        <ParentHomePageShell
          branding={org.branding}
          schoolSlug={slug}
          organizationId={org.id}
          familyId={familyId}
          userProfile={userProfile}
          quickActions={quickActions}
          upcomingEvents={upcomingEvents}
          homeMeta={homeMeta}
          initialSignupAttentionItems={classroomSignupAttentionItems}
          previewMode
          previewBasePath={previewBasePath}
          bulletinEnabled={bulletinEnabled}
          bulletinPosts={bulletinPosts}
        >
          <Suspense fallback={null}>
            <ParentHomePreviewContentLoader
              organizationId={org.id}
              familyId={familyId}
              slug={slug}
              features={org.features}
              previewBasePath={previewParentBasePath}
            />
          </Suspense>
        </ParentHomePageShell>
      </SchoolParentPageShell>
    );
  }

  if (feature === "billing") {
    const initialData = await loadParentBillingPreviewData({
      organizationId: org.id,
      familyId,
      slug,
    });

    return (
      <SchoolParentPageShell title={pageName} layout="embedded">
        <ParentBillingPage
          organizationId={org.id}
          familyId={familyId}
          branding={org.branding}
          slug={slug}
          previewMode
          initialData={initialData}
        />
      </SchoolParentPageShell>
    );
  }

  if (feature === "committees") {
    const selectedCommitteeId =
      typeof resolvedSearchParams.committee === "string"
        ? resolvedSearchParams.committee
        : null;
    const initialData = await loadParentCommitteesPreviewData({
      organizationId: org.id,
      familyId,
      selectedCommitteeId,
    });
    const guardianName = userProfile.displayName || userProfile.email || "Parent";

    return (
      <SchoolParentPageShell title={pageName}>
        <ParentCommitteesPageShell
          organizationId={org.id}
          schoolSlug={slug}
          schoolName={org.name}
          branding={org.branding}
          guardianName={guardianName}
          previewMode
          initialData={initialData}
        />
      </SchoolParentPageShell>
    );
  }

  if (feature === "messages") {
    const { data: guardian } = await admin
      .from("guardians")
      .select("user_id")
      .eq("organization_id", org.id)
      .eq("family_id", familyId)
      .not("user_id", "is", null)
      .limit(1)
      .maybeSingle();

    const previewUserId =
      guardian?.user_id != null ? String(guardian.user_id) : "preview-user";

    const initialInbox = await loadParentMessagesPreviewInbox(
      admin,
      org.id,
      familyId,
      org.name,
      previewUserId,
      { programId: null },
    );

    return (
      <SchoolParentPageShell title={pageName} layout="embedded">
        <ParentMessagesPage
          organizationId={org.id}
          organizationSlug={slug}
          schoolName={org.name}
          branding={org.branding}
          familyId={familyId}
          guardianId={initialInbox.guardianId}
          previewMode
          initialInbox={initialInbox}
        />
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
          previewMode
        >
          <Suspense fallback={null}>
            <ParentCalendarPreviewEventsLoader organizationId={org.id} />
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
