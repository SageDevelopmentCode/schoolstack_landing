"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import SchoolParentHeader from "@/components/school-parent/SchoolParentHeader";
import ParentToaster from "@/components/school-parent/ParentToaster";
import { ParentThemeProvider, useParentTheme } from "@/components/school-parent/ParentThemeContext";
import PortalHelpFab from "@/components/school/shared/PortalHelpFab";
import NavigationLoadingProvider from "@/components/school/shared/NavigationLoadingProvider";
import { MessagesRefreshProvider } from "@/lib/messages/messages-refresh-context";
import { fraunces, dmSans } from "@/lib/fonts";
import type { FamilyUserProfile } from "@/lib/admissions/parent-portal-access";
import type { SchoolPortalOption } from "@/lib/auth/portal-switcher-types";
import {
  isParentBillingPath,
  isParentMessagesPath,
} from "@/lib/organization-settings/parent-routes";
import { parentThemeCssVars } from "@/lib/organization-settings/parent-theme";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";

type SchoolParentBaselineProps = {
  slug: string;
  organizationId: string;
  schoolName: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  userProfile: FamilyUserProfile;
  portalOptions?: SchoolPortalOption[];
  children: ReactNode;
  previewMode?: boolean;
  previewBasePath?: string;
  previewParentBasePath?: string;
};

function isParentHelpPage(pathname: string, slug: string): boolean {
  return pathname.startsWith(`/school/${slug}/parent/`);
}

function SchoolParentBaselineInner({
  slug,
  organizationId,
  schoolName,
  branding,
  features,
  userProfile,
  portalOptions = [],
  children,
  previewMode = false,
  previewBasePath,
  previewParentBasePath,
}: SchoolParentBaselineProps) {
  const pathname = usePathname();
  const { theme, adminCompat: C } = useParentTheme();
  const isMessagesPage = isParentMessagesPath(pathname);
  const isFixedLayoutPage =
    isMessagesPage || isParentBillingPath(pathname);
  const messagesEnabled = Boolean(features.parent?.messages);
  const showHelpButton = isParentHelpPage(pathname, slug) && !isMessagesPage;

  const shell = (
    <div
      className={
        previewMode
          ? `flex min-h-0 flex-1 w-full flex-col overflow-hidden ${fraunces.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)]`
          : `flex h-dvh w-full flex-col overflow-hidden ${fraunces.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)]`
      }
      data-parent-portal
      style={{
        ...parentThemeCssVars(theme),
        fontFamily: theme.fontBody,
        color: theme.ink,
        backgroundColor: theme.paper,
      }}
    >
      <SchoolParentHeader
        slug={slug}
        organizationId={organizationId}
        schoolName={schoolName}
        branding={branding}
        features={features}
        userProfile={userProfile}
        portalOptions={portalOptions}
        previewMode={previewMode}
        previewBasePath={previewBasePath}
        previewParentBasePath={previewParentBasePath}
      />

      <main
        className={`flex min-h-0 flex-1 flex-col ${
          isFixedLayoutPage ? "overflow-hidden" : "overflow-y-auto"
        }`}
        style={{ backgroundColor: theme.paper }}
      >
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </main>

      <PortalHelpFab
        C={C}
        organizationId={organizationId}
        userEmail={userProfile.email}
        currentPath={pathname}
        submitEndpoint="/api/parent-portal/support-requests"
        visible={showHelpButton}
        readOnly={previewMode}
      />

      <ParentToaster C={C} helpButtonVisible={showHelpButton} />
    </div>
  );

  const wrappedShell = (
    <MessagesRefreshProvider
      organizationId={organizationId}
      enabled={messagesEnabled && !previewMode}
    >
      {shell}
    </MessagesRefreshProvider>
  );

  if (previewMode) {
    return wrappedShell;
  }

  return <NavigationLoadingProvider>{wrappedShell}</NavigationLoadingProvider>;
}

export default function SchoolParentBaseline(props: SchoolParentBaselineProps) {
  return (
    <ParentThemeProvider branding={props.branding}>
      <SchoolParentBaselineInner {...props} />
    </ParentThemeProvider>
  );
}
