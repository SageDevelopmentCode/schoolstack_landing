"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import ApplyPortalNavbar from "@/components/admissions/ApplyPortalNavbar";
import ParentToaster from "@/components/school-parent/ParentToaster";
import PortalHelpFab from "@/components/school/shared/PortalHelpFab";
import NavigationLoadingProvider from "@/components/school/shared/NavigationLoadingProvider";
import { usePreviewPortalOptions } from "@/components/admin/PreviewPortalOptionsProvider";
import {
  ApplyPortalPageLayout,
  ApplyPortalPageMain,
} from "@/components/admissions/ApplyPortalPageLayout";
import {
  ParentThemeProvider,
  useParentTheme,
} from "@/components/school-parent/ParentThemeContext";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { SchoolPortalOption } from "@/lib/auth/portal-switcher-types";

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
  helpFabClassName?: string;
};

function ApplyPortalPageShellInner({
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
  helpFabClassName,
}: ApplyPortalPageShellProps) {
  const pathname = usePathname();
  const previewPortalOptions = usePreviewPortalOptions();
  const { adminCompat: C } = useParentTheme();
  const resolvedPortalOptions =
    previewMode && previewPortalOptions.length > 0
      ? previewPortalOptions
      : portalOptions;
  const showHelpButton = Boolean(organizationId);

  const shell = (
    <>
      <ApplyPortalPageLayout>
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
          fullBleed={fullBleed}
          fillHeight={fillHeight}
        >
          {children}
        </ApplyPortalPageMain>
      </ApplyPortalPageLayout>

      {organizationId ? (
        <PortalHelpFab
          C={C}
          organizationId={organizationId}
          userEmail={userEmail}
          currentPath={pathname}
          submitEndpoint="/api/admissions/support-requests"
          visible={showHelpButton}
          readOnly={previewMode}
          className={helpFabClassName}
        />
      ) : null}

      <ParentToaster C={C} helpButtonVisible={showHelpButton} />
    </>
  );

  if (previewMode) {
    return shell;
  }

  return <NavigationLoadingProvider>{shell}</NavigationLoadingProvider>;
}

export default function ApplyPortalPageShell(props: ApplyPortalPageShellProps) {
  return (
    <ParentThemeProvider branding={props.branding}>
      <ApplyPortalPageShellInner {...props} />
    </ParentThemeProvider>
  );
}
