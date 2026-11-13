"use client";

import Link from "next/link";
import { useEffect, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { gardenHand } from "@/components/garden/fonts";
import ParentOnboardingSidebar from "@/components/school-parent/ParentOnboardingSidebar";
import ParentDocumentationGuidePanel from "@/components/school-parent/ParentDocumentationGuidePanel";
import ParentCoopFamiliesSection from "@/components/school-parent/ParentCoopFamiliesSection";
import ParentHomeFridayBranchSection from "@/components/school-parent/home/ParentHomeFridayBranchSection";
import { ParentHomeFridayBranchSkeleton } from "@/components/school-parent/home/ParentHomeDeferredSkeleton";
import { parseEventDate } from "@/lib/committees/calendar-utils";
import { getFeatureIcon } from "@/lib/organization-settings/icon-registry";
import { getParentFeatureIconStyle } from "@/lib/organization-settings/parent-feature-icon-styles";
import type { ParentQuickAction } from "@/lib/organization-settings/parent-home";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { OrganizationEvent } from "@/lib/school-events/types";
import type { ParentHomeModel, ParentHomeVariantProps } from "./useParentHomeModel";

export const EASE = [0.16, 1, 0.3, 1] as const;
export const SPRING = { type: "spring", stiffness: 380, damping: 22 } as const;

/** Springy CSS hover from the Garden kit. */
export const SPRINGY = "transition-[transform,box-shadow,background-color] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]";

/** Focus ring standard from in-app.md; pair with `ringVars(theme)`. */
export const FOCUS =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--ring)]/30";

export function ringVars(theme: ParentThemeTokens): CSSProperties {
  return {
    "--ring": theme.primary,
    "--toy": theme.primaryDark,
    "--lift": `${theme.primary}26`,
  } as CSSProperties;
}

/** Soft dot-grid paper, used behind the page canvas. */
export const DOT_GRID: CSSProperties = {
  backgroundImage:
    "radial-gradient(circle, rgba(40,57,67,0.075) 1px, transparent 1.3px)",
  backgroundSize: "22px 22px",
};

export function fadeProps(index: number, reduce: boolean) {
  if (reduce) return { initial: false as const };
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.05 + index * 0.06, duration: 0.4, ease: EASE },
  };
}

export function inViewProps(reduce: boolean) {
  if (reduce) return { initial: false as const };
  return {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.45, ease: EASE },
  };
}

/** Hand-drawn check that draws itself on mount (renders drawn under reduced motion). */
export function HomeLabTick({
  color,
  size = 18,
  delay = 0,
  strokeWidth = 3,
}: {
  color: string;
  size?: number;
  delay?: number;
  strokeWidth?: number;
}) {
  const reduce = useReducedMotion() === true;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <motion.path
        d="M4.5 12.8c1.9 1.4 3.4 3 4.6 4.9C11.6 12.3 15.2 8.1 19.8 5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay, duration: 0.55, ease: "easeOut" }}
      />
    </svg>
  );
}

/** Ring that fills to `done / total`; the label inside stays readable without motion. */
export function HomeLabProgressRing({
  done,
  total,
  color,
  track,
  size = 64,
  children,
}: {
  done: number;
  total: number;
  color: string;
  track: string;
  size?: number;
  children?: ReactNode;
}) {
  const reduce = useReducedMotion() === true;
  const ratio = total > 0 ? Math.min(1, done / total) : 0;
  const r = 15.5;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="18" cy="18" r={r} fill="none" stroke={track} strokeWidth="4" />
        <motion.circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1 1"
          initial={reduce ? false : { strokeDashoffset: 1 }}
          animate={{ strokeDashoffset: 1 - ratio }}
          transition={{ duration: 1, ease: EASE, delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

/** Thin progress bar for a child's enrollment checklist. */
export function HomeLabBar({
  value,
  total,
  color,
  track,
  label,
}: {
  value: number;
  total: number;
  color: string;
  track: string;
  label: string;
}) {
  const reduce = useReducedMotion() === true;
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={value}
      aria-label={label}
      className="h-2 w-full overflow-hidden rounded-full"
      style={{ backgroundColor: track }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color, width: `${pct}%`, transformOrigin: "left" }}
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
      />
    </div>
  );
}

/** One decorative handwritten line (Garden). Never factual, always aria-hidden. */
export function HomeLabHand({
  children,
  color,
  className = "",
}: {
  children: ReactNode;
  color: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`${gardenHand.className} block text-[22px] leading-none ${className}`}
      style={{ color }}
    >
      {children}
    </span>
  );
}

/**
 * Toy-depth primary action: 2px ink border + hard offset shadow in the school's
 * dark accent. Lifts on hover, presses on click. Only one per screen.
 */
