"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import SchoolParentHeader from "@/components/school-parent/SchoolParentHeader";
import { ParentPortalContextProvider } from "@/components/school-parent/ParentPortalContextProvider";
import ParentToaster from "@/components/school-parent/ParentToaster";
import { ParentThemeProvider, useParentTheme } from "@/components/school-parent/ParentThemeContext";
import PortalHelpFab from "@/components/school/shared/PortalHelpFab";
import NavigationLoadingProvider from "@/components/school/shared/NavigationLoadingProvider";
import { MessagesRefreshProvider } from "@/lib/messages/messages-refresh-context";
import { fraunces, dmSans } from "@/lib/fonts";
import type { FamilyUserProfile } from "@/lib/admissions/parent-portal-access";
import type { SchoolPortalOption } from "@/lib/auth/portal-switcher-types";
import type { ParentPortalContextOption } from "@/lib/organization-settings/resolve-program-parent-features";
import {
  isParentBillingPath,
  isParentMessagesPath,
} from "@/lib/organization-settings/parent-routes";
import { parentThemeCssVars } from "@/lib/organization-settings/parent-theme";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";

export type SchoolParentEmbeddedPreview = {
  pathname: string;
  onNavigate: (href: string) => void;
};

type SchoolParentBaselineProps = {
  slug: string;
  organizationId: string;
  schoolName: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  userProfile: FamilyUserProfile;
  portalOptions?: SchoolPortalOption[];
  parentPortalContexts?: ParentPortalContextOption[];
  parentNavBasePath?: string;
  children: ReactNode;
  previewMode?: boolean;
  previewBasePath?: string;
  previewParentBasePath?: string;
  embeddedPreview?: SchoolParentEmbeddedPreview;
};

function isParentHelpPage(pathname: string, slug: string): boolean {
  return (
    pathname.startsWith(`/school/${slug}/parent/`) ||
    (pathname.includes(`/admin/preview/${slug}/`) &&
      pathname.includes("/parent/"))
  );
}

function SchoolParentBaselineInner({
  slug,
  organizationId,
  schoolName,
  branding,
  features,
  userProfile,
  portalOptions = [],
  parentPortalContexts = [],
  parentNavBasePath,
  children,
  previewMode = false,
  previewBasePath,
  previewParentBasePath,
  embeddedPreview,
}: SchoolParentBaselineProps) {
  const routerPathname = usePathname();
  const pathname = embeddedPreview?.pathname ?? routerPathname;
  const { theme, adminCompat: C } = useParentTheme();
  const isMessagesPage = isParentMessagesPath(pathname);
  const isFixedLayoutPage =
    isMessagesPage || isParentBillingPath(pathname);
  const messagesEnabled = Boolean(features.parent?.messages);
  const showHelpButton = isParentHelpPage(pathname, slug) && !isMessagesPage;

  const shell = (
    <ParentPortalContextProvider
      slug={slug}
      contexts={parentPortalContexts}
      previewParentBasePath={previewParentBasePath}
      onPreviewNavigate={embeddedPreview?.onNavigate}
      pathnameOverride={embeddedPreview?.pathname}
    >
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
          parentNavBasePath={parentNavBasePath ?? previewParentBasePath}
          mainParentBasePath={
            previewParentBasePath ?? `/school/${slug}/parent`
          }
          previewMode={previewMode}
          previewBasePath={previewBasePath}
          previewParentBasePath={previewParentBasePath}
          embeddedPreview={embeddedPreview}
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
    </ParentPortalContextProvider>
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
