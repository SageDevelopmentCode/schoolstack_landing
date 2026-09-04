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
import ParentChildrenPage from "@/components/school-parent/ParentChildrenPage";
import ParentMessagesInboxLoader from "@/components/school-parent/messages/ParentMessagesInboxLoader";
import ParentMessagesPageShell from "@/components/school-parent/messages/ParentMessagesPageShell";
import { getRequestUser } from "@/lib/auth/session";
import { loadParentCommitteesInitialData } from "@/lib/committees/load-parent-committees-data";
import { buildParentQuickActions } from "@/lib/organization-settings/parent-home";
import { getParentPageLabel } from "@/lib/organization-settings/parent-nav";
import {
  isParentFeatureEnabled,
  schoolParentPath,
  schoolProgramParentPath,
} from "@/lib/organization-settings/parent-routes";
import {
  getEnabledFeatureNavChildren,
  mergePortalFeatureNav,
} from "@/lib/organization-settings/feature-nav";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { fetchParentPortalHomeMetaFromRpc } from "@/lib/parent-portal/parent-portal-home-meta";
import {
  getParentPortalPrimaryFamilyId,
  getParentPortalUserProfile,
} from "@/lib/parent-portal/parent-portal-server-cache";
import { listUpcomingEventsForOrg } from "@/lib/school-events/events";
import {
  mainPortalMessageAudienceScope,
  programPortalMessageAudienceScope,
} from "@/lib/messages/message-audience";
import {
  mainPortalAudienceScope,
  programPortalAudienceScope,
} from "@/lib/school-events/event-audience";
import { createClient } from "@/utils/supabase/server";
import { filterFamilyChildrenForProgramPortal } from "@/components/school-parent/children/parent-children-utils";
import { listFamilyChildrenForHome } from "@/lib/admissions/parent-portal-access";
import { loadStudentHealthProfilesForStudents } from "@/lib/student-health/load-student-health-profile";

export type SchoolParentFeaturePageContext = {
  slug: string;
  feature: string;
  searchParams: Record<string, string | string[] | undefined>;
  programSlug?: string;
  parentNavBasePath?: string;
};

function featurePath(
  slug: string,
  feature: string,
  subtab?: string,
  programSlug?: string,
): string {
  if (programSlug) {
    return schoolProgramParentPath(slug, programSlug, feature, subtab);
  }
  return schoolParentPath(slug, feature, subtab);
}

export async function generateSchoolParentFeatureMetadata(
  context: Pick<SchoolParentFeaturePageContext, "slug" | "feature" | "programSlug">,
): Promise<Metadata> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, context.slug);

  if (!org) {
    return { title: "School Not Found" };
  }

  let features: OrganizationFeatures = org.features;
  if (context.programSlug) {
    const { loadProgramParentPortalContext } = await import(
      "@/lib/admissions/program-parent-portal-access"
    );
    const programContext = await loadProgramParentPortalContext({
      supabase,
      organizationId: org.id,
      schoolSlug: context.slug,
      programSlug: context.programSlug,
      orgFeatures: org.features,
    });
    if (!programContext) {
      return { title: "School Not Found" };
    }
    features = programContext.effectiveFeatures;
  }

  if (!isParentFeatureEnabled(features, context.feature)) {
    return { title: "School Not Found" };
  }

  const pageName = getParentPageLabel(
    context.feature,
    features.feature_nav?.parent,
  );

  return {
    title: `${pageName} · ${org.name} Parent Portal`,
  };
}

