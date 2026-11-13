"use client";

import Link from "next/link";
import { useId, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { parseEventDate } from "@/lib/committees/calendar-utils";
import { getFeatureIcon } from "@/lib/organization-settings/icon-registry";
import type { ParentQuickAction } from "@/lib/organization-settings/parent-home";
import type { OrganizationEvent } from "@/lib/school-events/types";
import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";
import { GCountUp, PORTAL_EASE, gFade } from "./motion";

/*
 * Parent Garden UI kit: Garden materials at portal density.
 * Everything here must render inside <ParentGardenFrame>.
 * Rules and recipes: `.agents/skills/parent-portal-garden-design/SKILL.md`.
 */

/* ------------------------------------------------------------------ */
/* Class constants (literal strings so Tailwind generates them)        */
/* ------------------------------------------------------------------ */

/** Springy CSS hover from the Garden kit. */
export const SPRINGY = "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]";

/** Focus ring in the school accent (mapped onto --sf-clay). */
export const G_FOCUS =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sf-cream)] focus-visible:ring-[var(--sf-clay)]/35";

/** Pastel paper tints for note tiles, icon chips, quick links. */
export const NOTE_TINTS = [
  "bg-[var(--sf-butter)]",
  "bg-[var(--sf-sky)]",
  "bg-[var(--sf-lav)]",
  "bg-[var(--sf-mint)]",
  "bg-[var(--sf-peach)]",
] as const;

/** Photo-fallback backgrounds (initials). */
export const PANEL_TINTS = [
  "bg-[var(--sf-sky)]",
  "bg-[var(--sf-mint)]",
  "bg-[var(--sf-lav)]",
  "bg-[var(--sf-butter)]",
  "bg-[var(--sf-peach)]",
] as const;

export const TAPE_COLORS = [
  "var(--sf-butter)",
  "var(--sf-mint)",
  "var(--sf-sky)",
  "var(--sf-lav)",
  "var(--sf-peach)",
] as const;

/** Primary action: the ONE toy button per view (ink border + hard shadow, school accent). */
export const gBtnPopSm = `inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-[var(--sf-ink)] bg-[var(--sf-clay)] px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_4px_0_0_var(--sf-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_0_0_var(--sf-ink)] active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--sf-ink)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${G_FOCUS}`;
/** Larger primary for a page-level hero action (e.g. "Pay now"). */
export const gBtnPop = `inline-flex items-center justify-center gap-2 rounded-full border-2 border-[var(--sf-ink)] bg-[var(--sf-clay)] px-6 py-3 text-[15px] font-extrabold text-white shadow-[0_5px_0_0_var(--sf-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_7px_0_0_var(--sf-ink)] active:translate-y-1 active:shadow-[0_1px_0_0_var(--sf-ink)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${G_FOCUS}`;
/** Secondary action: calm outline, no hard shadow. */
export const gBtnOutlineSm = `inline-flex items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[var(--sf-ink)]/25 bg-white px-4 py-2.5 text-sm font-extrabold text-[var(--sf-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${G_FOCUS}`;
/** Action on the dark accent card. */
export const gBtnButterSm = `inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--sf-butter)] px-4 py-2.5 text-sm font-extrabold text-[var(--sf-ink)] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-butter)]/60`;
/** Toy pill on a solid accent surface (white face, ink border). */
export const gBtnOnAccent = `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border-2 border-[var(--sf-ink)] bg-white px-4 py-2.5 text-sm font-extrabold text-[var(--sf-ink)] shadow-[0_4px_0_0_var(--sf-ink)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_5px_0_0_var(--sf-ink)]`;
/** Inline text link / card-header action. */
export const gLinkSm = `inline-flex items-center gap-1 rounded-md text-sm font-extrabold text-[var(--sf-clay-deep)] hover:underline hover:decoration-2 hover:underline-offset-4 ${G_FOCUS}`;

/* ------------------------------------------------------------------ */
/* Structure                                                          */
/* ------------------------------------------------------------------ */

