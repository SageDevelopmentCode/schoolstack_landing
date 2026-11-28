"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode, type SyntheticEvent } from "react";
import {
  ADMIN_DEMO_COLORS,
  ADMIN_DEMO_COPY,
  applyAdminDemoRuntime,
  getAdminDemoLogo,
} from "@/components/demo/shared/admin-demo-runtime";
import SchoolAdminBaseline from "@/components/school-admin/SchoolAdminBaseline";
import SchoolAdminStoryShell from "@/components/school-admin/SchoolAdminStoryShell";
import GardenToaster from "@/components/school-parent/garden/GardenToaster";
import type { SchoolAdminDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import {
  DEMO_ADMIN_FEATURES,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
} from "@/data/school-demos/demo-portal-shared";
import { DEFAULT_BRANDING } from "@/lib/organization-settings/catalog";
import {
  buildParentThemeTokens,
  type ParentThemeTokens,
} from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding, OrganizationFeatures } from "@/lib/organization-settings/types";
import type { SchoolAdminUserProfile } from "@/lib/school-admin/access";

export const DEMO_ADMIN_USER: SchoolAdminUserProfile = {
  displayName: "Morgan Ellis",
  email: "demo@mudkitchen.app",
};

export type DemoAdminGardenShellContext = {
  branding: OrganizationBranding;
  theme: ParentThemeTokens;
  schoolName: string;
  /**
   * In-canvas node for dialogs and drawers, so they stay inside a scaled
   * (transformed) demo canvas. `null` until mounted.
   */
  portalHost: HTMLDivElement | null;
};

type DemoAdminGardenShellProps = {
  config: SchoolAdminDemoConfig;
  /** The admin path the sidebar shows as active (nothing navigates). */
  previewPathname: string;
  /** Sidebar features (default: the demo school's). */
  features?: OrganizationFeatures;
  /**
   * Scripted, non-interactive preview (walkthrough steps): the whole frame is
   * `inert` and ignores the pointer. Otherwise the page body takes clicks
   * while the sidebar / top bar stay decorative and no link navigates.
   */
  inert?: boolean;
  /**
   * With `inert`: still scripted (every click is swallowed), but the visitor can
   * scroll the page and drawers. Used by the walkthrough, where a long page must scroll.
   */
  scrollable?: boolean;
  /** Start with the admin sidebar expanded (default) or collapsed to icons. */
  sidebarExpanded?: boolean;
  "data-testid"?: string;
  children: (ctx: DemoAdminGardenShellContext) => ReactNode;
};

const SHELL_ATTR = "data-demo-admin-shell";
const BODY_ATTR = "data-demo-admin-body";
const PORTAL_ATTR = "data-demo-admin-portal";

function buildBranding(): OrganizationBranding {
  const colors = ADMIN_DEMO_COLORS;
  const logo = getAdminDemoLogo();
  return {
    ...DEFAULT_BRANDING,
    colors: {
      ...DEFAULT_BRANDING.colors,
      accent: colors.accent,
      accentDark: colors.accentDark,
      accentBright: colors.accentBright,
      accentLight: colors.accentLight,
      accentGlow: colors.accentGlow,
      secondaryBtnBorder: colors.secondaryBtnBorder,
      clay: colors.clay,
      clayBg: colors.clayBg,
      clayBorder: colors.clayBorder,
    },
    logo: {
      src: logo.src,
      alt: logo.alt,
      width: logo.width ?? 220,
      height: logo.height ?? 52,
    },
  };
}

/*
 * `SchoolAdminBaseline` mounts its own (story) toaster because a demo's real
 * pathname isn't a Garden admin route; sonner then shows every toast twice,
 * stacked. Only the shell's Garden toaster should show.
 */
const HIDE_STORY_TOASTER = `[${SHELL_ATTR}] [data-sonner-toaster]:not(.sf-garden-toaster [data-sonner-toaster]) { display: none !important; }`;

/**
 * The REAL Garden school-admin frame for marketing demos: school branding
 * from the demo config, `SchoolAdminBaseline` in preview mode (sidebar,
 * virtual pathname, no fetches), a Garden toaster, and an in-canvas portal
 * host. Pages render inside via `children(ctx)` and must not touch the
 * network. Used by the walkthrough Admissions steps and the home-page
 * Admin / Marketing demos.
 */
