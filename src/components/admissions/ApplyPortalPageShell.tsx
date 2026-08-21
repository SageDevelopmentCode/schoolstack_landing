"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import ApplyPortalNavbar from "@/components/admissions/ApplyPortalNavbar";
import ParentToaster from "@/components/school-parent/ParentToaster";
import NavigationLoadingProvider from "@/components/school/shared/NavigationLoadingProvider";
import { usePreviewPortalOptions } from "@/components/admin/PreviewPortalOptionsProvider";
import {
  ApplyPortalPageLayout,
  ApplyPortalPageMain,
} from "@/components/admissions/ApplyPortalPageLayout";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { SchoolPortalOption } from "@/lib/auth/portal-switcher-types";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";

type ApplyPortalPageShellProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  organizationId?: string;
  userEmail: string;
  userDisplayName: string;
  profilePhotoUrl?: string | null;
  portalOptions?: SchoolPortalOption[];
  previewMode?: boolean;
  previewHomeHref?: string;
  children: ReactNode;
  fullBleed?: boolean;
  fillHeight?: boolean;
};

export default function ApplyPortalPageShell({
  branding,
  schoolName,
  schoolSlug,
  organizationId,
  userEmail,
  userDisplayName,
  profilePhotoUrl = null,
  portalOptions = [],
  previewMode = false,
  previewHomeHref,
  children,
  fullBleed = false,
  fillHeight = false,
}: ApplyPortalPageShellProps) {
  const previewPortalOptions = usePreviewPortalOptions();
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const resolvedPortalOptions =
    previewMode && previewPortalOptions.length > 0
      ? previewPortalOptions
      : portalOptions;

  const shell = (
    <>
      <ApplyPortalPageLayout branding={branding}>
        <ApplyPortalNavbar
          branding={branding}
          schoolName={schoolName}
          schoolSlug={schoolSlug}
          organizationId={organizationId}
          userEmail={userEmail}
          userDisplayName={userDisplayName}
          profilePhotoUrl={profilePhotoUrl}
          portalOptions={resolvedPortalOptions}
          previewMode={previewMode}
          previewHomeHref={previewHomeHref}
        />
        <ApplyPortalPageMain
          branding={branding}
          fullBleed={fullBleed}
          fillHeight={fillHeight}
        >
          {children}
        </ApplyPortalPageMain>
      </ApplyPortalPageLayout>
      <ParentToaster C={C} />
    </>
  );

  if (previewMode) {
    return shell;
  }

  return <NavigationLoadingProvider>{shell}</NavigationLoadingProvider>;
}