/** Uppercase card kicker. */
export function GKicker({ children, light = false, className = "" }: { children: ReactNode; light?: boolean; className?: string }) {
  return (
    <p className={`m-0 text-[11px] font-extrabold uppercase tracking-[0.18em] ${light ? "text-white/65" : "text-[var(--sf-soft)]"} ${className}`}>
      {children}
    </p>
  );
}

const CARD_TONES = {
  white: "bg-white border-[var(--sf-ink)]/12",
  paper: "bg-[var(--sf-paper)] border-[var(--sf-ink)]/12",
  dark: "bg-[var(--sf-clay-deep)] border-transparent text-white",
} as const;
export type GCardTone = keyof typeof CARD_TONES;

/**
 * The one card shell for every parent page: soft border + small hard shadow,
 * never tilted. Header = kicker + sf-display h2 + optional right-side action.
 * Use tone="dark" for at most ONE card per page.
 */
export function GCard({
  kicker,
  title,
  action,
  children,
  className = "",
  bodyClassName = "",
  tone = "white",
  id,
  index = 0,
  headingLevel = "h2",
  "data-testid": testId,
}: {
  kicker?: ReactNode;
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  tone?: GCardTone;
  id?: string;
  /** Stagger position for the entrance fade. */
  index?: number;
  headingLevel?: "h2" | "h3";
  "data-testid"?: string;
}) {
  const reduce = useReducedMotion() === true;
  const titleId = useId();
  const dark = tone === "dark";
  const Heading = headingLevel;
  return (
    <motion.section
      {...gFade(index, reduce)}
      id={id}
      data-testid={testId}
      aria-labelledby={title ? titleId : undefined}
      className={`relative flex min-w-0 scroll-mt-6 flex-col rounded-[24px] border-[1.5px] p-5 shadow-[0_3px_0_0_rgba(43,36,29,0.08)] sm:p-6 ${CARD_TONES[tone]} ${className}`}
    >
      {kicker || title || action ? (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
          <div className="min-w-0">
            {kicker ? <GKicker light={dark}>{kicker}</GKicker> : null}
            {title ? (
              <Heading id={titleId} className={`sf-display m-0 mt-1 text-[1.4rem] leading-[1.05] ${dark ? "text-white" : "text-[var(--sf-ink)]"}`}>
                {title}
              </Heading>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={`flex min-h-0 flex-1 flex-col ${bodyClassName}`}>{children}</div>
    </motion.section>
  );
}

/** Small pastel note with a tape strip: flat (no tilt), lifts on hover; a link when given href. */
export function GNoteTile({
  tint,
  href,
  onClick,
  tape = true,
  children,
  className = "",
  tapeColor = "rgba(255,255,255,0.75)",
  "data-testid": testId,
}: {
  tint: string;
  href?: string;
  onClick?: () => void;
  tape?: boolean;
  children: ReactNode;
  className?: string;
  tapeColor?: string;
  "data-testid"?: string;
}) {
  const cls = `group relative flex h-full w-full flex-col rounded-[10px] p-4 pt-5 text-left shadow-[0_10px_20px_-14px_rgba(43,36,29,0.55)] ${tint} ${className}`;
  const interactive = `hover:-translate-y-0.5 hover:shadow-[0_16px_26px_-16px_rgba(43,36,29,0.6)] ${SPRINGY} ${G_FOCUS}`;
  const tapeEl = tape ? (
    <span
      aria-hidden="true"
      className="absolute left-1/2 top-0 h-3.5 w-12 -translate-x-1/2 -translate-y-1/2 rotate-2 rounded-sm"
      style={{ background: tapeColor }}
    />
  ) : null;
  if (href) {
    return (
      <Link href={href} data-testid={testId} className={`${cls} ${interactive}`}>
        {tapeEl}
        {children}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} data-testid={testId} className={`${cls} ${interactive}`}>
        {tapeEl}
        {children}
      </button>
    );
  }
  return (
    <div data-testid={testId} className={cls}>
      {tapeEl}
      {children}
    </div>
  );
}

/** Icon in a white circle with an ink ring (Garden icon treatment). */
export function GIcon({ children, size = "md", className = "" }: { children: ReactNode; size?: "sm" | "md" | "lg"; className?: string }) {
  const box =
    size === "lg"
      ? "h-14 w-14 [&_svg]:h-6 [&_svg]:w-6"
      : size === "sm"
        ? "h-8 w-8 [&_svg]:h-4 [&_svg]:w-4"
        : "h-11 w-11 [&_svg]:h-5 [&_svg]:w-5";
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-white text-[var(--sf-clay-deep)] ring-2 ring-[var(--sf-ink)] [&_svg]:!text-[var(--sf-clay-deep)] [&_svg]:[stroke-width:2.4] ${box} ${className}`}
    >
      {children}
    </span>
  );
}

/** Garden skeleton block for deferred content. */
export function GSkeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[24px] bg-[var(--sf-ink)]/[0.06] ${className}`} aria-hidden="true" />;
}

/* ------------------------------------------------------------------ */
/* Data pieces                                                        */
/* ------------------------------------------------------------------ */

/** Toy-bordered progress bar (ink outline, accent fill; forest when done). */
export function GProgress({
  value,
  total,
  label,
  done = false,
  className = "",
}: {
  value: number;
  total: number;
  label: string;
  done?: boolean;
  className?: string;
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
      className={`h-2.5 w-full overflow-hidden rounded-full border-[1.5px] border-[var(--sf-ink)] bg-white ${className}`}
    >
      <motion.div
        className={`h-full ${done ? "bg-[var(--sf-forest)]" : "bg-[var(--sf-clay)]"}`}
        initial={reduce ? false : { width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: PORTAL_EASE, delay: 0.2 }}
      />
    </div>
  );
}

const CHIP_TONES = {
  success: "bg-[var(--sf-mint)] text-[var(--sf-forest)]",
  warning: "bg-[var(--sf-butter)] text-[#6b4f00]",
  alert: "bg-[var(--sf-peach)] text-[var(--sf-clay-deep)]",
  info: "bg-[var(--sf-sky)] text-[#24507a]",
  neutral: "bg-[var(--sf-ink)]/[0.06] text-[var(--sf-ink)]/75",
} as const;
export type GChipTone = keyof typeof CHIP_TONES;

/** Status / count chip (replaces ParentChip inside Garden pages). */
export function GChip({ tone, children, className = "" }: { tone: GChipTone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold ${CHIP_TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}

/** Enrollment status chip for a child. */
export function StatusChip({ child }: { child: FamilyChildOverview }) {
  return <GChip tone={child.isEnrolled ? "success" : "info"}>● {child.statusLabel}</GChip>;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** A child's real photo (or initials on a pastel) filling its box. */
export function ChildPhoto({
  child,
  index,
  className = "",
  textClass = "text-4xl",
}: {
  child: FamilyChildOverview;
  index: number;
  className?: string;
  textClass?: string;
}) {
  if (child.profilePhotoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={child.profilePhotoUrl}
        alt={child.studentName}
        className={`h-full w-full object-cover ${className}`}
        loading="lazy"
      />
    );
  }
  return (
    <div
      className={`flex h-full w-full items-center justify-center ${PANEL_TINTS[index % PANEL_TINTS.length]} ${className}`}
      role="img"
      aria-label={child.studentName}
    >
      <span className={`sf-display text-[var(--sf-ink)]/70 ${textClass}`}>{initials(child.studentName)}</span>
    </div>
  );
}

/** Small polaroid thumbnail for a child (a slight tilt is fine: it's a photo, not data). */
export function ChildThumb({
  child,
  index,
  size = "md",
  tilt = 0,
}: {
  child: FamilyChildOverview;
  index: number;
  size?: "sm" | "md" | "lg";
  tilt?: number;
}) {
  const box = size === "lg" ? "w-24" : size === "sm" ? "w-12" : "w-16";
  return (
    <span className={`sf-polaroid relative block shrink-0 !p-1 !pb-1.5 ${box}`} style={{ rotate: `${tilt}deg` }}>
      <span className="relative block aspect-square overflow-hidden rounded-[3px]">
        <ChildPhoto child={child} index={index} textClass={size === "lg" ? "text-3xl" : "text-lg"} />
      </span>
    </span>
  );
}

/** Postage-stamp date for an event (month / day / weekday). */
export function DateStamp({
  event,
  className = "",
  dark = false,
  size = "md",
}: {
  event: OrganizationEvent;
  className?: string;
  dark?: boolean;
  size?: "sm" | "md";
}) {
  const d = parseEventDate(event.date);
  const sm = size === "sm";
  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed ${sm ? "w-14 px-1 py-1.5" : "px-3 py-2"} ${
        dark ? "border-white/40 text-white" : "border-[var(--sf-ink)]/25 text-[var(--sf-ink)]"
      } ${className}`}
    >
      <span className={`text-[11px] font-extrabold uppercase tracking-[0.2em] ${dark ? "text-[var(--sf-butter)]" : "text-[var(--sf-clay-deep)]"}`}>
        {d.toLocaleDateString("en-US", { month: "short" })}
      </span>
      <span className={`sf-display leading-none ${sm ? "text-[1.6rem]" : "text-[2.6rem]"}`}>{d.getDate()}</span>
      <span className={`font-bold opacity-75 ${sm ? "text-[10px]" : "text-[11px]"}`}>
        {d.toLocaleDateString("en-US", { weekday: "short" })}
      </span>
    </div>
  );
}

/** "Friday, Nov 14 · 3:00 PM" (time omitted for all-day events). */
export function eventWhen(event: OrganizationEvent): string {
  const date = parseEventDate(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  return !event.isAllDay && event.time ? `${date} · ${event.time}` : date;
}

/** Feature shortcuts as a calm icon grid (no tilt). */
export function QuickLinks({
  actions,
  max = 6,
  columns = "grid-cols-2",
}: {
  actions: ParentQuickAction[];
  max?: number;
  columns?: string;
}) {
  const visible = actions.filter((a) => a.enabled).slice(0, max);
  if (visible.length === 0) return null;
  return (
    <ul className={`grid gap-2 ${columns}`}>
      {visible.map((action, i) => {
        const Icon = getFeatureIcon(action.iconSlug);
        return (
          <li key={action.key}>
            <Link
              href={action.href}
              className={`flex items-center gap-2.5 rounded-2xl border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] px-3 py-2.5 text-sm font-extrabold text-[var(--sf-ink)] hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/30 hover:bg-white ${SPRINGY} ${G_FOCUS}`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${NOTE_TINTS[i % NOTE_TINTS.length]}`} aria-hidden="true">
                <Icon className="h-4 w-4 text-[var(--sf-ink)]" strokeWidth={2.4} />
              </span>
              <span className="min-w-0 line-clamp-2 leading-tight">{action.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Big-number stat tile (for summary strips). Count-up is the only number animation allowed. */
export function GStatTile({
  value,
  label,
  onClick,
  accent = false,
}: {
  value: number;
  label: string;
  onClick?: () => void;
  accent?: boolean;
}) {
  const inner = (
    <>
      <span className={`sf-display text-[2.8rem] leading-none ${accent ? "text-[var(--sf-clay)]" : "text-[var(--sf-ink)]"}`}>
        <GCountUp value={value} />
      </span>
      <span className="text-[13px] font-extrabold text-[var(--sf-ink)]/70 group-hover:text-[var(--sf-ink)]">{label}</span>
    </>
  );
  const cls = "group flex h-full w-full flex-col items-start gap-1 px-5 py-4 text-left";
  if (!onClick) return <div className={cls}>{inner}</div>;
  return (
    <button type="button" onClick={onClick} className={`${cls} hover:bg-[var(--sf-accent-wash)] ${SPRINGY} ${G_FOCUS} focus-visible:ring-inset`}>
      {inner}
    </button>
  );
}
