"use client";

import type { ReactNode } from "react";
import ApplyPortalBranding from "@/components/admissions/ApplyPortalBranding";
import {
  ParentThemeProvider,
  useParentTheme,
} from "@/components/school-parent/ParentThemeContext";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type PublicTourGardenShellProps = {
  branding: OrganizationBranding;
  schoolName: string;
  children: ReactNode;
};

function PublicTourGardenShellInner({ branding, schoolName, children }: PublicTourGardenShellProps) {
  const { theme } = useParentTheme();

  return (
    <ParentGardenFrame
      theme={theme}
      className="relative min-h-dvh bg-[var(--sf-cream)] text-[var(--sf-ink)]"
    >
      {/* Dot-grid paper behind the header, fading out down the page. */}
      <div
        className="sf-grid pointer-events-none absolute inset-x-0 top-0 h-[min(520px,70vh)] opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto w-full min-w-0 max-w-[1120px] px-4 pb-16 pt-6 sm:px-8 sm:pb-20 sm:pt-8 lg:px-10">
        <div className="mb-8 flex justify-center sm:mb-10 lg:justify-start">
          <div className="inline-flex min-w-0 max-w-full items-center rounded-full border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)]/90 px-4 py-1.5 shadow-[0_3px_0_0_rgba(43,36,29,0.06)] backdrop-blur-sm">
            <ApplyPortalBranding
              branding={branding}
              schoolName={schoolName}
              platformHomeHref="/"
              schoolLogoClassName="h-8 w-auto max-w-[min(200px,45vw)] object-contain sm:h-9"
            />
          </div>
        </div>
        {children}
      </div>
    </ParentGardenFrame>
  );
}

/**
 * Garden page frame for the public tour booking page. School-branded:
 * `ParentGardenFrame` maps the school accent onto `--sf-clay*`, so nothing
 * here shows MudKitchen clay. Skill: `mudkitchen-garden-design` (in-app.md).
 */
export default function PublicTourGardenShell({
  branding,
  schoolName,
  children,
}: PublicTourGardenShellProps) {
  return (
    <ParentThemeProvider branding={branding}>
      <PublicTourGardenShellInner branding={branding} schoolName={schoolName}>
        {children}
      </PublicTourGardenShellInner>
    </ParentThemeProvider>
  );
}
