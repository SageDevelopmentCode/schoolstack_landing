"use client";

import type { ReactNode } from "react";
import ApplyPortalNavbar from "@/components/admissions/ApplyPortalNavbar";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ApplyPortalPageShellProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  userEmail: string;
  userDisplayName: string;
  previewMode?: boolean;
  previewHomeHref?: string;
  children: ReactNode;
  /** Skip max-width content wrapper for full-bleed layouts (e.g. enrollment). */
  fullBleed?: boolean;
  /** Let children fill remaining viewport height below the navbar. */
  fillHeight?: boolean;
};

export default function ApplyPortalPageShell({
  branding,
  schoolName,
  schoolSlug,
  userEmail,
  userDisplayName,
  previewMode = false,
  previewHomeHref,
  children,
  fullBleed = false,
  fillHeight = false,
}: ApplyPortalPageShellProps) {
  const C = buildAdminThemeTokens(branding);
  const pageBg = branding.colors.bg;

  return (
    <div className="flex min-h-dvh flex-col" style={{ color: C.textPrimary }}>
      <ApplyPortalNavbar
        branding={branding}
        schoolName={schoolName}
        schoolSlug={schoolSlug}
        userEmail={userEmail}
        userDisplayName={userDisplayName}
        previewMode={previewMode}
        previewHomeHref={previewHomeHref}
      />
      <main
        className={`flex-1 ${fillHeight ? "flex min-h-0 flex-col" : ""} ${
          fullBleed ? "" : "px-4 py-8 sm:px-6 sm:py-10"
        }`}
        style={{ backgroundColor: pageBg }}
      >
        {fullBleed ? (
          children
        ) : (
          <div className="mx-auto max-w-3xl">{children}</div>
        )}
      </main>
    </div>
  );
}