export function ToyLink({
  theme,
  href,
  children,
  className = "",
}: {
  theme: ParentThemeTokens;
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center gap-2 rounded-full border-2 px-5 py-3 text-sm font-bold shadow-[0_5px_0_0_var(--toy)] hover:-translate-y-0.5 hover:shadow-[0_7px_0_0_var(--toy)] active:translate-y-1 active:shadow-[0_1px_0_0_var(--toy)] ${SPRINGY} ${FOCUS} ${className}`}
      style={{
        ...ringVars(theme),
        backgroundColor: theme.primary,
        borderColor: theme.ink,
        color: theme.white,
      }}
    >
      {children}
      <ArrowRight
        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

/** Square date stamp for an event (month over day). */
export function EventDateTile({
  theme,
  event,
  size = "md",
}: {
  theme: ParentThemeTokens;
  event: OrganizationEvent;
  size?: "sm" | "md";
}) {
  const date = parseEventDate(event.date);
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  const box = size === "sm" ? "h-11 w-11" : "h-14 w-14";
  return (
    <div
      className={`${box} flex shrink-0 flex-col items-center justify-center rounded-[14px] border`}
      style={{ backgroundColor: theme.white, borderColor: theme.line }}
      aria-hidden="true"
    >
      <span
        className="text-[10px] font-extrabold uppercase tracking-[0.08em]"
        style={{ color: theme.primary }}
      >
        {month}
      </span>
      <span
        className={`${size === "sm" ? "text-lg" : "text-[22px]"} font-semibold leading-none`}
        style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
      >
        {day}
      </span>
    </div>
  );
}

export function eventWhenLabel(event: OrganizationEvent): string {
  const date = parseEventDate(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  return !event.isAllDay && event.time ? `${date} · ${event.time}` : date;
}

/** Feature shortcuts built from the school's enabled parent nav. */
export function QuickLinkGrid({
  theme,
  actions,
  max = 6,
  columns = "grid-cols-2",
}: {
  theme: ParentThemeTokens;
  actions: ParentQuickAction[];
  max?: number;
  columns?: string;
}) {
  const reduce = useReducedMotion() === true;
  const visible = actions.filter((a) => a.enabled).slice(0, max);
  if (visible.length === 0) return null;
  return (
    <ul className={`grid ${columns} gap-2`}>
      {visible.map((action) => {
        const Icon = getFeatureIcon(action.iconSlug);
        const { iconBg, iconColor } = getParentFeatureIconStyle(action.iconSlug);
        return (
          <li key={action.key}>
            <motion.div whileHover={reduce ? undefined : { y: -2 }} transition={SPRING}>
              <Link
                href={action.href}
                className={`flex items-center gap-2.5 rounded-[14px] border px-3 py-2.5 text-[13px] font-semibold ${SPRINGY} hover:shadow-[0_8px_20px_-12px_var(--lift)] ${FOCUS}`}
                style={{
                  ...ringVars(theme),
                  backgroundColor: theme.white,
                  borderColor: theme.line,
                  color: theme.ink,
                }}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ${iconBg}`}
                >
                  <Icon className={`h-4 w-4 ${iconColor}`} strokeWidth={2.3} aria-hidden="true" />
                </span>
                <span className="min-w-0 truncate">{action.label}</span>
              </Link>
            </motion.div>
          </li>
        );
      })}
    </ul>
  );
}

/** Small confetti burst in the school's accent; skipped under reduced motion. */
export function useCelebrate(active: boolean, theme: ParentThemeTokens) {
  const reduce = useReducedMotion() === true;
  useEffect(() => {
    if (!active || reduce) return;
    const key = "home-lab-celebrated";
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage unavailable: still celebrate once per mount.
    }
    let cancelled = false;
    void import("canvas-confetti").then(({ default: confetti }) => {
      if (cancelled) return;
      confetti({
        particleCount: 70,
        spread: 70,
        startVelocity: 32,
        origin: { y: 0.35 },
        colors: [theme.primary, theme.primaryLight, theme.sun, theme.sage, "#ffffff"],
        disableForReducedMotion: true,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [active, reduce, theme]);
}

/** Drawers every variant shares: the to-do sidebar and the how-to guide panel. */
export function HomeLabOverlays({
  model,
  onboardingItems,
}: {
  model: ParentHomeModel;
  onboardingItems: ParentHomeVariantProps["onboardingItems"];
}) {
  return (
    <>
      <ParentOnboardingSidebar
        C={model.adminCompat}
        theme={model.theme}
        open={model.onboardingOpen}
        items={onboardingItems ?? []}
        attentionItems={model.portalAttentionItems}
        onClose={model.closeTodos}
      />
      <ParentDocumentationGuidePanel
        theme={model.theme}
        guide={model.activeGuide}
        open={model.activeGuide != null}
        onClose={model.closeGuide}
      />
    </>
  );
}

/** Friday Branch + co-op families, with the same gating as the live home. */
export function HomeLabProgramSections({
  model,
  props,
}: {
  model: ParentHomeModel;
  props: ParentHomeVariantProps;
}) {
  const {
    organizationId,
    schoolSlug,
    familyId,
    contentDeferred = false,
    previewMode = false,
    parentNavBasePath,
    fridayBranchHome = null,
    coopModeEnabled = false,
    programPortalLabel,
    coopFamilies = [],
    programId,
    schoolName,
  } = props;
  return (
    <>
      {model.fridayBranchHomeEnabled && organizationId ? (
        contentDeferred ? (
          <ParentHomeFridayBranchSkeleton theme={model.theme} />
        ) : fridayBranchHome && fridayBranchHome.blocks.length > 0 ? (
          <ParentHomeFridayBranchSection
            theme={model.theme}
            organizationId={organizationId}
            schoolSlug={schoolSlug}
            initialBundle={fridayBranchHome}
            previewMode={previewMode}
            previewFamilyId={previewMode ? familyId : undefined}
            parentNavBasePath={parentNavBasePath}
          />
        ) : null
      ) : null}
      {coopModeEnabled && programPortalLabel ? (
        <ParentCoopFamiliesSection
          programLabel={programPortalLabel}
          families={coopFamilies}
          organizationId={organizationId}
          programId={programId}
          schoolName={schoolName}
          messagesHref={model.messagesHref}
          messagesEnabled={model.messagesEnabled}
          previewMode={previewMode}
          contentDeferred={contentDeferred}
        />
      ) : null}
    </>
  );
}
