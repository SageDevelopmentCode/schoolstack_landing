"use client";

import type { ReactNode } from "react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import PortalHeader from "@/components/mudkitchen-portal/PortalHeader";
import { PortalThemeProvider, usePortalTheme } from "@/components/mudkitchen-portal/PortalThemeProvider";

type MudKitchenPortalShellProps = {
  slug: string;
  schoolName: string;
  branding: OrganizationBranding;
  dueInvoiceCount?: number;
  children: ReactNode;
};

function PortalShellInner({
  slug,
  schoolName,
  branding,
  dueInvoiceCount = 0,
  children,
}: MudKitchenPortalShellProps) {
  const T = usePortalTheme();

  return (
    <div
      className="min-h-screen font-body"
      style={{ backgroundColor: T.pageBg, color: T.textPrimary }}
    >
      <PortalHeader
        slug={slug}
        schoolName={schoolName}
        branding={branding}
        dueInvoiceCount={dueInvoiceCount}
      />
      <main>{children}</main>
    </div>
  );
}

export default function MudKitchenPortalShell({
  slug,
  schoolName,
  branding,
  dueInvoiceCount = 0,
  children,
}: MudKitchenPortalShellProps) {
  return (
    <PortalThemeProvider branding={branding}>
      <PortalShellInner
        slug={slug}
        schoolName={schoolName}
        branding={branding}
        dueInvoiceCount={dueInvoiceCount}
      >
        {children}
      </PortalShellInner>
    </PortalThemeProvider>
  );
}
