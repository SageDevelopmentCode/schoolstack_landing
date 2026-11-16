"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { gFade } from "@/components/school-parent/garden/motion";
import { DateStamp, GKicker } from "@/components/school-parent/garden/ui";
import { parseEventDate } from "@/lib/committees/calendar-utils";
import type { OrganizationEvent } from "@/lib/school-events/types";

/*
 * Shared bits for the Garden committee sections (parent/teacher workspace).
 * Skill: parent-portal-garden-design.
 */

/** Section intro: kicker, h2, one helpful line, actions on the right. */
export function GardenSectionHeader({
  kicker,
  title,
  description,
  actions,
}: {
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  const reduce = useReducedMotion() === true;
  return (
    <motion.div
      {...gFade(0, reduce)}
      className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="min-w-0">
        <GKicker>{kicker}</GKicker>
        <h2 className="sf-display m-0 mt-1 text-[1.75rem] leading-[1.02] text-[var(--sf-ink)]">{title}</h2>
        {description ? (
          <p className="m-0 mt-1.5 max-w-xl text-[14px] font-semibold text-[var(--sf-soft)]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </motion.div>
  );
}

/** Postage-stamp date for a committee date string (YYYY-MM-DD). */
export function CommitteeDateStamp({ date, dark = false }: { date: string; dark?: boolean }) {
  return <DateStamp event={{ date } as OrganizationEvent} size="sm" dark={dark} />;
}

export function formatShortDate(date: string): string {
  return parseEventDate(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatLongDate(date: string): string {
  return parseEventDate(date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export const G_PANEL_ROW =
  "flex w-full items-start gap-3 rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-3.5 text-left";
