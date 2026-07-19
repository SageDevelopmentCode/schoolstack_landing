import type { ReactNode } from "react";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ApplyPortalPageLayoutProps = {
  branding: OrganizationBranding;
  children: ReactNode;
};

export function ApplyPortalPageLayout({
  branding,
  children,
}: ApplyPortalPageLayoutProps) {
  const C = buildAdminThemeTokens(branding);

  return (
    <div className="flex min-h-dvh flex-col" style={{ color: C.textPrimary }}>
      {children}
    </div>
  );
}

type ApplyPortalPageMainProps = {
  branding: OrganizationBranding;
  children: ReactNode;
  fullBleed?: boolean;
  fillHeight?: boolean;
};

export function ApplyPortalPageMain({
  branding,
  children,
  fullBleed = false,
  fillHeight = false,
}: ApplyPortalPageMainProps) {
  const pageBg = branding.colors.bg;

  return (
    <main
      className={`flex-1 ${fillHeight ? "flex min-h-0 flex-col" : ""} ${
        fullBleed ? "" : "px-4 py-8 sm:px-6 sm:py-10"
      }`}
      style={{ backgroundColor: pageBg }}
    >
      {fullBleed ? children : <div className="mx-auto max-w-3xl">{children}</div>}
    </main>
  );
}
