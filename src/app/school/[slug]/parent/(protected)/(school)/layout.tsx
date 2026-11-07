import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import SchoolParentBaseline from "@/components/school-parent/SchoolParentBaseline";
import { getRequestUser } from "@/lib/auth/session";
import { shouldRedirectAwayFromMainParentPortal } from "@/lib/admissions/program-parent-portal-access";
import {
  getCachedParentPortalNavContexts,
  getCachedPortalAccountLinkContext,
  getParentPortalUserProfile,
} from "@/lib/parent-portal/parent-portal-server-cache";
import { buildMainParentNotificationContext } from "@/lib/parent-portal/parent-notification-context";
import { startParentBadgeCountLoads } from "@/lib/parent-portal/parent-badge-counts";
import { listSchoolPortalOptionsForUser } from "@/lib/auth/portal-switcher-server";
import { portalAccountLinkOpensInNewTab } from "@/lib/auth/portal-switcher-types";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { resolveMainParentOrganizationFeatures } from "@/lib/organization-settings/resolve-program-parent-features";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function SchoolParentMainLayout({
  children,
  params,
}: LayoutProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(slug);
  const user = await getRequestUser();

  if (!org || !user) {
    return children;
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

  if (shouldRedirectAwayFromMainParentPortal(parentPortalContexts)) {
    const entryHref = parentPortalContexts[0]?.entryHref;
    if (entryHref) {
      redirect(entryHref);
    }
  }

  const notificationContext = buildMainParentNotificationContext(slug);
  const features = resolveMainParentOrganizationFeatures(org.features);
  // Started, not awaited: the shell renders now and the header badges fill in as these resolve.
  const badgeCountPromises = startParentBadgeCountLoads({
    supabase,
    organizationId: org.id,
    organizationName: org.name,
    slug,
    userId: user.id,
    notificationContext,
    messagesEnabled: Boolean(features.parent?.messages),
    committeesEnabled: Boolean(features.parent?.committees),
  });

  return (
    <SchoolParentBaseline
      slug={slug}
      organizationId={org.id}
      schoolName={org.name}
      branding={org.branding}
      features={features}
      userProfile={userProfile}
      portalOptions={portalOptions}
      openPortalLinksInNewTab={openPortalLinksInNewTab}
      parentPortalContexts={parentPortalContexts}
      notificationContext={notificationContext}
      badgeCountPromises={badgeCountPromises}
      fridayBranchSettings={org.fridayBranchSettings}
    >
      {children}
    </SchoolParentBaseline>
  );
}
