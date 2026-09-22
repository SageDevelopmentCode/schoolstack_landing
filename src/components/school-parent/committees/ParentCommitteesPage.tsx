"use client";

import PortalCommitteesPage from "@/components/portal-committees/PortalCommitteesPage";
import type { ParentCommitteesInitialData } from "@/lib/committees/load-parent-committees-data";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ParentCommitteesPageProps = {
  organizationId: string;
  schoolSlug: string;
  schoolName: string;
  branding: OrganizationBranding;
  guardianName: string;
  previewMode?: boolean;
  initialData?: ParentCommitteesInitialData;
};

export default function ParentCommitteesPage({
  guardianName,
  ...props
}: ParentCommitteesPageProps) {
  return (
    <PortalCommitteesPage
      {...props}
      requesterName={guardianName}
      apiNamespace="parent-portal"
      operationalSurface="parent_portal"
      showGradeField
    />
  );
}
