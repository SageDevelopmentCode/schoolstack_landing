"use client";

import type { ReactNode } from "react";
import { fraunces, dmSans } from "@/lib/fonts";
import { parentThemeCssVars } from "@/lib/organization-settings/parent-theme";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";

type ApplyPortalPageLayoutProps = {
  children: ReactNode;
};

export function ApplyPortalPageLayout({ children }: ApplyPortalPageLayoutProps) {
  const { theme } = useParentTheme();

  return (
    <div
      className={`flex min-h-dvh flex-col ${fraunces.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)]`}
      data-apply-portal
      style={{
        ...parentThemeCssVars(theme),
        fontFamily: theme.fontBody,
        color: theme.ink,
        backgroundColor: theme.paper,
      }}
    >
      {children}
    </div>
  );
}

type ApplyPortalPageMainProps = {
  children: ReactNode;
  fullBleed?: boolean;
  fillHeight?: boolean;
};

export function ApplyPortalPageMain({
  children,
  fullBleed = false,
  fillHeight = false,
}: ApplyPortalPageMainProps) {
  const { theme } = useParentTheme();

  return (
    <main
      className={`flex-1 ${fillHeight ? "flex min-h-0 flex-col" : ""} ${
        fullBleed ? "" : "px-4 py-6 sm:px-8 sm:py-8 lg:px-[68px] lg:py-10"
      }`}
      style={{ backgroundColor: theme.paper }}
    >
      {fullBleed ? (
        children
      ) : (
        <div className="mx-auto w-full max-w-[1130px]">{children}</div>
      )}
    </main>
  );
}
