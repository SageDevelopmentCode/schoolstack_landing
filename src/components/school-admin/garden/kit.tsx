"use client";

import Link from "next/link";
import {
  useId,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Info,
  Loader2,
  RotateCw,
  type LucideIcon,
} from "lucide-react";
import ParentGardenFrame, { ParentGardenScope } from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { PORTAL_EASE, gFade } from "@/components/school-parent/garden/motion";
import {
  GChip,
  GProgress,
  GSkeleton,
  GTabBar,
  G_FOCUS,
  G_INPUT,
  G_LABEL,
  gBtnOutlineSm,
  gBtnPopSm,
  type GTabBarItem,
} from "@/components/school-parent/garden/ui";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  ADMIN_GARDEN_CONTAINER_CLASS,
  useRelativeTime,
} from "@/components/school-admin/dashboard/garden/shared";

import { AdminGardenSkin } from "./skin";

export { LiveDot } from "@/components/school-admin/dashboard/garden/GardenStaffHoursCard";
export {
  ADMIN_GARDEN_CONTAINER_CLASS,
  GardenLoadError,
  GardenPanelSkeleton,
  ROW_INTERACTIVE,
  useRelativeTime,
} from "@/components/school-admin/dashboard/garden/shared";

/*
 * Admin Garden kit for every admin tab after the Dashboard.
 * Rules: `.claude/skills/admin-portal-garden-design/SKILL.md`.
 * Everything here renders inside <AdminGardenPage> (ParentGardenFrame).
 */

/* ------------------------------------------------------------------ */
/* Page frame + header                                                 */
/* ------------------------------------------------------------------ */

/**
 * Frame + container for a Garden admin page. Sheets, drawers and dialogs that
 * aren't portalled go in `overlays` (rendered after the frame).
 */
export function AdminGardenPage({
  theme,
  children,
  overlays,
  className = "",
  containerClassName = "",
  scroll = true,
  skinOverlays = false,
  "data-testid": testId,
}: {
  theme: ParentThemeTokens;
  children: ReactNode;
  overlays?: ReactNode;
  /**
   * Render `overlays` inside the Garden scope + admin skin, so shared story
   * sheets/modals (SchoolAdminSlideOverShell, SchoolAdminModalShell,
   * AdminButton…) take the Garden look. Use once every overlay on the page is
   * skin-aware.
   */
  skinOverlays?: boolean;
  className?: string;
  containerClassName?: string;
  /** Own the vertical scroll (pages rendered in a fixed-height admin pane). */
  scroll?: boolean;
  "data-testid"?: string;
}) {
  const frame = (
    <ParentGardenFrame theme={theme} className={`bg-[var(--sf-cream)] ${className}`}>
      <AdminGardenSkin theme={theme}>
        <div
          className={`sf-admin-garden-skin ${ADMIN_GARDEN_CONTAINER_CLASS} ${containerClassName}`}
          data-testid={testId}
        >
          {children}
        </div>
      </AdminGardenSkin>
    </ParentGardenFrame>
  );
  return (
    <>
      {scroll ? (
        <div className="relative flex h-full min-h-0 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--sf-cream,#FBF7EF)]" data-admin-garden-scroller>
            {frame}
          </div>
        </div>
      ) : (
        frame
      )}
      {skinOverlays && overlays ? (
        <AdminGardenSkin theme={theme}>
          <ParentGardenScope theme={theme} className="contents sf-admin-garden-skin">
            {overlays}
          </ParentGardenScope>
        </AdminGardenSkin>
      ) : (
        overlays
      )}
    </>
  );
}

/**
 * Admin page header: kicker, h1 with one accent word, a status line built
 * only from data, actions (+ optional Refresh with "Updated N min ago") and
 * an optional GTabBar under it.
 */
