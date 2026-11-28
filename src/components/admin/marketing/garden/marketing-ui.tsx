"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { adminToast } from "@/lib/school-admin/admin-toast";
import { G_FOCUS, G_TOGGLE, G_TOGGLE_OFF, G_TOGGLE_ON } from "@/components/school-parent/garden/ui";
import { gBtnOutlineXs } from "@/components/school-admin/garden/kit";
import { getMarketingCarousel } from "@/components/admin/marketing/carousels/registry";
import { MarketingSlideShell, SLIDE_HEIGHT, SLIDE_WIDTH } from "@/components/admin/marketing/slide-frame";
import type { ScheduleItem, ScheduleStatus } from "@/lib/marketing/social-schedule";

/*
 * Small shared pieces for the /admin/marketing Garden tabs.
 * Rules: `.claude/skills/admin-portal-garden-design`.
 */

/* ------------------------------------------------------------------ */
/* Canvas shield                                                       */
/* ------------------------------------------------------------------ */

/**
 * Wraps export art (slides, brand marks, platform mock-ups) so the Garden
 * type reset and the admin skin leave it alone (`.sf-demo` is skipped by
 * both). What you see here is what the PNG export draws.
 */
export function MarketingCanvas({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`sf-demo ${className}`} style={style} data-marketing-canvas>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

let copyToastSeq = 0;

/**
 * Copy button: "Copied" + check for 2s and a toast. On failure the error
 * toast shows the text (when short) so it can be copied by hand.
 */
export function CopyChip({
  text,
  label = "Copy",
  what = "Text",
  ariaLabel,
  className = "",
}: {
  text: string;
  label?: string;
  /** Toast noun: "Caption copied." */
  what?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const [toastId] = useState(() => `marketing-copy-${(copyToastSeq += 1)}`);
  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), 2000);
    return () => window.clearTimeout(timer);
  }, [state]);

  const fail = () => {
    setState("failed");
    adminToast.error(`Couldn't copy the ${what.toLowerCase()}.`, {
      id: `${toastId}-error`,
      description: text.length <= 160 ? `Copy it by hand: ${text}` : "Select the text and copy it by hand.",
    });
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => {
        if (!navigator.clipboard) {
          fail();
          return;
        }
        navigator.clipboard.writeText(text).then(
          () => {
            setState("copied");
            adminToast.dismiss(`${toastId}-error`);
            adminToast.success(`${what} copied.`, { id: toastId });
          },
          fail,
        );
      }}
      className={`${gBtnOutlineXs} shrink-0 ${
        state === "copied" ? "!border-[var(--sf-forest)]/40 !bg-[var(--sf-mint)] !text-[var(--sf-forest)]" : ""
      } ${state === "failed" ? "!border-[#b4412f]/40 !text-[#9a3422]" : ""} ${className}`}
    >
      {state === "copied" ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Segmented toggles                                                   */
/* ------------------------------------------------------------------ */

/** Arrow keys move the selection inside a radiogroup (roving focus). */
function onRadioKeyDown<T extends string>(
  event: KeyboardEvent<HTMLDivElement>,
  values: readonly T[],
  current: T | undefined,
  onChange: (value: T) => void,
) {
  const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
  if (!keys.includes(event.key) || values.length === 0) return;
  event.preventDefault();
  const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
  const index = current ? values.indexOf(current) : -1;
  const next = values[(index + delta + values.length) % values.length];
  onChange(next);
  const group = event.currentTarget;
  window.requestAnimationFrame(() => {
    group.querySelector<HTMLButtonElement>('[role="radio"][aria-checked="true"]')?.focus();
  });
}

/** Garden pill radiogroup (sizes, formats, backdrops, caption versions). */
export function GardenSegmented<T extends string>({
  label,
  options,
  value,
  onChange,
  size = "md",
  className = "",
}: {
  label: string;
  options: ReadonlyArray<{ value: T; label: ReactNode; ariaLabel?: string }>;
  value: T | undefined;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  const values = options.map((option) => option.value);
  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={(event) => onRadioKeyDown(event, values, value, onChange)}
      className={`inline-flex flex-wrap items-center gap-1 ${className}`}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.ariaLabel}
            tabIndex={active || (value === undefined && option.value === values[0]) ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={`${G_TOGGLE} ${size === "sm" ? "!min-h-[30px] !px-3 !py-1 !text-[12.5px]" : ""} ${
              active ? G_TOGGLE_ON : G_TOGGLE_OFF
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Schedule status                                                     */
/* ------------------------------------------------------------------ */

export const SCHEDULE_STATUS_LABEL: Record<ScheduleStatus, string> = {
  planned: "Planned",
  scheduled: "Scheduled",
  posted: "Posted",
};

const STATUS_ON: Record<ScheduleStatus, string> = {
  planned: "border-[var(--sf-ink)] bg-[var(--sf-ink)] text-white shadow-[0_2px_0_0_rgba(43,36,29,0.35)]",
  scheduled: "border-[#24507a] bg-[var(--sf-sky)] text-[#24507a] shadow-[0_2px_0_0_#24507a]",
  posted: "border-[var(--sf-forest)] bg-[var(--sf-mint)] text-[var(--sf-forest)] shadow-[0_2px_0_0_var(--sf-forest)]",
};

/** Planned / Scheduled / Posted for one post, with "Saving…" while it saves. */
export function StatusSegmented({
  itemLabel,
  statuses,
  value,
  saving,
  onChange,
}: {
  itemLabel: string;
  statuses: readonly ScheduleStatus[];
  value: ScheduleStatus;
  saving: boolean;
  onChange: (status: ScheduleStatus) => void;
}) {
  return (
    <div className="flex flex-col gap-1 md:items-end">
      <div
        role="radiogroup"
        aria-label={`Status for ${itemLabel}`}
        aria-busy={saving || undefined}
        onKeyDown={(event) => {
          if (!saving) onRadioKeyDown(event, statuses, value, onChange);
        }}
        className="inline-flex items-center gap-1 rounded-full border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-1"
      >
        {statuses.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              disabled={saving}
              onClick={() => onChange(option)}
              className={`inline-flex min-h-[30px] items-center rounded-full border-[1.5px] px-3 py-1 text-[12.5px] font-extrabold transition-all duration-200 disabled:cursor-wait ${
                active ? STATUS_ON[option] : "border-transparent text-[var(--sf-ink)]/60 hover:text-[var(--sf-ink)]"
              } ${G_FOCUS} focus-visible:ring-offset-0`}
            >
              {SCHEDULE_STATUS_LABEL[option]}
            </button>
          );
        })}
      </div>
      {saving ? (
        <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[var(--sf-soft)]" aria-live="polite">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> Saving…
        </span>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chips                                                               */
/* ------------------------------------------------------------------ */

const PILLAR_TINT: Record<ScheduleItem["pillar"], string> = {
  Laugh: "bg-[var(--sf-butter)] text-[#6b4f00]",
  Talk: "bg-[var(--sf-sky)] text-[#24507a]",
  Show: "bg-[var(--sf-lav)] text-[#5e3a78]",
  Teach: "bg-[var(--sf-mint)] text-[var(--sf-forest)]",
  Prove: "bg-[var(--sf-peach)] text-[var(--sf-clay-deep)]",
  Brand: "bg-[var(--sf-ink)]/[0.06] text-[var(--sf-ink)]/75",
};

/** Content pillar chip (pastel per pillar). */
export function PillarChip({ pillar }: { pillar: ScheduleItem["pillar"] }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold ${PILLAR_TINT[pillar]}`}>
      {pillar}
    </span>
  );
}

/** Quiet outline chip for platforms and other meta. */
export function MetaChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border-[1.5px] border-[var(--sf-ink)]/12 bg-white px-2.5 py-0.5 text-xs font-bold text-[var(--sf-soft)]">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Slide thumbnail                                                     */
/* ------------------------------------------------------------------ */

export function studioHref(item: { carouselId: string; slideId?: string }) {
  const params = new URLSearchParams({ carousel: item.carouselId });
  if (item.slideId) params.set("slide", item.slideId);
  return `/admin/marketing?${params.toString()}`;
}

/** The real slide, rendered small (inside the canvas shield) once it scrolls near the viewport. */
export function SlideThumb({
  carouselId,
  slideId,
  label,
  width = 96,
  href,
}: {
  carouselId: string;
  slideId?: string;
  label: string;
  width?: number;
  /** Link target; omit for a plain (decorative) thumbnail. */
  href?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const carousel = getMarketingCarousel(carouselId);
  const slide = (slideId ? carousel?.slides.find((s) => s.id === slideId) : undefined) ?? carousel?.slides[0];
  const scale = width / SLIDE_WIDTH;
  const height = Math.round(SLIDE_HEIGHT * scale);

  // The slide may contain links (demo windows), so the Studio link is an overlay sibling, never a wrapper.
  return (
    <div
      ref={ref}
      className={`group relative shrink-0 overflow-hidden rounded-[10px] border-[1.5px] border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] shadow-[0_2px_0_0_rgba(43,36,29,0.12)] transition-transform duration-200 ${
        href ? "hover:-translate-y-0.5 focus-within:-translate-y-0.5" : ""
      }`}
      style={{ width, height }}
    >
      {visible && slide ? (
        <MarketingCanvas>
          <div
            aria-hidden
            inert
            className="pointer-events-none"
            style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT, transform: `scale(${scale})`, transformOrigin: "top left" }}
          >
            <MarketingSlideShell>{slide.render()}</MarketingSlideShell>
          </div>
        </MarketingCanvas>
      ) : null}
      {!slideId && carousel && width >= 80 ? (
        <span className="absolute bottom-1 right-1 rounded-full bg-[var(--sf-ink)]/75 px-1.5 text-[10px] font-extrabold text-white">
          {carousel.slides.length} slides
        </span>
      ) : null}
      {href ? (
        <Link
          href={href}
          aria-label={`Open ${label} in the Studio`}
          className={`absolute inset-0 rounded-[10px] ${G_FOCUS} focus-visible:ring-offset-0`}
        />
      ) : null}
    </div>
  );
}
