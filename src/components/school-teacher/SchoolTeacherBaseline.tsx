"use client";

import { type ReactNode, useMemo } from "react";
import { usePathname } from "next/navigation";
import SchoolTeacherHeader from "@/components/school-teacher/SchoolTeacherHeader";
import ParentToaster from "@/components/school-parent/ParentToaster";
import { isTeacherMessagesPath } from "@/lib/organization-settings/teacher-routes";
import type { StaffUserProfile } from "@/lib/staff/teacher-portal-access";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";
import { MessagesRefreshProvider } from "@/lib/messages/messages-refresh-context";

type SchoolTeacherBaselineProps = {
  slug: string;
  organizationId: string;
  schoolName: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  userProfile: StaffUserProfile;
  previewMode?: boolean;
  previewBasePath?: string;
  children: ReactNode;
};

export default function SchoolTeacherBaseline({
  slug,
  organizationId,
  schoolName,
  branding,
  features,
  userProfile,
  previewMode = false,
  previewBasePath,
  children,
}: SchoolTeacherBaselineProps) {
  const pathname = usePathname();
  const isMessagesPage = isTeacherMessagesPath(pathname);
  const messagesEnabled = Boolean(features.teacher?.messages) && !previewMode;
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const bodyFont =
    branding.typography.bodyFont?.trim() || "Inter, system-ui, sans-serif";

  return (
    <MessagesRefreshProvider
      organizationId={organizationId}
      enabled={messagesEnabled}
    >
    <div
      className="flex h-dvh w-full flex-col overflow-hidden bg-white"
      style={{ fontFamily: bodyFont, color: C.textPrimary }}
    >
      <SchoolTeacherHeader
        slug={slug}
        organizationId={organizationId}
        schoolName={schoolName}
        branding={branding}
        features={features}
        userProfile={userProfile}
        previewMode={previewMode}
        previewBasePath={previewBasePath}
      />

      <main
        className={`flex min-h-0 flex-1 flex-col bg-white ${
          isMessagesPage ? "overflow-hidden" : "overflow-y-auto"
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </main>
      <ParentToaster C={C} />
    </div>
    </MessagesRefreshProvider>
  );
}
