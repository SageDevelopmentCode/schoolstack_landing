import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import SchoolParentComingSoon from "@/components/school-parent/SchoolParentComingSoon";
import SchoolParentPageShell from "@/components/school-parent/SchoolParentPageShell";
import { getRequestUser } from "@/lib/auth/session";
import {
  getFamilyUserProfile,
  listFamilyChildrenForHome,
} from "@/lib/admissions/parent-portal-access";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import { listEnrollmentAgreementAmendmentsForApplications, listIncompleteEnrollmentAgreementsForApplications } from "@/lib/admissions/enrollment-checklist-materialization";
import { buildEnrollmentAgreementAmendmentBannerItems } from "@/lib/admissions/enrollment-agreement-amendment-banner";
import { buildEnrollmentAgreementIncompleteBannerItems } from "@/lib/admissions/enrollment-agreement-incomplete-banner";
import { loadResolvedParentOnboardingItems } from "@/lib/admissions/parent-onboarding-status";
import { loadParentCommitteesInitialData } from "@/lib/committees/load-parent-committees-data";
import { loadParentMessagesPageData } from "@/lib/messages/load-messages-page-data";
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
import { loadParentBillingInitialData } from "@/lib/tuition/load-parent-billing-data";
import { loadParentCalendarInitialData } from "@/lib/school-events/load-parent-calendar-data";
import { listUpcomingEventsForOrg } from "@/lib/school-events/events";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ParentHomePage = nextDynamic(
  () => import("@/components/school-parent/ParentHomePage"),
);
const ParentBillingPage = nextDynamic(
  () => import("@/components/school-parent/billing/ParentBillingPage"),
);
const ParentCommitteesPage = nextDynamic(
  () => import("@/components/school-parent/committees/ParentCommitteesPage"),
);
const ParentMessagesPage = nextDynamic(
  () => import("@/components/school-parent/ParentMessagesPage"),
);
const ParentCalendarPage = nextDynamic(
  () => import("@/components/school-parent/calendar/ParentCalendarPage"),
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

export default async function SchoolParentFeaturePage({ params }: PageProps) {
  const { slug, feature } = await params;
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

  if (feature === "portal") {
    const familyIds = await getFamilyIdsForUser(supabase, user.id, org.id);
    const familyId = familyIds[0];

    const [userProfile, familyChildren, upcomingEvents, onboardingItems] =
      await Promise.all([
        getFamilyUserProfile(supabase, user.id, org.id, user),
        listFamilyChildrenForHome(supabase, org.id, user.id),
        listUpcomingEventsForOrg(supabase, org.id, 3),
        familyId
          ? loadResolvedParentOnboardingItems({
              supabase,
              organizationId: org.id,
              familyId,
              userId: user.id,
              slug,
              features: org.features,
            })
          : Promise.resolve([]),
      ]);
    const applicationIds = familyChildren.map((child) => child.applicationId);
    const [amendmentsByApplicationId, incompleteByApplicationId] = await Promise.all([
      listEnrollmentAgreementAmendmentsForApplications(
        supabase,
        org.id,
        applicationIds,
      ),
      listIncompleteEnrollmentAgreementsForApplications(
        supabase,
        org.id,
        applicationIds,
      ),
    ]);
    const enrollmentAmendmentBannerItems = buildEnrollmentAgreementAmendmentBannerItems({
      schoolSlug: slug,
      familyChildren,
      amendmentsByApplicationId: Object.fromEntries(amendmentsByApplicationId.entries()),
    });
    const enrollmentIncompleteBannerItems = buildEnrollmentAgreementIncompleteBannerItems({
      schoolSlug: slug,
      familyChildren,
      incompleteByApplicationId: Object.fromEntries(incompleteByApplicationId.entries()),
    });
    const quickActions = buildParentQuickActions(slug, org.features);

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
          enrollmentAmendmentBannerItems={enrollmentAmendmentBannerItems}
          enrollmentIncompleteBannerItems={enrollmentIncompleteBannerItems}
        />
      </SchoolParentPageShell>
    );
  }

  const userProfile = await getFamilyUserProfile(
    supabase,
    user.id,
    org.id,
    user,
  );

  if (feature === "billing") {
    const familyIds = await getFamilyIdsForUser(supabase, user.id, org.id);
    const familyId = familyIds[0];

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

    const initialData = await loadParentBillingInitialData({
      organizationId: org.id,
      familyId,
      slug,
      userId: user.id,
    });

    return (
      <SchoolParentPageShell title={pageName} layout="embedded">
        <ParentBillingPage
          organizationId={org.id}
          familyId={familyId}
          branding={org.branding}
          slug={slug}
          initialData={initialData}
        />
      </SchoolParentPageShell>
    );
  }

  if (feature === "committees") {
    const guardianName = userProfile.displayName || user.email || "Parent";
    const initialData = await loadParentCommitteesInitialData({
      organizationId: org.id,
      userId: user.id,
    });

    return (
      <SchoolParentPageShell title={pageName}>
        <ParentCommitteesPage
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
    const familyIds = await getFamilyIdsForUser(supabase, user.id, org.id);
    const familyId = familyIds[0];
    const admin = createAdminClient();
    const initialInbox = await loadParentMessagesPageData(
      admin,
      supabase,
      org.id,
      user.id,
      org.name,
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
          initialInbox={initialInbox}
        />
      </SchoolParentPageShell>
    );
  }

  if (feature === "calendar") {
    const initialData = await loadParentCalendarInitialData({
      organizationId: org.id,
    });

    return (
      <SchoolParentPageShell title={pageName} layout="embedded">
        <ParentCalendarPage branding={org.branding} initialData={initialData} />
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