export async function renderSchoolParentFeaturePage(
  context: SchoolParentFeaturePageContext,
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, context.slug);

  if (!org) {
    notFound();
  }

  let features: OrganizationFeatures = org.features;
  let parentNavBasePath = context.parentNavBasePath;
  let programId: string | undefined;
  let programPortalLabel: string | undefined;
  let coopModeEnabled = false;

  if (context.programSlug) {
    const { loadProgramParentPortalContext } = await import(
      "@/lib/admissions/program-parent-portal-access"
    );
    const programContext = await loadProgramParentPortalContext({
      supabase,
      organizationId: org.id,
      schoolSlug: context.slug,
      programSlug: context.programSlug,
      orgFeatures: org.features,
    });
    if (!programContext) {
      notFound();
    }
    features = programContext.effectiveFeatures;
    parentNavBasePath = programContext.parentNavBasePath;
    programId = programContext.programId;
    programPortalLabel = programContext.displayLabel;
    coopModeEnabled = programContext.coopMode;
  }

  if (!isParentFeatureEnabled(features, context.feature)) {
    notFound();
  }

  const portalNav = mergePortalFeatureNav(
    "parent",
    features.feature_nav?.parent,
  );
  const children = getEnabledFeatureNavChildren(
    "parent",
    context.feature,
    portalNav,
  );

  if (children.length > 0) {
    redirect(
      featurePath(
        context.slug,
        context.feature,
        children[0].key,
        context.programSlug,
      ),
    );
  }

  const pageName = getParentPageLabel(
    context.feature,
    features.feature_nav?.parent,
  );

  const user = await getRequestUser();

  if (!user) {
    notFound();
  }

  const userProfile = await getParentPortalUserProfile(supabase, org.id);
  const familyId = await getParentPortalPrimaryFamilyId(supabase, org.id);

  if (context.feature === "portal") {
    const upcomingAudienceScope = programId
      ? programPortalAudienceScope(programId)
      : mainPortalAudienceScope();
    const [upcomingEvents, homeMeta] = await Promise.all([
      listUpcomingEventsForOrg(supabase, org.id, 3, upcomingAudienceScope),
      familyId
        ? fetchParentPortalHomeMetaFromRpc(supabase, org.id, familyId)
        : Promise.resolve(null),
    ]);
    const quickActions = buildParentQuickActions(
      context.slug,
      features,
      parentNavBasePath,
    );

    return (
      <SchoolParentPageShell title={pageName}>
        <ParentHomePageShell
          branding={org.branding}
          schoolSlug={context.slug}
          organizationId={org.id}
          familyId={familyId ?? undefined}
          userProfile={userProfile}
          quickActions={quickActions}
          upcomingEvents={upcomingEvents}
          homeMeta={homeMeta}
          programPortalLabel={programPortalLabel}
          programId={programId}
          schoolName={org.name}
          coopModeEnabled={context.feature === "portal" ? coopModeEnabled : false}
        >
          {familyId ? (
            <Suspense fallback={null}>
              <ParentHomeContentLoader
                organizationId={org.id}
                familyId={familyId}
                slug={context.slug}
                features={features}
                programId={programId}
                coopModeEnabled={coopModeEnabled}
              />
            </Suspense>
          ) : null}
        </ParentHomePageShell>
      </SchoolParentPageShell>
    );
  }

  if (context.feature === "billing") {
    if (!familyId) {
      return (
        <SchoolParentPageShell title={pageName}>
          <SchoolParentComingSoon
            branding={org.branding}
            schoolSlug={context.slug}
            schoolName={org.name}
            organizationId={org.id}
            featureKey={context.feature}
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
          slug={context.slug}
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
              slug={context.slug}
            />
          </Suspense>
        </ParentBillingPageShell>
      </SchoolParentPageShell>
    );
  }

  if (context.feature === "committees") {
    const guardianName = userProfile.displayName || user.email || "Parent";
    const selectedCommitteeId =
      typeof context.searchParams.committee === "string"
        ? context.searchParams.committee
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
          schoolSlug={context.slug}
          schoolName={org.name}
          branding={org.branding}
          guardianName={guardianName}
          initialData={initialData}
        />
      </SchoolParentPageShell>
    );
  }

  if (context.feature === "messages") {
    const messagesAudienceScope = programId
      ? programPortalMessageAudienceScope(programId)
      : mainPortalMessageAudienceScope();
    return (
      <SchoolParentPageShell title={pageName} layout="embedded">
        <ParentMessagesPageShell
          organizationId={org.id}
          organizationSlug={context.slug}
          schoolName={org.name}
          branding={org.branding}
          familyId={familyId ?? undefined}
          programId={programId}
        >
          <Suspense fallback={null}>
            <ParentMessagesInboxLoader
              organizationId={org.id}
              schoolName={org.name}
              programId={programId}
              audienceScope={messagesAudienceScope}
            />
          </Suspense>
        </ParentMessagesPageShell>
      </SchoolParentPageShell>
    );
  }

  if (context.feature === "calendar") {
    const calendarAudienceScope = programId
      ? programPortalAudienceScope(programId)
      : mainPortalAudienceScope();
    return (
      <SchoolParentPageShell title={pageName} layout="embedded">
        <ParentCalendarPageShell
          organizationId={org.id}
          organizationSlug={context.slug}
          branding={org.branding}
          programId={programId}
        >
          <Suspense fallback={null}>
            <ParentCalendarEventsLoader
              organizationId={org.id}
              audienceScope={calendarAudienceScope}
            />
          </Suspense>
        </ParentCalendarPageShell>
      </SchoolParentPageShell>
    );
  }

  if (context.feature === "children") {
    const allFamilyChildren = await listFamilyChildrenForHome(
      supabase,
      org.id,
      user.id,
    );
    const familyChildren = programId
      ? filterFamilyChildrenForProgramPortal(allFamilyChildren, programId)
      : allFamilyChildren;

    const studentIds = familyChildren
      .map((child) => child.studentId)
      .filter((studentId): studentId is string => Boolean(studentId));

    const initialHealthProfiles =
      studentIds.length > 0
        ? await loadStudentHealthProfilesForStudents(supabase, org.id, studentIds)
        : {};

    return (
      <SchoolParentPageShell title={pageName}>
        <ParentChildrenPage
          branding={org.branding}
          schoolName={org.name}
          schoolSlug={context.slug}
          organizationId={org.id}
          familyChildren={familyChildren}
          userProfile={userProfile}
          initialHealthProfiles={initialHealthProfiles}
          programPortalLabel={programPortalLabel}
        />
      </SchoolParentPageShell>
    );
  }

  return (
    <SchoolParentPageShell title={pageName}>
      <SchoolParentComingSoon
        branding={org.branding}
        schoolSlug={context.slug}
        schoolName={org.name}
        organizationId={org.id}
        featureKey={context.feature}
        featureLabel={pageName}
        userProfile={userProfile}
      />
    </SchoolParentPageShell>
  );
}
