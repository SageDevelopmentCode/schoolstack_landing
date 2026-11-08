import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import SchoolParentBaseline from "@/components/school-parent/SchoolParentBaseline";
import { getRequestUserFromClaims } from "@/lib/auth/session";
import { loadProgramParentPortalContext } from "@/lib/admissions/program-parent-portal-access";
import { programParentPortalHasEnabledFeatures } from "@/lib/organization-settings/resolve-program-parent-features";
import {
  getCachedParentPortalNavContexts,
  getCachedParentPortalProgramAccess,
  getCachedPortalAccountLinkContext,
  getParentPortalUserProfile,
} from "@/lib/parent-portal/parent-portal-server-cache";
import { buildProgramParentNotificationContext } from "@/lib/parent-portal/parent-notification-context";
import { startParentBadgeCountLoads } from "@/lib/parent-portal/parent-badge-counts";
import { listSchoolPortalOptionsForUser } from "@/lib/auth/portal-switcher-server";
import { portalAccountLinkOpensInNewTab } from "@/lib/auth/portal-switcher-types";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string; programSlug: string }>;
};

export default async function SchoolProgramParentLayout({
  children,
  params,
}: LayoutProps) {
  const { slug, programSlug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(slug);
  const user = await getRequestUserFromClaims();

  if (!org || !user) {
    notFound();
  }

  const programContext = await loadProgramParentPortalContext({
    supabase,
    organizationId: org.id,
    schoolSlug: slug,
    programSlug,
    orgFeatures: org.features,
  });

  if (!programContext) {
    notFound();
  }

  if (
    !programParentPortalHasEnabledFeatures(
      org.features,
      programContext.settings,
    )
  ) {
    notFound();
  }

  const hasProgramAccess = await getCachedParentPortalProgramAccess(
    org.id,
    programContext.programId,
  );

  if (!hasProgramAccess) {
    notFound();
  }

  const [userProfile, portalOptions, parentPortalContexts, linkContext] =
    await Promise.all([
    getParentPortalUserProfile(org.id),
    listSchoolPortalOptionsForUser(supabase, user.id, slug, {
      org,
      hasEnrolledAccess: true,
      hasFamilyAccess: true,
    }),
    getCachedParentPortalNavContexts({
      organizationId: org.id,
      schoolSlug: slug,
      schoolName: org.name,
      orgFeatures: org.features,
    }),
    getCachedPortalAccountLinkContext(org.id),
  ]);

  const openPortalLinksInNewTab = portalAccountLinkOpensInNewTab(
    linkContext.groupId,
  );

  const notificationContext = buildProgramParentNotificationContext(
    slug,
    programContext.programId,
    programSlug,
    programContext.coopMode,
    { parentNavBasePath: programContext.parentNavBasePath },
  );

  // Started, not awaited: the shell renders now and the header badges fill in as these resolve.
  const badgeCountPromises = startParentBadgeCountLoads({
    supabase,
    organizationId: org.id,
    organizationName: org.name,
    slug,
    userId: user.id,
    notificationContext,
    messagesEnabled: Boolean(programContext.effectiveFeatures.parent?.messages),
    committeesEnabled: Boolean(programContext.effectiveFeatures.parent?.committees),
  });

  return (
    <SchoolParentBaseline
      slug={slug}
      organizationId={org.id}
      schoolName={org.name}
      branding={org.branding}
      features={programContext.effectiveFeatures}
      userProfile={userProfile}
      portalOptions={portalOptions}
      openPortalLinksInNewTab={openPortalLinksInNewTab}
      parentPortalContexts={parentPortalContexts}
      parentNavBasePath={programContext.parentNavBasePath}
      coopModeEnabled={programContext.coopMode}
      coopProgramLabel={programContext.displayLabel}
      notificationContext={notificationContext}
      badgeCountPromises={badgeCountPromises}
      fridayBranchSettings={org.fridayBranchSettings}
    >
      {children}
    </SchoolParentBaseline>
  );
}
