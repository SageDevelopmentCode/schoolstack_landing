"use client";

import { useMemo, type ReactNode } from "react";
import ApplyPortalBranding from "@/components/admissions/ApplyPortalBranding";
import ParentGardenFrame, {
  GARDEN_SCOPE_CLASS,
} from "@/components/school-parent/garden/ParentGardenFrame";
import { buildParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

/** Card shell for the gate's form: Garden card, never tilted. */
export const APPLY_AUTH_CARD =
  "relative w-full min-w-0 rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-5 shadow-[0_3px_0_0_rgba(43,36,29,0.08)] sm:p-7";

const PAGE_CLASS = "relative min-h-dvh bg-[var(--sf-cream)] text-[var(--sf-ink)]";

function Backdrop() {
  return (
    <div
      className="sf-grid pointer-events-none absolute inset-x-0 top-0 h-[min(520px,70vh)] opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent)]"
      aria-hidden
    />
  );
}

/** "MudKitchen | School" lockup in a paper pill (same as the tour page). */
function BrandPill({
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
        schoolLogoClassName="h-8 w-auto max-w-[min(200px,45vw)] object-contain sm:h-9"
      />
    </div>
  );
}

/** Pill-shaped placeholder for the brand lockup while branding loads. */
function BrandPillSkeleton() {
  return (
    <div
      className="h-[52px] w-[min(260px,70vw)] animate-pulse rounded-full bg-[var(--sf-ink)]/[0.06]"
      aria-hidden
    />
  );
}

type ApplyAuthGardenFrameProps = {
  /** Without branding (route `loading.tsx`) the frame renders a neutral Garden scope. */
  branding?: OrganizationBranding;
  schoolName?: string;
  /** Desktop-only side column (the MudKitchen promo note). */
  aside?: ReactNode;
  children: ReactNode;
};

function FrameBody({
  branding,
  schoolName,
  aside,
  children,
}: ApplyAuthGardenFrameProps) {
  return (
    <>
      <Backdrop />
      <div className="relative mx-auto flex min-h-dvh w-full min-w-0 max-w-[1120px] flex-col px-4 pb-24 pt-5 sm:px-8 sm:pt-7 lg:px-10">
        <div className="mb-6 flex justify-center sm:mb-8 lg:justify-start">
          {branding && schoolName ? (
            <BrandPill branding={branding} schoolName={schoolName} />
          ) : (
            <BrandPillSkeleton />
          )}
        </div>
        <div className="grid flex-1 items-start gap-8 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] lg:items-center lg:gap-12 lg:pb-10">
          <div className="mx-auto w-full min-w-0 max-w-[480px] lg:mx-0">{children}</div>
          {aside}
        </div>
      </div>
    </>
  );
}

/**
 * Garden page frame for the email-code sign-in gate in front of the public
 * application form (and its route loading skeleton). School-branded:
 * `ParentGardenFrame` maps the school accent onto `--sf-clay*`, so nothing
 * here shows MudKitchen clay. Mirrors `PublicTourGardenShell`.
 * Skill: `parent-portal-garden-design` + `mudkitchen-garden-design/in-app.md`.
 */
export default function ApplyAuthGardenFrame(props: ApplyAuthGardenFrameProps) {
  const { branding } = props;
  const theme = useMemo(
    () => (branding ? buildParentThemeTokens(branding) : null),
    [branding],
  );

  if (!theme) {
    return (
      <div className={`${GARDEN_SCOPE_CLASS} w-full overflow-x-clip ${PAGE_CLASS}`}>
        <FrameBody {...props} />
      </div>
    );
  }

  return (
    <ParentGardenFrame theme={theme} className={PAGE_CLASS}>
      <FrameBody {...props} />
    </ParentGardenFrame>
  );
}
