"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import SchoolTeacherHeader from "@/components/school-teacher/SchoolTeacherHeader";
import ParentToaster from "@/components/school-parent/ParentToaster";
import {
  ParentThemeProvider,
  useParentTheme,
} from "@/components/school-parent/ParentThemeContext";
import { isTeacherMessagesPath } from "@/lib/organization-settings/teacher-routes";
import type { StaffUserProfile } from "@/lib/staff/teacher-portal-access";
import { parentThemeCssVars } from "@/lib/organization-settings/parent-theme";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";
import { MessagesRefreshProvider } from "@/lib/messages/messages-refresh-context";
import { fraunces, dmSans } from "@/lib/fonts";

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

function SchoolTeacherBaselineInner({
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
  const { theme, adminCompat: C } = useParentTheme();

  return (
    <MessagesRefreshProvider
      organizationId={organizationId}
      enabled={messagesEnabled}
    >
      <div
        className={`flex h-dvh w-full flex-col overflow-hidden ${fraunces.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)]`}
        data-teacher-portal
        style={{
          ...parentThemeCssVars(theme),
          fontFamily: theme.fontBody,
          color: theme.ink,
          backgroundColor: theme.paper,
        }}
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
          className={`flex min-h-0 flex-1 flex-col ${
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

export default function SchoolTeacherBaseline(props: SchoolTeacherBaselineProps) {
  return (
    <ParentThemeProvider branding={props.branding}>
      <SchoolTeacherBaselineInner {...props} />
    </ParentThemeProvider>
  );
}
