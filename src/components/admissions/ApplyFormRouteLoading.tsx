"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import AuthGatePromoColumn from "@/components/admissions/AuthGatePromoColumn";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

const ApplyFormRouteLoadingBrandingContext = createContext<
  OrganizationBranding | undefined
>(undefined);

export function ApplyFormRouteLoadingBrandingProvider({
  branding,
  children,
}: {
  branding: OrganizationBranding;
  children: ReactNode;
}) {
  return (
    <ApplyFormRouteLoadingBrandingContext.Provider value={branding}>
      {children}
    </ApplyFormRouteLoadingBrandingContext.Provider>
  );
}

type ApplyFormRouteLoadingProps = {
  label?: string;
  branding?: OrganizationBranding;
};

function NeutralPulse({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-neutral-200/80 ${className}`}
      aria-hidden
    />
  );
}

function BrandedPulse({
  className,
  C,
  rounded = "md",
}: {
  className: string;
  C: AdminThemeTokens;
  rounded?: "md" | "xl";
}) {
  return (
    <div
      className={`animate-pulse opacity-50 ${rounded === "xl" ? "rounded-xl" : "rounded-md"} ${className}`}
      style={{ backgroundColor: C.border }}
      aria-hidden
    />
  );
}

function ChoiceCardSkeleton({ C }: { C: AdminThemeTokens }) {
  return (
    <div
      className="flex min-h-[76px] w-full animate-pulse rounded-xl border opacity-60 sm:min-h-[84px]"
      style={{
        borderColor: C.border,
        backgroundColor: C.surface,
      }}
      aria-hidden
    />
  );
}

export default function ApplyFormRouteLoading({
  label = "Loading application form",
  branding: brandingProp,
}: ApplyFormRouteLoadingProps) {
  const brandingFromContext = useContext(ApplyFormRouteLoadingBrandingContext);
  const branding = brandingProp ?? brandingFromContext;

  const C = useMemo(
    () => (branding ? buildAdminThemeTokens(branding) : null),
    [branding],
  );
  const pageBg = branding?.colors.bg ?? "#fafafa";
  const textPrimary = C?.textPrimary ?? "#171717";

  return (
    <div className="flex min-h-dvh min-w-0 flex-col lg:flex-row">
      <AuthGatePromoColumn immediate />

      <div
        className="relative flex min-h-0 min-w-0 flex-1 flex-col lg:min-h-dvh"
        style={{ backgroundColor: pageBg, color: textPrimary }}
        aria-busy="true"
        aria-label={label}
        role="status"
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 pb-20 sm:px-6 sm:py-8 sm:pb-24 lg:flex lg:items-center lg:justify-center lg:py-12">
          <div className="mx-auto w-full min-w-0 max-w-md">
            <div className="mb-8">
              {C ? (
                <BrandedPulse className="h-8 w-40 max-w-[200px]" C={C} />
              ) : (
                <NeutralPulse className="h-8 w-40 max-w-[200px]" />
              )}
            </div>

            <div className="mb-8 space-y-3">
              {C ? (
                <>
                  <BrandedPulse className="h-8 w-4/5 max-w-xs" C={C} />
                  <BrandedPulse className="h-4 w-full" C={C} />
                  <BrandedPulse className="h-4 w-11/12" C={C} />
                </>
              ) : (
                <>
                  <NeutralPulse className="h-8 w-4/5 max-w-xs" />
                  <NeutralPulse className="h-4 w-full" />
                  <NeutralPulse className="h-4 w-11/12" />
                </>
              )}
            </div>

            <div className="space-y-3">
              {C ? (
                <>
                  <ChoiceCardSkeleton C={C} />
                  <ChoiceCardSkeleton C={C} />
                </>
              ) : (
                <>
                  <NeutralPulse className="min-h-[76px] w-full rounded-xl sm:min-h-[84px]" />
                  <NeutralPulse className="min-h-[76px] w-full rounded-xl sm:min-h-[84px]" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
