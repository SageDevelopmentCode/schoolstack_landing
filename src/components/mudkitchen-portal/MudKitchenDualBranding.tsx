"use client";

import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { buildPortalTheme } from "@/lib/mudkitchen-portal/theme";
import PortalBrandingLogos from "@/components/mudkitchen-portal/PortalBrandingLogos";

type MudKitchenDualBrandingProps = {
  schoolName: string;
  branding: OrganizationBranding;
  progressPercent?: number | null;
};

export default function MudKitchenDualBranding({
  schoolName,
  branding,
  progressPercent = null,
}: MudKitchenDualBrandingProps) {
  const T = buildPortalTheme(branding);
  const showProgress =
    progressPercent !== null &&
    progressPercent !== undefined &&
    Number.isFinite(progressPercent);

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{
        backgroundColor: T.headerBackdrop,
        borderColor: T.border,
      }}
    >
      <div className="mx-auto flex max-w-[1100px] justify-center px-6 py-4 lg:px-16">
        <PortalBrandingLogos
          schoolName={schoolName}
          branding={branding}
          theme={T}
          align="center"
        />
      </div>
      {showProgress ? (
        <div
          className="h-1 w-full"
          style={{ backgroundColor: T.border }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Rollout progress toward v1"
        >
          <div
            className="h-full transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: T.accent,
            }}
          />
        </div>
      ) : null}
    </header>
  );
}
