"use client";

import type { ReactNode } from "react";
import type { CalendarGridColors } from "@/components/scheduler/CalendarGrid";
import { G_FOCUS } from "@/components/school-parent/garden/ui";

/*
 * Garden look for the shared availability editors (Tours & interviews,
 * Shadow days) when they render inside an admin Garden page (skin present).
 * Outside the skin — marketing demo, story pages — they keep their own look.
 */

/** Calendar day colours as Garden tokens (CSS vars work in inline styles). */
export const GARDEN_CALENDAR_COLORS: CalendarGridColors = {
  accent: "var(--sf-clay)",
  accentLight: "var(--sf-accent-wash)",
  text: "var(--sf-ink)",
  textFaint: "rgba(43, 36, 29, 0.32)",
  textSecondary: "rgba(43, 36, 29, 0.62)",
  border: "rgba(43, 36, 29, 0.2)",
  bg: "transparent",
  warning: "#b7791f",
  warningBg: "#fdf3dc",
};

export const GARDEN_AVAILABILITY_PANEL =
  "flex min-h-[280px] flex-col overflow-hidden rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white";

export function GardenAvailabilityHeader({
  kicker,
  title,
  meta,
  aside,
}: {
  kicker: ReactNode;
  title?: ReactNode;
  meta?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b-[1.5px] border-[var(--sf-ink)]/10 px-4 py-3.5">
      <div className="min-w-0">
        <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">{kicker}</p>
        {title ? <p className="m-0 mt-0.5 text-[16px] font-extrabold text-[var(--sf-ink)]">{title}</p> : null}
        {meta ? <p className="m-0 mt-0.5 text-[12.5px] font-semibold text-[var(--sf-soft)]">{meta}</p> : null}
      </div>
      {aside}
    </div>
  );
}

export function GardenAvailabilityFooter({ children }: { children: ReactNode }) {
  return (
    <div className="border-t-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] px-4 py-2.5 text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
      {children}
    </div>
  );
}

export function GardenAvailabilityEmpty({ children }: { children: ReactNode }) {
  return <p className="m-0 py-6 text-center text-[13px] font-semibold text-[var(--sf-soft)]">{children}</p>;
}

/** A time-slot row's state classes (open / booked / group / closed). */
export function gardenSlotClasses({
  open,
  booked,
  group,
}: {
  open: boolean;
  booked: boolean;
  group: boolean;
}): { row: string; text: string } {
  if (booked) {
    return {
      row: "border-[#b7791f]/55 bg-[#fdf3dc]",
      text: "text-[#7a4f0f]",
    };
  }
  if (open) {
    return {
      row: `border-[var(--sf-clay)] bg-[var(--sf-accent-wash)] ${group ? "border-dashed" : ""}`,
      text: "text-[var(--sf-clay-deep)]",
    };
  }
  return {
    row: "border-[var(--sf-ink)]/12 bg-[var(--sf-paper)] hover:border-[var(--sf-ink)]/30",
    text: "text-[var(--sf-ink)]/60",
  };
}

export const GARDEN_SLOT_BUTTON = `flex min-w-0 flex-1 items-center justify-between gap-2 px-3 text-left text-[13px] font-extrabold transition-colors disabled:cursor-not-allowed ${G_FOCUS} focus-visible:ring-inset focus-visible:ring-offset-0`;

/** Garden toggle chip for grade / time-window pickers. */
export function gardenToggleChip(selected: boolean): string {
  return `inline-flex min-h-[32px] items-center rounded-full border-[1.5px] px-3 py-1 text-[12.5px] font-extrabold transition-all ${G_FOCUS} ${
    selected
      ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white shadow-[0_2px_0_0_var(--sf-ink)]"
      : "border-[var(--sf-ink)]/20 bg-white text-[var(--sf-ink)] hover:border-[var(--sf-ink)]/45"
  }`;
}
