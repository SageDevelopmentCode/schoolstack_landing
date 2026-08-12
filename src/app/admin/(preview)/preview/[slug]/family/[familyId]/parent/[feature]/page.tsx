import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import ParentHomePage from "@/components/school-parent/ParentHomePage";
import ParentBillingPage from "@/components/school-parent/billing/ParentBillingPage";
import ParentCommitteesPage from "@/components/school-parent/committees/ParentCommitteesPage";
import ParentMessagesPage from "@/components/school-parent/ParentMessagesPage";
import SchoolParentComingSoon from "@/components/school-parent/SchoolParentComingSoon";
import SchoolParentPageShell from "@/components/school-parent/SchoolParentPageShell";
import {
  familyPreviewBasePath,
  familyPreviewParentBasePath,
  familyPreviewParentPath,
  getFamilyPreviewGuardianUserId,
  getFamilyPreviewProfile,
  listFamilyChildrenForHomeByFamilyId,
} from "@/lib/admissions/family-preview-access";
import { loadResolvedParentOnboardingItems } from "@/lib/admissions/parent-onboarding-status";
import { buildParentQuickActions } from "@/lib/organization-settings/parent-home";
import { getParentPageLabel } from "@/lib/organization-settings/parent-nav";
import {
  getEnabledFeatureNavChildren,
  mergePortalFeatureNav,
} from "@/lib/organization-settings/feature-nav";
import { isParentFeatureEnabled } from "@/lib/organization-settings/parent-routes";
import { loadParentCommitteesPreviewData } from "@/lib/committees/load-parent-committees-data";
import { loadParentMessagesPreviewInbox } from "@/lib/messages/parent-messages";
import { loadParentBillingPreviewData } from "@/lib/tuition/load-parent-billing-preview-data";
import { loadParentCalendarPreviewData } from "@/lib/school-events/load-parent-calendar-preview-data";
import { listUpcomingEventsForOrg } from "@/lib/school-events/events";
import ParentCalendarPage from "@/components/school-parent/calendar/ParentCalendarPage";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; familyId: string; feature: string }>;
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

export default async function FamilyPreviewParentFeaturePage({ params }: PageProps) {
  const { slug, familyId, feature } = await params;
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

  if (feature === "portal") {
    const admin = createAdminClient();
    const [familyChildren, upcomingEvents, previewGuardianUserId] =
      await Promise.all([
        listFamilyChildrenForHomeByFamilyId(supabase, org.id, familyId),
        listUpcomingEventsForOrg(admin, org.id, 3),
        getFamilyPreviewGuardianUserId(supabase, org.id, familyId),
      ]);
    const quickActions = buildParentQuickActions(
      slug,
      org.features,
      previewParentBasePath,
    );
    const onboardingItems = await loadResolvedParentOnboardingItems({
      supabase,
      organizationId: org.id,
      familyId,
      userId:
        previewGuardianUserId ?? "00000000-0000-0000-0000-000000000000",
      slug,
      features: org.features,
      previewBasePath: previewParentBasePath,
    });

    return (
      <SchoolParentPageShell title={pageName}>
        <ParentHomePage
          branding={org.branding}
          schoolSlug={slug}
          userProfile={userProfile}
          familyChildren={familyChildren}
          quickActions={quickActions}
          onboardingItems={onboardingItems}
          upcomingEvents={upcomingEvents}
          previewMode
          previewBasePath={previewBasePath}
        />
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
    const initialData = await loadParentCommitteesPreviewData({
      organizationId: org.id,
      familyId,
    });
    const guardianName = userProfile.displayName || userProfile.email || "Parent";

    return (
      <SchoolParentPageShell title={pageName}>
        <ParentCommitteesPage
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
    const admin = createAdminClient();
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
    );

    return (
      <SchoolParentPageShell title={pageName} layout="embedded">
        <ParentMessagesPage
          organizationId={org.id}
          organizationSlug={slug}
          schoolName={org.name}
          branding={org.branding}
          familyId={familyId}
          previewMode
          initialInbox={initialInbox}
        />
      </SchoolParentPageShell>
    );
  }

  if (feature === "calendar") {
    const initialData = await loadParentCalendarPreviewData({
      organizationId: org.id,
    });

    return (
      <SchoolParentPageShell title={pageName} layout="embedded">
        <ParentCalendarPage
          branding={org.branding}
          initialData={initialData}
          previewMode
        />
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
