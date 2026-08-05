"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import SchoolAdminPreviewShell from "@/components/admin/SchoolAdminPreviewShell";
import SchoolAdminBaseline from "@/components/school-admin/SchoolAdminBaseline";
import { listPreviewPortalOptions } from "@/lib/admissions/preview-portal-options";
import type { FamilyUserProfile } from "@/lib/admissions/parent-portal-access";
import type { OrganizationWithSettings } from "@/lib/organization-settings/fetch";

type SchoolAdminPreviewLayoutClientProps = {
  slug: string;
  org: OrganizationWithSettings;
  defaultFamilyId: string | null;
  hasEnrolledAccess: boolean;
  userProfile: FamilyUserProfile;
  children: ReactNode;
};

export default function SchoolAdminPreviewLayoutClient({
  slug,
  org,
  defaultFamilyId,
  hasEnrolledAccess,
  userProfile,
  children,
}: SchoolAdminPreviewLayoutClientProps) {
  const searchParams = useSearchParams();
  const familyIdFromQuery = searchParams.get("familyId");
  const familyId =
    familyIdFromQuery && familyIdFromQuery.trim() !== ""
      ? familyIdFromQuery.trim()
      : defaultFamilyId;

  const portalOptions = useMemo(() => {
    if (!familyId) {
      return [
        {
          id: "admin" as const,
          label: "School admin",
          href: `/admin/preview/${slug}/admin`,
        },
      ];
    }

    return listPreviewPortalOptions({
      slug,
      familyId,
      hasEnrolledAccess,
      org,
    });
  }, [familyId, hasEnrolledAccess, org, slug]);

  return (
    <SchoolAdminPreviewShell
      schoolName={org.name}
      userProfile={userProfile}
      familyId={familyId}
    >
      <SchoolAdminBaseline
        slug={slug}
        organizationId={org.id}
        schoolName={org.name}
        branding={org.branding}
        features={org.features}
        userProfile={userProfile}
        portalOptions={portalOptions}
        previewMode
      >
        {children}
      </SchoolAdminBaseline>
    </SchoolAdminPreviewShell>
  );
}
