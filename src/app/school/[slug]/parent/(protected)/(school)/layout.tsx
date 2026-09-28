import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import SchoolParentBaseline from "@/components/school-parent/SchoolParentBaseline";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import { getRequestUser } from "@/lib/auth/session";
import {
  loadParentPortalNavContextsForUser,
  shouldRedirectAwayFromMainParentPortal,
} from "@/lib/admissions/program-parent-portal-access";
import { getParentPortalUserProfile } from "@/lib/parent-portal/parent-portal-server-cache";
import { getParentPortalActivityUnreadCount } from "@/lib/parent-portal/parent-activity-notifications-server";
import { buildMainParentNotificationContext } from "@/lib/parent-portal/parent-notification-context";
import { getPortalAccountLinkContext } from "@/lib/auth/portal-account-link-context";
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
  const org = await fetchOrganizationWithSettings(supabase, slug);
  const user = await getRequestUser();

  if (!org || !user) {
    return children;
  }

  const [userProfile, portalOptions, parentPortalContexts, linkContext] =
    await Promise.all([
    getParentPortalUserProfile(supabase, org.id),
    listSchoolPortalOptionsForUser(supabase, user.id, slug, {
      org,
      hasEnrolledAccess: true,
      hasFamilyAccess: true,
    }),
    loadParentPortalNavContextsForUser({
      supabase,
      userId: user.id,
      organizationId: org.id,
      schoolSlug: slug,
      schoolName: org.name,
      orgFeatures: org.features,
    }),
    getPortalAccountLinkContext(supabase, org.id, user.id),
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

  const familyIds = await getFamilyIdsForUser(supabase, user.id, org.id);
  const familyId = familyIds[0];
  const notificationContext = buildMainParentNotificationContext(slug);
  const initialActivityUnreadCount = familyId
    ? await getParentPortalActivityUnreadCount(supabase, {
        organizationId: org.id,
        slug,
        familyId,
        userId: user.id,
        notificationContext,
      })
    : 0;

  return (
    <SchoolParentBaseline
      slug={slug}
      organizationId={org.id}
      schoolName={org.name}
      branding={org.branding}
      features={resolveMainParentOrganizationFeatures(org.features)}
      userProfile={userProfile}
      portalOptions={portalOptions}
      openPortalLinksInNewTab={openPortalLinksInNewTab}
      parentPortalContexts={parentPortalContexts}
      initialActivityUnreadCount={initialActivityUnreadCount}
      notificationContext={notificationContext}
    >
      {children}
    </SchoolParentBaseline>
  );
}
