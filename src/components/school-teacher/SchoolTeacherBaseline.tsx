"use client";

import { type ReactNode, useMemo } from "react";
import SchoolTeacherHeader from "@/components/school-teacher/SchoolTeacherHeader";
import type { StaffUserProfile } from "@/lib/staff/teacher-portal-access";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";

type SchoolTeacherBaselineProps = {
  slug: string;
  schoolName: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  userProfile: StaffUserProfile;
  children: ReactNode;
};

export default function SchoolTeacherBaseline({
  slug,
  schoolName,
  branding,
  features,
  userProfile,
  children,
}: SchoolTeacherBaselineProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const bodyFont =
    branding.typography.bodyFont?.trim() || "Inter, system-ui, sans-serif";

  return (
    <div
      className="flex h-dvh w-full flex-col overflow-hidden bg-white"
      style={{ fontFamily: bodyFont, color: C.textPrimary }}
    >
      <SchoolTeacherHeader
        slug={slug}
        schoolName={schoolName}
        branding={branding}
        features={features}
        userProfile={userProfile}
      />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white">
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </main>
    </div>
  );
}
