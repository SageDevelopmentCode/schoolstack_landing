"use client";

import type { ReactNode } from "react";
import ApplyPortalBranding from "@/components/admissions/ApplyPortalBranding";
import {
  ParentThemeProvider,
  useParentTheme,
} from "@/components/school-parent/ParentThemeContext";
import { fraunces, dmSans } from "@/lib/fonts";
import { parentThemeCssVars } from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type PublicTourStoryShellProps = {
  branding: OrganizationBranding;
  schoolName: string;
  children: ReactNode;
};

function PublicTourStoryShellInner({
  branding,
  schoolName,
  children,
}: {
  branding: OrganizationBranding;
  schoolName: string;
  children: ReactNode;
}) {
  const { theme } = useParentTheme();

  return (
    <div
      className={`${fraunces.variable} ${dmSans.variable} min-h-screen px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-12 [&_.font-heading]:font-[family-name:var(--font-fraunces)]`}
      style={{
        ...parentThemeCssVars(theme),
        backgroundColor: theme.paper,
        fontFamily: theme.fontBody,
        color: theme.ink,
      }}
    >
      <div className="mx-auto max-w-[760px]">
        <div className="mb-8 flex justify-center sm:mb-10">
          <ApplyPortalBranding
            branding={branding}
            schoolName={schoolName}
            platformHomeHref="/"
            schoolLogoClassName="h-10 w-auto max-w-[min(240px,55vw)] object-contain sm:h-12"
          />
        </div>
        {children}
      </div>
    </div>
  );
}

export default function PublicTourStoryShell({
  branding,
  schoolName,
  children,
}: PublicTourStoryShellProps) {
  return (
    <ParentThemeProvider branding={branding}>
      <PublicTourStoryShellInner branding={branding} schoolName={schoolName}>
        {children}
      </PublicTourStoryShellInner>
    </ParentThemeProvider>
  );
}
