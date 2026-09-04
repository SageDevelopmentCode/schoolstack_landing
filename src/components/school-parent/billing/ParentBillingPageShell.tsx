"use client";

import { useCallback, useMemo, useState } from "react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { ParentBillingInitialData } from "@/lib/tuition/load-parent-billing-data";
import type { ParentBillingPageMeta } from "@/lib/tuition/parent-billing-page-meta";
import ParentBillingPage from "./ParentBillingPage";
import { ParentBillingPageContext } from "./parent-billing-page-context";

type ParentBillingPageShellProps = {
  organizationId: string;
  familyId: string;
  branding: OrganizationBranding;
  slug: string;
  previewMode?: boolean;
  initialPreviewData?: ParentBillingInitialData;
  initialPreviewMeta?: ParentBillingPageMeta;
  children?: React.ReactNode;
};

export default function ParentBillingPageShell({
  organizationId,
  familyId,
  branding,
  slug,
  previewMode = false,
  initialPreviewData,
  initialPreviewMeta,
  children,
}: ParentBillingPageShellProps) {
  const [billingData, setBillingData] = useState<ParentBillingInitialData | null>(
    previewMode && initialPreviewData ? initialPreviewData : null,
  );
  const [billingHydrated, setBillingHydrated] = useState(
    Boolean(previewMode && initialPreviewData),
  );
  const [pageMeta, setPageMeta] = useState<ParentBillingPageMeta | null>(
    previewMode && initialPreviewMeta ? initialPreviewMeta : null,
  );

  const hydrateBillingData = useCallback((data: ParentBillingInitialData) => {
    setBillingData(data);
    setBillingHydrated(true);
  }, []);

  const hydrateMeta = useCallback((meta: ParentBillingPageMeta) => {
    setPageMeta(meta);
  }, []);

  const contextValue = useMemo(
    () => ({
      hydrateBillingData,
      hydrateMeta,
    }),
    [hydrateBillingData, hydrateMeta],
  );

  const staticPreview = previewMode && initialPreviewData;

  return (
    <ParentBillingPageContext.Provider value={contextValue}>
      <ParentBillingPage
        organizationId={organizationId}
        familyId={familyId}
        branding={branding}
        slug={slug}
        previewMode={previewMode}
        initialData={staticPreview ? initialPreviewData : (billingData ?? undefined)}
        billingDeferred={staticPreview ? false : !billingHydrated}
        pageMeta={staticPreview ? (initialPreviewMeta ?? null) : pageMeta}
      />
      {children}
    </ParentBillingPageContext.Provider>
  );
}
