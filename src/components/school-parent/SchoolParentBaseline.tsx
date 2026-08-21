"use client";

import { type ReactNode, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname } from "next/navigation";
import SchoolParentHeader from "@/components/school-parent/SchoolParentHeader";
import ParentToaster from "@/components/school-parent/ParentToaster";
import NavigationLoadingProvider from "@/components/school/shared/NavigationLoadingProvider";
import { MessagesRefreshProvider } from "@/lib/messages/messages-refresh-context";
import type { FamilyUserProfile } from "@/lib/admissions/parent-portal-access";
import type { SchoolPortalOption } from "@/lib/auth/portal-switcher-types";
import {
  isParentBillingPath,
  isParentMessagesPath,
} from "@/lib/organization-settings/parent-routes";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";

const AdminSupportRequestModal = dynamic(
  () => import("@/components/school-admin/AdminSupportRequestModal"),
  { ssr: false },
);

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

export default function SchoolParentBaseline({
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
  const [supportOpen, setSupportOpen] = useState(false);
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const bodyFont =
    branding.typography.bodyFont?.trim() || "Inter, system-ui, sans-serif";
  const isMessagesPage = isParentMessagesPath(pathname);
  const isFixedLayoutPage =
    isMessagesPage || isParentBillingPath(pathname);
  const messagesEnabled = Boolean(features.parent?.messages);
  const showHelpButton =
    !previewMode && isParentHelpPage(pathname, slug) && !isMessagesPage;

  const shell = (
    <div
      className={
        previewMode
          ? "flex min-h-0 flex-1 w-full flex-col overflow-hidden bg-white"
          : "flex h-dvh w-full flex-col overflow-hidden bg-white"
      }
      style={{ fontFamily: bodyFont, color: C.textPrimary }}
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
        className={`flex min-h-0 flex-1 flex-col bg-white ${
          isFixedLayoutPage ? "overflow-hidden" : "overflow-y-auto"
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </main>

      {showHelpButton ? (
        <button
          type="button"
          title="Need help?"
          onClick={() => setSupportOpen(true)}
          className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-pill px-4 py-2.5 text-xs font-medium shadow-lg transition hover:opacity-90 sm:bottom-6 sm:right-6 sm:px-5 sm:py-3 sm:text-sm"
          style={{
            backgroundColor: C.clayBg,
            border: `1px solid ${C.clayBorder}`,
            color: C.textSecondary,
          }}
        >
          <Image
            src="/images/Logo.png"
            alt=""
            width={20}
            height={20}
            className="h-5 w-5 w-auto object-contain"
            aria-hidden
          />
          Need help?
        </button>
      ) : null}

      {supportOpen ? (
        <AdminSupportRequestModal
          C={C}
          open={supportOpen}
          onClose={() => setSupportOpen(false)}
          organizationId={organizationId}
          userEmail={userProfile.email}
          currentPath={pathname}
          submitEndpoint="/api/parent-portal/support-requests"
        />
      ) : null}

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
