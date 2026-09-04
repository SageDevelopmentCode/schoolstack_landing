"use client";

import { useCallback, useMemo, useState } from "react";
import type { FamilyUserProfile } from "@/lib/admissions/parent-portal-access";
import type { ParentHomeContentData } from "@/lib/parent-portal/load-parent-home-content-data";
import type { ParentPortalHomeMeta } from "@/lib/parent-portal/parent-portal-home-meta";
import type { ParentQuickAction } from "@/lib/organization-settings/parent-home";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { ParentSignupAttentionItem } from "@/lib/classroom-signups/types";
import type { OrganizationEvent } from "@/lib/school-events/types";
import ParentHomePage from "@/components/school-parent/ParentHomePage";
import { ParentHomePageContext } from "./parent-home-page-context";

type ParentHomePageShellProps = {
  branding: OrganizationBranding;
  schoolSlug: string;
  organizationId: string;
  familyId?: string;
  userProfile: FamilyUserProfile;
  quickActions: ParentQuickAction[];
  upcomingEvents: OrganizationEvent[];
  homeMeta?: ParentPortalHomeMeta | null;
  initialSignupAttentionItems?: ParentSignupAttentionItem[];
  previewMode?: boolean;
  previewBasePath?: string;
  programPortalLabel?: string;
  children?: React.ReactNode;
};

export default function ParentHomePageShell({
  branding,
  schoolSlug,
  organizationId,
  familyId,
  userProfile,
  quickActions,
  upcomingEvents,
  homeMeta = null,
  initialSignupAttentionItems = [],
  previewMode = false,
  previewBasePath,
  programPortalLabel,
  children,
}: ParentHomePageShellProps) {
  const [homeContent, setHomeContent] = useState<ParentHomeContentData | null>(null);
  const [contentHydrated, setContentHydrated] = useState(false);

  const hydrateHomeContent = useCallback((data: ParentHomeContentData) => {
    setHomeContent(data);
    setContentHydrated(true);
  }, []);

  const contextValue = useMemo(() => ({ hydrateHomeContent }), [hydrateHomeContent]);

  return (
    <ParentHomePageContext.Provider value={contextValue}>
      <ParentHomePage
        branding={branding}
        schoolSlug={schoolSlug}
        organizationId={organizationId}
        familyId={familyId}
        userProfile={userProfile}
        quickActions={quickActions}
        upcomingEvents={upcomingEvents}
        homeMeta={homeMeta}
        familyChildren={homeContent?.familyChildren ?? []}
        onboardingItems={homeContent?.onboardingItems ?? []}
        enrollmentAmendmentBannerItems={homeContent?.enrollmentAmendmentBannerItems ?? []}
        enrollmentIncompleteBannerItems={homeContent?.enrollmentIncompleteBannerItems ?? []}
        contentDeferred={!contentHydrated}
        deferSignupAttentionLoad={!previewMode}
        classroomSignupAttentionItems={initialSignupAttentionItems}
        previewMode={previewMode}
        previewBasePath={previewBasePath}
        programPortalLabel={programPortalLabel}
      />
      {children}
    </ParentHomePageContext.Provider>
  );
}