export default function DemoAdminGardenShell({
  config,
  previewPathname,
  features = DEMO_ADMIN_FEATURES,
  inert = false,
  scrollable = false,
  sidebarExpanded = true,
  "data-testid": testId,
  children,
}: DemoAdminGardenShellProps) {
  // Fully frozen (no pointer at all), or scripted but scrollable.
  const frozen = inert && !scrollable;
  const scripted = inert && scrollable;
  const rootRef = useRef<HTMLDivElement>(null);
  const setup = useMemo(() => {
    applyAdminDemoRuntime(config);
    const branding = buildBranding();
    return {
      branding,
      theme: buildParentThemeTokens(branding),
      schoolName: ADMIN_DEMO_COPY.schoolName,
    };
  }, [config]);

  // Dialogs portal here so they stay inside the scaled demo canvas.
  const [portalHost, setPortalHost] = useState<HTMLDivElement | null>(null);

  const ctx = useMemo<DemoAdminGardenShellContext>(
    () => ({ ...setup, portalHost }),
    [portalHost, setup],
  );

  /*
   * Interactive demos: nothing leaves the demo. Links never navigate, and the
   * admin chrome (sidebar, phone top bar) is decorative: its buttons would
   * open panels that fetch. React portals bubble through this handler too, so
   * dialogs rendered to `document.body` are covered.
   */
  const guardClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const inChrome =
      event.currentTarget.contains(target) &&
      !target.closest(`[${BODY_ATTR}], [${PORTAL_ATTR}]`);
    if (inChrome) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (target.closest("a[href]")) event.preventDefault();
  }, []);

  /*
   * Scripted but scrollable: without `inert`, the drawer's and dialog's focus()
   * calls can scroll an overflow-hidden box sideways and shift the layout.
   * Snap any sideways scroll on a box that isn't meant to scroll back to 0.
   */
  useEffect(() => {
    const root = rootRef.current;
    if (!scripted || !root) return;
    const onScroll = (event: Event) => {
      const el = event.target;
      if (!(el instanceof HTMLElement) || el.scrollLeft === 0) return;
      const overflowX = getComputedStyle(el).overflowX;
      if (overflowX === "hidden" || overflowX === "clip") el.scrollLeft = 0;
    };
    root.addEventListener("scroll", onScroll, true);
    return () => root.removeEventListener("scroll", onScroll, true);
  }, [scripted]);

  const swallow = useCallback((event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative h-full w-full overflow-hidden"
      {...{ [SHELL_ATTR]: "" }}
      data-testid={testId}
      // Frozen previews: `inert` makes the drawer's and dialog's focus()
      // calls no-ops, so they can't scroll the walkthrough frame sideways
      // (and keyboard users can't tab into fake rows).
      inert={frozen}
      onClickCapture={frozen ? undefined : scripted ? swallow : guardClick}
      onSubmitCapture={scripted ? swallow : undefined}
    >
      <SchoolAdminStoryShell branding={setup.branding} className="h-full">
        <div
          className={
            frozen ? "pointer-events-none h-full select-none" : scripted ? "h-full select-none" : "h-full"
          }
        >
          <SchoolAdminBaseline
            slug={DEMO_PORTAL_SLUG}
            organizationId={DEMO_PORTAL_ORG_ID}
            schoolName={setup.schoolName}
            branding={setup.branding}
            features={features}
            userProfile={DEMO_ADMIN_USER}
            previewMode
            previewPathname={previewPathname}
            initialSidebarExpanded={sidebarExpanded}
            fillParentHeight
            portalOptions={[]}
            initialMessagesUnreadCount={0}
            initialActivityUnreadCount={0}
          >
            {inert ? children(ctx) : <div {...{ [BODY_ATTR]: "" }} className="contents">{children(ctx)}</div>}
          </SchoolAdminBaseline>
        </div>
      </SchoolAdminStoryShell>
      <div
        ref={setPortalHost}
        {...{ [PORTAL_ATTR]: "" }}
        className={`pointer-events-none absolute inset-0 z-[130] ${
          frozen ? "select-none" : scripted ? "select-none [&>*]:pointer-events-auto" : "[&>*]:pointer-events-auto"
        }`}
      />
      <style>{HIDE_STORY_TOASTER}</style>
      <GardenToaster theme={setup.theme} />
    </div>
  );
}