export function AdminGardenPageHeader({
  kicker,
  title,
  subtitle,
  actions,
  tabs,
  refresh,
  "data-testid": testId,
}: {
  kicker: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  tabs?: {
    items: GTabBarItem[];
    activeKey: string;
    onChange: (key: string) => void;
    ariaLabel: string;
    "data-testid"?: string;
  };
  refresh?: {
    onRefresh: () => void;
    refreshing: boolean;
    lastUpdatedAt: number;
    label: string;
  };
  "data-testid"?: string;
}) {
  return (
    <div className="flex flex-col gap-4" data-testid={testId}>
      <ParentGardenPageHeader
        kicker={kicker}
        title={<span className="text-[1.75rem] sm:text-[2.1rem]">{title}</span>}
        subtitle={subtitle}
        actions={
          actions || refresh ? (
            <>
              {refresh ? <RefreshControl {...refresh} /> : null}
              {actions}
            </>
          ) : undefined
        }
      />
      {tabs && tabs.items.length > 1 ? (
        <GTabBar
          items={tabs.items}
          activeKey={tabs.activeKey}
          onChange={tabs.onChange}
          ariaLabel={tabs.ariaLabel}
          data-testid={tabs["data-testid"]}
        />
      ) : null}
    </div>
  );
}

function RefreshControl({
  onRefresh,
  refreshing,
  lastUpdatedAt,
  label,
}: {
  onRefresh: () => void;
  refreshing: boolean;
  lastUpdatedAt: number;
  label: string;
}) {
  const updated = useRelativeTime(lastUpdatedAt);
  return (
    <div className="flex items-center gap-2">
      <span
        className="hidden text-[12px] font-bold text-[var(--sf-soft)] sm:inline"
        aria-live="polite"
      >
        {refreshing ? "Refreshing…" : `Updated ${updated}`}
      </span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        aria-busy={refreshing || undefined}
        className={`${gBtnOutlineSm} !px-3 !py-2`}
        aria-label={label}
        title={label}
      >
        <RotateCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
        <span className="sm:hidden">Refresh</span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

/** Button label that swaps to a spinner + busy text while pending. */
export function BusyLabel({
  busy,
  busyLabel,
  icon,
  children,
}: {
  busy: boolean;
  busyLabel: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return busy ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      {busyLabel}
    </>
  ) : (
    <>
      {icon}
      {children}
    </>
  );
}

/** Icon-only outline button (row actions, close, more). */
export const gIconBtn = `inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/20 bg-white text-[var(--sf-ink)]/70 transition-all hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/50 hover:text-[var(--sf-ink)] disabled:cursor-not-allowed disabled:opacity-50 ${G_FOCUS}`;

/** Destructive outline button (delete, remove, unpublish). */
export const gBtnDangerSm = `inline-flex items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[#b4412f]/35 bg-white px-4 py-2.5 text-sm font-extrabold text-[#9a3422] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b4412f]/70 hover:bg-[#fdf0ec] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${G_FOCUS}`;

/** Compact outline button for dense rows. */
export const gBtnOutlineXs = `inline-flex items-center justify-center gap-1 rounded-full border-[1.5px] border-[var(--sf-ink)]/20 bg-white px-3 py-1.5 text-[12.5px] font-extrabold text-[var(--sf-ink)] transition-all duration-200 hover:border-[var(--sf-ink)]/45 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${G_FOCUS}`;

/* ------------------------------------------------------------------ */
/* Form fields                                                         */
/* ------------------------------------------------------------------ */

/**
 * Label + control + hint/error. Pass the control as children and wire it to
 * `id` (use `useGardenFieldId`). Errors are inline and announced.
 */
export function GardenField({
  id,
  label,
  hint,
  error,
  required,
  optional,
  counter,
  children,
  className = "",
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  optional?: boolean;
  counter?: { value: number; max: number };
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className={G_LABEL}>
          {label}
          {required ? (
            <span className="ml-0.5 text-[var(--sf-clay-deep)]" aria-hidden>
              *
            </span>
          ) : null}
          {optional ? (
            <span className="ml-1.5 text-[12px] font-bold text-[var(--sf-soft)]">Optional</span>
          ) : null}
        </label>
        {counter ? (
          <span
            className={`text-[11.5px] font-bold tabular-nums ${
              counter.value > counter.max ? "text-[#9a3422]" : "text-[var(--sf-soft)]"
            }`}
          >
            {counter.value}/{counter.max}
          </span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="m-0 mt-1.5 flex items-center gap-1 text-[12.5px] font-bold text-[#9a3422]"
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="m-0 mt-1.5 text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function useGardenFieldId(prefix: string): string {
  const id = useId();
  return `${prefix}-${id.replace(/:/g, "")}`;
}

/** Input class with an error state. */
export function gInputClass(error?: string | null, extra = ""): string {
  return `${G_INPUT} ${error ? "!border-[#b4412f]/60 focus:!ring-[#b4412f]/15" : ""} ${extra}`;
}

export type GardenSelectOption = { value: string; label: string; disabled?: boolean };

/** Native Garden select (counterpart of SchoolAdminSelect). */
export function GardenSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  error,
  className = "",
  ...rest
}: Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> & {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: GardenSelectOption[];
  placeholder?: string;
  error?: string | null;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        data-garden-skip
        className={`${gInputClass(error)} cursor-pointer appearance-none pr-10 ${className}`}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sf-ink)]/55"
      >
        <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** Garden on/off switch with label + optional description. */
export function GardenSwitch({
  checked,
  onChange,
  label,
  description,
  disabled,
  busy,
  id,
  "data-testid": testId,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  busy?: boolean;
  id?: string;
  "data-testid"?: string;
}) {
  const autoId = useId();
  const switchId = id ?? `gsw-${autoId.replace(/:/g, "")}`;
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={switchId} className="min-w-0 cursor-pointer">
        <span className="block text-[14px] font-extrabold text-[var(--sf-ink)]">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
            {description}
          </span>
        ) : null}
      </label>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-busy={busy || undefined}
        disabled={disabled || busy}
        onClick={() => onChange(!checked)}
        data-testid={testId}
        className={`relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 border-[var(--sf-ink)] transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          checked ? "bg-[var(--sf-clay)]" : "bg-[var(--sf-ink)]/10"
        } ${G_FOCUS}`}
      >
        <span
          aria-hidden
          className={`inline-flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)] bg-white shadow-[0_1px_0_0_var(--sf-ink)] transition-transform duration-200 ${
            checked ? "translate-x-[21px]" : "translate-x-[2px]"
          }`}
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin text-[var(--sf-ink)]/60" /> : null}
        </span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Filters                                                             */
/* ------------------------------------------------------------------ */

export type GardenFilterOption = { key: string; label: string; count?: number };

/**
 * Filter chips. Each chip is a toggle button whose accessible name is
 * "Label · N" when it has a count (E2E relies on that name). Zero counts are
 * hidden by the caller.
 */
export function GardenFilterChips({
  options,
  value,
  onChange,
  ariaLabel,
  busy,
  className = "",
}: {
  options: GardenFilterOption[];
  value: string;
  onChange: (key: string) => void;
  ariaLabel: string;
  busy?: boolean;
  className?: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {options.map((option) => {
        const active = option.key === value;
        const text = option.count != null ? `${option.label} · ${option.count}` : option.label;
        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.key)}
            className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-1 text-[13px] font-extrabold transition-all duration-200 ${
              active
                ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white shadow-[0_2px_0_0_var(--sf-ink)]"
                : "border-[var(--sf-ink)]/15 bg-white text-[var(--sf-ink)]/70 hover:border-[var(--sf-ink)]/35 hover:text-[var(--sf-ink)]"
            } ${G_FOCUS}`}
          >
            <span className="sr-only">{text}</span>
            <span aria-hidden className="inline-flex items-center gap-1.5">
              {option.label}
              {option.count != null ? (
                <span
                  className={`rounded-full px-1.5 text-[11.5px] tabular-nums ${
                    active ? "bg-white/25 text-white" : "bg-[var(--sf-ink)]/[0.06] text-[var(--sf-ink)]/70"
                  }`}
                >
                  {option.count}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
      {busy ? (
        <Loader2 className="ml-1 h-4 w-4 animate-spin text-[var(--sf-clay)]" aria-label="Updating" />
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Notices + empty states                                              */
/* ------------------------------------------------------------------ */

const NOTICE_TONES = {
  info: { box: "bg-[var(--sf-sky)]/60 border-[#5b8fc7]/30", icon: Info, iconClass: "text-[#24507a]" },
  success: { box: "bg-[var(--sf-mint)] border-[var(--sf-forest)]/25", icon: CheckCircle2, iconClass: "text-[var(--sf-forest)]" },
  warning: { box: "bg-[var(--sf-butter)]/70 border-[#d9a400]/35", icon: AlertTriangle, iconClass: "text-[#6b4f00]" },
  alert: { box: "bg-[#fdf0ec] border-[#b4412f]/30", icon: AlertTriangle, iconClass: "text-[#9a3422]" },
} as const;

/** Inline banner: what's going on + what to do. */
export function GardenNotice({
  tone = "info",
  title,
  children,
  action,
  icon,
  role,
  className = "",
  "data-testid": testId,
}: {
  tone?: keyof typeof NOTICE_TONES;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  icon?: LucideIcon;
  role?: "status" | "alert";
  className?: string;
  "data-testid"?: string;
}) {
  const config = NOTICE_TONES[tone];
  const Icon = icon ?? config.icon;
  return (
    <div
      role={role}
      data-testid={testId}
      className={`flex flex-col gap-3 rounded-[16px] border-[1.5px] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between ${config.box} ${className}`}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.iconClass}`} aria-hidden />
        <div className="min-w-0 text-[13.5px] font-semibold leading-snug text-[var(--sf-ink)]/85">
          {title ? <p className="m-0 font-extrabold text-[var(--sf-ink)]">{title}</p> : null}
          {children ? <div className={title ? "mt-0.5" : ""}>{children}</div> : null}
        </div>
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

/** Paper empty state: icon chip, existing copy, one CTA. */
export function GardenEmptyState({
  icon: Icon,
  title,
  description,
  action,
  tint = "bg-[var(--sf-butter)]",
  children,
  className = "",
  "data-testid": testId,
}: {
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  tint?: string;
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}) {
  return (
    <div
      data-testid={testId}
      className={`flex flex-col items-start gap-3 rounded-[18px] border-[1.5px] border-dashed border-[var(--sf-ink)]/18 bg-[var(--sf-paper)] p-5 sm:p-6 ${className}`}
    >
      {Icon ? (
        <span
          aria-hidden
          className={`flex h-11 w-11 items-center justify-center rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/15 ${tint}`}
        >
          <Icon className="h-5 w-5 text-[var(--sf-ink)]/75" />
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="m-0 text-[16px] font-extrabold text-[var(--sf-ink)]">{title}</p>
        {description ? (
          <p className="m-0 mt-1 max-w-[56ch] text-[13.5px] font-semibold leading-relaxed text-[var(--sf-soft)]">
            {description}
          </p>
        ) : null}
      </div>
      {children}
      {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Steps                                                               */
/* ------------------------------------------------------------------ */

export type GardenStep = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  status: "done" | "current" | "todo" | "blocked";
  href?: string;
  /** Extra content under the title (live notes, inline CTA). */
  detail?: ReactNode;
  /** Right-hand slot (chip or action). */
  aside?: ReactNode;
};

/**
 * Numbered steps: current step on the accent wash with a "Next" chip, done
 * steps struck through with a check. Rows link when `href` is set.
 */
export function GardenSteps({
  steps,
  progressLabel,
  showProgress = true,
  compactDone = true,
  className = "",
  "data-testid": testId,
}: {
  steps: GardenStep[];
  progressLabel?: string;
  showProgress?: boolean;
  compactDone?: boolean;
  className?: string;
  "data-testid"?: string;
}) {
  const done = steps.filter((step) => step.status === "done").length;
  return (
    <div className={className} data-testid={testId}>
      {showProgress && steps.length > 1 ? (
        <div className="mb-4 flex items-center gap-3">
          <GProgress
            value={done}
            total={steps.length}
            label={progressLabel ?? "Progress"}
            done={done === steps.length}
          />
          <span className="shrink-0 text-[13px] font-extrabold tabular-nums text-[var(--sf-ink)]/70">
            {done}/{steps.length}
          </span>
        </div>
      ) : null}
      <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
        {steps.map((step, i) => {
          const isDone = step.status === "done";
          const current = step.status === "current";
          const blocked = step.status === "blocked";
          const rowClass = `group flex items-start gap-3 rounded-[14px] px-3 py-2.5 no-underline transition-colors ${
            current
              ? "bg-[var(--sf-accent-wash)] ring-[1.5px] ring-[var(--sf-clay)]/30"
              : step.href
                ? "hover:bg-[var(--sf-ink)]/[0.03]"
                : ""
          } ${G_FOCUS} focus-visible:ring-inset`;
          const body = (
            <>
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[12px] font-extrabold tabular-nums ${
                  isDone
                    ? "border-[var(--sf-forest)] bg-[var(--sf-forest)] text-white"
                    : current
                      ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white"
                      : blocked
                        ? "border-[#b4412f]/50 bg-[#fdf0ec] text-[#9a3422]"
                        : "border-[var(--sf-ink)]/25 bg-white text-[var(--sf-ink)]/60"
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-[14px] font-extrabold leading-snug ${
                    isDone ? "text-[var(--sf-ink)]/55 line-through decoration-[var(--sf-ink)]/25" : "text-[var(--sf-ink)]"
                  }`}
                >
                  {step.title}
                </span>
                {step.description && !(isDone && compactDone) ? (
                  <span className="mt-0.5 block text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
                    {step.description}
                  </span>
                ) : null}
                {step.detail ? <span className="mt-2 block">{step.detail}</span> : null}
              </span>
              {step.aside ??
                (isDone ? (
                  <span className="sr-only">Done</span>
                ) : current ? (
                  <GChip tone="alert" className="mt-0.5">Next</GChip>
                ) : null)}
            </>
          );
          return (
            <li key={step.id}>
              {step.href ? (
                <Link href={step.href} className={rowClass} aria-current={current ? "step" : undefined}>
                  {body}
                </Link>
              ) : (
                <div className={rowClass} aria-current={current ? "step" : undefined}>
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stat tiles                                                          */
/* ------------------------------------------------------------------ */

const STAT_BARS = {
  forest: "bg-[var(--sf-forest)]",
  sky: "bg-[#5b8fc7]",
  gold: "bg-[#d9a400]",
  berry: "bg-[var(--sf-clay)]",
} as const;

export type GardenStat = {
  id: string;
  label: string;
  value: ReactNode;
  accent?: keyof typeof STAT_BARS;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  /** Short line under the label. */
  hint?: ReactNode;
  testId?: string;
};

/**
 * KPI tiles (admin density). Every tile leads somewhere: `href` links to the
 * page behind the number, `onClick` applies a filter on this page.
 */
export function GardenStatTiles({
  stats,
  ariaLabel = "Key numbers",
  layout = "tiles",
  index = 1,
  valueClassName,
}: {
  stats: GardenStat[];
  ariaLabel?: string;
  layout?: "tiles" | "strip";
  index?: number;
  /** Override the tile value size (long money figures on phones). */
  valueClassName?: string;
}) {
  const reduce = useReducedMotion() === true;
  if (stats.length === 0) return null;
  const cols = stats.length >= 4 ? "lg:grid-cols-4" : stats.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";
  if (layout === "strip") {
    return (
      <motion.section
        {...gFade(index, reduce)}
        aria-label={ariaLabel}
        className={`grid grid-cols-2 overflow-hidden rounded-[22px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white shadow-[0_3px_0_0_rgba(43,36,29,0.08)] ${cols}`}
      >
        {stats.map((stat, i) => (
          <StatTile
            key={stat.id}
            stat={stat}
            className={`px-4 py-3 border-[var(--sf-ink)]/[0.08] ${i % 2 === 1 ? "border-l-[1.5px]" : ""} ${
              i >= 2 ? "border-t-[1.5px] lg:border-t-0" : ""
            } ${i > 0 ? "lg:border-l-[1.5px]" : ""}`}
            valueClass="text-[1.6rem]"
          />
        ))}
      </motion.section>
    );
  }
  return (
    <section aria-label={ariaLabel} className={`grid grid-cols-2 gap-3 lg:gap-4 ${cols}`}>
      {stats.map((stat, i) => (
        <motion.div key={stat.id} {...gFade(index + i * 0.5, reduce)} className="min-w-0">
          <StatTile
            stat={stat}
            className={`h-full rounded-[22px] border-[1.5px] bg-white px-4 py-4 shadow-[0_3px_0_0_rgba(43,36,29,0.08)] hover:-translate-y-0.5 sm:px-5 ${
              stat.active ? "border-[var(--sf-clay)] ring-2 ring-[var(--sf-clay)]/20" : "border-[var(--sf-ink)]/12"
            }`}
            valueClass={valueClassName ?? "text-[2rem] sm:text-[2.3rem]"}
            showBar
          />
        </motion.div>
      ))}
    </section>
  );
}

function StatTile({
  stat,
  className,
  valueClass,
  showBar = false,
}: {
  stat: GardenStat;
  className: string;
  valueClass: string;
  showBar?: boolean;
}) {
  const inner = (
    <>
      {showBar ? (
        <span aria-hidden className={`mb-3 block h-1.5 w-8 rounded-full ${STAT_BARS[stat.accent ?? "forest"]}`} />
      ) : null}
      <span className={`sf-display block leading-none tabular-nums text-[var(--sf-ink)] ${valueClass}`}>
        {stat.value}
      </span>
      <span className="mt-1.5 flex items-center justify-between gap-2 text-[13px] font-extrabold text-[var(--sf-ink)]/65 group-hover:text-[var(--sf-ink)]">
        <span className="min-w-0">{stat.label}</span>
        {stat.href || stat.onClick ? (
          <ArrowRight
            className="h-3.5 w-3.5 shrink-0 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
            aria-hidden
          />
        ) : null}
      </span>
      {stat.hint ? (
        <span className="mt-0.5 block text-[12px] font-semibold text-[var(--sf-soft)]">{stat.hint}</span>
      ) : null}
    </>
  );
  const base = `group block w-full min-w-0 text-left no-underline transition-all duration-200 ${className}`;
  const label = `${stat.label}: ${typeof stat.value === "string" || typeof stat.value === "number" ? stat.value : ""}. ${
    stat.href ? "Open" : "Show"
  }`;
  if (stat.href) {
    return (
      <Link
        href={stat.href}
        className={`${base} hover:bg-[var(--sf-accent-wash)] ${G_FOCUS} focus-visible:ring-inset`}
        aria-label={label}
        data-testid={stat.testId}
      >
        {inner}
      </Link>
    );
  }
  if (stat.onClick) {
    return (
      <button
        type="button"
        onClick={stat.onClick}
        aria-pressed={stat.active}
        className={`${base} hover:bg-[var(--sf-accent-wash)] ${G_FOCUS} focus-visible:ring-inset`}
        aria-label={label}
        data-testid={stat.testId}
      >
        {inner}
      </button>
    );
  }
  return (
    <div className={base} data-testid={stat.testId}>
      {inner}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Save bar                                                            */
/* ------------------------------------------------------------------ */

/**
 * Sticky save bar for editors: "Unsaved changes" with Discard / Save (toy),
 * "Saving…", and "Saved just now" after a save. The Save button is the
 * view's toy button.
 */
export function GardenSaveBar({
  dirty,
  saving,
  savedAt,
  onSave,
  onDiscard,
  saveLabel = "Save changes",
  savingLabel = "Saving…",
  disabled,
  disabledReason,
  extra,
  sticky = true,
  "data-testid": testId,
}: {
  dirty: boolean;
  saving: boolean;
  savedAt?: number | null;
  onSave: () => void;
  onDiscard?: () => void;
  saveLabel?: string;
  savingLabel?: string;
  disabled?: boolean;
  disabledReason?: string | null;
  extra?: ReactNode;
  sticky?: boolean;
  "data-testid"?: string;
}) {
  const reduce = useReducedMotion() === true;
  const savedLabel = useRelativeTime(savedAt ?? 0);
  const status = saving
    ? savingLabel
    : dirty
      ? "Unsaved changes"
      : savedAt
        ? `Saved ${savedLabel}`
        : "All changes saved";
  return (
    <div
      data-testid={testId}
      className={`${sticky && (dirty || saving) ? "sticky bottom-3 z-20" : ""} flex flex-col gap-3 rounded-[18px] border-[1.5px] px-4 py-3 shadow-[0_6px_24px_-12px_rgba(43,36,29,0.35)] transition-colors sm:flex-row sm:items-center sm:justify-between ${
        dirty || saving
          ? "border-[var(--sf-ink)]/25 bg-white"
          : "border-[var(--sf-forest)]/25 bg-[var(--sf-mint)]/70"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={saving ? "saving" : dirty ? "dirty" : "saved"}
            initial={reduce ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: PORTAL_EASE }}
            className="inline-flex items-center gap-2 text-[13.5px] font-extrabold text-[var(--sf-ink)]"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin text-[var(--sf-clay)]" aria-hidden />
            ) : dirty ? (
              <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[#d9a400]" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-[var(--sf-forest)]" aria-hidden />
            )}
            {status}
          </motion.span>
        </AnimatePresence>
        {disabledReason && dirty ? (
          <span className="truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">· {disabledReason}</span>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {extra}
        {onDiscard && dirty && !saving ? (
          <button type="button" onClick={onDiscard} className={gBtnOutlineSm}>
            Discard
          </button>
        ) : null}
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || saving || disabled}
          aria-busy={saving || undefined}
          className={gBtnPopSm}
        >
          <BusyLabel busy={saving} busyLabel={savingLabel}>
            {saveLabel}
          </BusyLabel>
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section + skeletons                                                 */
/* ------------------------------------------------------------------ */

/** Small titled block inside a card (h3 + optional action). */
export function GardenSection({
  title,
  description,
  action,
  children,
  className = "",
  id,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section className={`min-w-0 ${className}`} aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={id ? `${id}-title` : undefined} className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">
            {title}
          </h3>
          {description ? (
            <p className="m-0 mt-0.5 text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

/**
 * Numbered step inside a form or panel ("1 Write", "2 Attach"…): an ink
 * number badge that turns into a forest check once the step is `done`, an h3,
 * a one-line description and the step's controls. Use for guided editors so
 * the admin always sees where they are and what's left.
 */
export function GardenNumberedSection({
  step,
  title,
  description,
  done = false,
  action,
  children,
  className = "",
  id,
  "data-testid": testId,
}: {
  step: number;
  title: ReactNode;
  description?: ReactNode;
  done?: boolean;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
  "data-testid"?: string;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section className={`min-w-0 ${className}`} aria-labelledby={headingId} data-testid={testId}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            aria-hidden
            className={`mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[12px] font-extrabold tabular-nums transition-colors ${
              done
                ? "border-[var(--sf-forest)] bg-[var(--sf-mint)] text-[var(--sf-forest)]"
                : "border-[var(--sf-ink)] bg-white text-[var(--sf-ink)]"
            }`}
          >
            {done ? <Check className="h-3.5 w-3.5" /> : step}
          </span>
          <div className="min-w-0">
            <h3 id={headingId} className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">
              <span className="sr-only">{`Step ${step}${done ? ", done" : ""}: `}</span>
              {title}
            </h3>
            {description ? (
              <p className="m-0 mt-0.5 text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">{description}</p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="pl-0 sm:pl-[34px]">{children}</div>
    </section>
  );
}

/** Garden skeleton for an admin page: header, stat strip, main + rail. */
export function AdminGardenPageSkeleton({
  label,
  layout = "main-rail",
}: {
  label: string;
  layout?: "main-rail" | "split" | "table";
}) {
  return (
    <div className="flex flex-col gap-5" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="flex flex-col gap-2">
        <GSkeleton className="h-3 w-40 !rounded-full" />
        <GSkeleton className="h-9 w-64 !rounded-[12px]" />
        <GSkeleton className="h-4 w-80 max-w-full !rounded-full" />
      </div>
      {layout === "table" ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <GSkeleton key={i} className="h-[104px]" />
            ))}
          </div>
          <GSkeleton className="h-[420px]" />
        </>
      ) : layout === "split" ? (
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <GSkeleton className="h-[420px]" />
          <GSkeleton className="h-[520px]" />
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
          <GSkeleton className="h-[380px]" />
          <GSkeleton className="h-[300px]" />
        </div>
      )}
    </div>
  );
}
