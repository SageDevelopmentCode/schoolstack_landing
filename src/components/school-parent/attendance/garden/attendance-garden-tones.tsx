"use client";

import { Home, Minus, type LucideIcon } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import type { AttendanceRecordStatus } from "@/lib/school-admin/attendance/attendance-types";

/*
 * One visual language per attendance status, used by every card, the list
 * and the drawer (literal class strings so Tailwind generates them):
 *   present   → mint  + hand-drawn tick
 *   picked up → sky   + home
 *   absent    → butter + dash
 */

export const ATTENDANCE_PANEL_BG: Record<AttendanceRecordStatus, string> = {
  present: "bg-[var(--sf-mint)]",
  picked_up: "bg-[var(--sf-sky)]",
  absent: "bg-[var(--sf-butter)]",
};

/** Grid / legend dot fill. */
export const ATTENDANCE_DOT: Record<AttendanceRecordStatus, string> = {
  present: "bg-[var(--sf-mint)] border-[var(--sf-forest)]/45",
  picked_up: "bg-[var(--sf-sky)] border-[#24507a]/40",
  absent: "bg-[var(--sf-butter)] border-[#6b4f00]/40",
};

/** Readable ink on each pastel. */
export const ATTENDANCE_INK: Record<AttendanceRecordStatus, string> = {
  present: "text-[var(--sf-forest)]",
  picked_up: "text-[#24507a]",
  absent: "text-[#6b4f00]",
};

const NON_TICK_ICON: Record<Exclude<AttendanceRecordStatus, "present">, LucideIcon> = {
  picked_up: Home,
  absent: Minus,
};

/** Status mark in a circle: Tick for present, an icon otherwise. Decorative. */
export function AttendanceStatusMark({
  status,
  size = "md",
}: {
  status: AttendanceRecordStatus;
  size?: "sm" | "md" | "lg";
}) {
  const box = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const icon = size === "lg" ? "h-6 w-6" : size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  if (status === "present") {
    return <Tick className={box} color="var(--sf-forest)" fill="var(--sf-mint)" />;
  }
  const Icon = NON_TICK_ICON[status];
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full ${ATTENDANCE_PANEL_BG[status]} ${ATTENDANCE_INK[status]} ${box}`}
    >
      <Icon className={icon} strokeWidth={2.6} />
    </span>
  );
}
