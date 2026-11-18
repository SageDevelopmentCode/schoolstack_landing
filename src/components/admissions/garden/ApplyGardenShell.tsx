"use client";

import { useMemo, type ReactNode } from "react";
import ApplyPortalBranding from "@/components/admissions/ApplyPortalBranding";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import { buildParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

/** "MudKitchen | School" lockup on a paper pill (same as the tour page). */
export function ApplyBrandPill({
  branding,
  schoolName,
}: {
  branding: OrganizationBranding;
  schoolName: string;
}) {
  return (
    <div className="inline-flex min-w-0 max-w-full items-center rounded-full border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)]/90 px-4 py-1.5 shadow-[0_3px_0_0_rgba(43,36,29,0.06)] backdrop-blur-sm">
      <ApplyPortalBranding
        branding={branding}
        schoolName={schoolName}
        platformHomeHref="/"
        schoolLogoClassName="h-7 w-auto max-w-[min(200px,45vw)] object-contain sm:h-8"
      />
    </div>
  );
}

/** Faded dot-grid paper behind the top of a Garden family page. */
export function ApplyGardenBackdrop() {
  return (
    <div
      className="sf-grid pointer-events-none absolute inset-x-0 top-0 h-[min(480px,65vh)] opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent)]"
      aria-hidden
    />
  );
}

/**
 * Garden page frame for the family apply form's own states (loading, error,
 * submitted). School-branded: `ParentGardenFrame` maps the school accent onto
 * `--sf-clay*`. The form itself (`ApplicationFormExperience`) draws the same
 * pieces inside its scroll container.
 */
export default function ApplyGardenShell({
  branding,
  schoolName,
  children,
  centered = false,
}: {
  branding: OrganizationBranding;
  schoolName: string;
  children: ReactNode;
  centered?: boolean;
}) {
  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  return (
    <ParentGardenFrame theme={theme} className="relative min-h-dvh bg-[var(--sf-cream)] text-[var(--sf-ink)]">
      <ApplyGardenBackdrop />
      <div className="relative mx-auto flex min-h-dvh w-full min-w-0 max-w-[1120px] flex-col px-4 pb-16 pt-5 sm:px-8 sm:pt-6 lg:px-10">
        <div className="mb-8 flex justify-center sm:mb-10 lg:justify-start">
          <ApplyBrandPill branding={branding} schoolName={schoolName} />
        </div>
        <div className={centered ? "flex flex-1 flex-col items-center justify-center" : ""}>{children}</div>
      </div>
    </ParentGardenFrame>
  );
}
