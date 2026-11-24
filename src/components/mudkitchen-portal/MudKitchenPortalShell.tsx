"use client";

import type { ReactNode } from "react";
import { LayoutGroup } from "framer-motion";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import PortalHeader, {
  type MudKitchenPortalSection,
} from "@/components/mudkitchen-portal/PortalHeader";

/**
 * MudKitchen account area frame (Calm Garden). Must render inside GardenRoot,
 * which supplies the --sf-* tokens and fonts.
 */
export default function MudKitchenPortalShell({
  slug,
  schoolName,
  branding,
  dueInvoiceCount = 0,
  activeSection,
  children,
}: {
  slug: string;
  schoolName: string;
  branding: OrganizationBranding;
  dueInvoiceCount?: number;
  activeSection?: MudKitchenPortalSection;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh overflow-x-clip bg-[var(--sf-cream)] text-[var(--sf-ink)]">
      <LayoutGroup id="mk-portal">
        <PortalHeader
          slug={slug}
          schoolName={schoolName}
          branding={branding}
          dueInvoiceCount={dueInvoiceCount}
          activeSection={activeSection}
        />
      </LayoutGroup>
      <main>{children}</main>
    </div>
  );
}
