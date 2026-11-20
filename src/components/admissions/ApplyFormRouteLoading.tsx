"use client";

import { createContext, useContext, type ReactNode } from "react";
import AuthGatePromoColumn from "@/components/admissions/AuthGatePromoColumn";
import ApplyAuthGardenFrame, {
  APPLY_AUTH_CARD,
} from "@/components/admissions/garden/ApplyAuthGardenFrame";
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

function Bar({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-[var(--sf-ink)]/[0.07] ${className}`}
      aria-hidden
    />
  );
}

/** Placeholder for one "Create an account" / "Log in" option row. */
function OptionRowSkeleton() {
  return (
    <div
      className="flex w-full items-center gap-4 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-4"
      aria-hidden
    >
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-[var(--sf-ink)]/[0.07]" />
      <div className="min-w-0 flex-1 space-y-2">
        <Bar className="h-4 w-2/5" />
        <Bar className="h-3 w-4/5" />
      </div>
    </div>
  );
}

/**
 * Route / dynamic-import skeleton for the apply sign-in gate: the same Garden
 * frame, card and option rows as `ApplicationAuthGate`'s first step, so the
 * swap doesn't jump. Works without branding (route `loading.tsx`), in which
 * case it renders a neutral Garden scope.
 */
export default function ApplyFormRouteLoading({
  label = "Loading application form",
  branding: brandingProp,
}: ApplyFormRouteLoadingProps) {
  const brandingFromContext = useContext(ApplyFormRouteLoadingBrandingContext);
  const branding = brandingProp ?? brandingFromContext;

  return (
    <ApplyAuthGardenFrame branding={branding} aside={<AuthGatePromoColumn immediate />}>
      <div
        className={APPLY_AUTH_CARD}
        aria-busy="true"
        aria-label={label}
        role="status"
      >
        <Bar className="h-3 w-32" />
        <Bar className="mt-3 h-8 w-4/5 max-w-xs" />
        <div className="mt-4 space-y-2">
          <Bar className="h-4 w-full" />
          <Bar className="h-4 w-11/12" />
        </div>
        <div className="mt-6 space-y-3">
          <OptionRowSkeleton />
          <OptionRowSkeleton />
        </div>
      </div>
    </ApplyAuthGardenFrame>
  );
}
