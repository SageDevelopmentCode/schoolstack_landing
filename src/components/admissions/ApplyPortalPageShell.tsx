"use client";

import type { ReactNode } from "react";
import ApplyPortalNavbar from "@/components/admissions/ApplyPortalNavbar";
import {
  ApplyPortalPageLayout,
  ApplyPortalPageMain,
} from "@/components/admissions/ApplyPortalPageLayout";
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
  fullBleed?: boolean;
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
  return (
    <ApplyPortalPageLayout branding={branding}>
      <ApplyPortalNavbar
        branding={branding}
        schoolName={schoolName}
        schoolSlug={schoolSlug}
        userEmail={userEmail}
        userDisplayName={userDisplayName}
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
  );
}
