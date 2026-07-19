import type { ReactNode } from "react";
import ApplyPortalBranding from "@/components/admissions/ApplyPortalBranding";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ApplyAuthShellProps = {
  branding: OrganizationBranding;
  schoolName: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  schoolLogoClassName?: string;
};

export default function ApplyAuthShell({
  branding,
  schoolName,
  title,
  subtitle,
  children,
  schoolLogoClassName = "h-8 w-auto max-w-[200px] object-contain",
}: ApplyAuthShellProps) {
  const C = buildAdminThemeTokens(branding);
  const pageBg = branding.colors.bg;

  return (
    <div
      className="flex min-h-dvh flex-col items-center px-6 py-12"
      style={{ backgroundColor: pageBg, color: C.textPrimary }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <ApplyPortalBranding
            branding={branding}
            schoolName={schoolName}
            schoolLogoClassName={schoolLogoClassName}
          />
        </div>

        {title ? (
          <h1
            className="text-center text-xl font-semibold sm:text-2xl"
            style={{ color: C.accentDark }}
          >
            {title}
          </h1>
        ) : null}

        {subtitle ? (
          <p
            className="mt-3 text-center text-sm leading-relaxed"
            style={{ color: C.textSecondary }}
          >
            {subtitle}
          </p>
        ) : null}

        {children}
      </div>
    </div>
  );
}
