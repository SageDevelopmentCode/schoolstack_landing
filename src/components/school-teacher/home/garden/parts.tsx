"use client";

import type { LucideIcon } from "lucide-react";
import { Calendar, ClipboardCheck, ClipboardList, MessageSquare, Users } from "lucide-react";
import { PANEL_TINTS } from "@/components/school-parent/garden/ui";
import type { TeacherDashboardFocusIcon } from "@/lib/school-teacher/teacher-dashboard-summary";

/*
 * Small shared pieces for the staff Dashboard (Garden).
 * Rules: `.agents/skills/teacher-portal-garden-design/SKILL.md`.
 */

export const TEACHER_FOCUS_ICONS: Record<TeacherDashboardFocusIcon, LucideIcon> = {
  message: MessageSquare,
  calendar: Calendar,
  students: Users,
  signups: ClipboardList,
  attendance: ClipboardCheck,
};

/** Pastel per focus kind (icon chip only). */
export const TEACHER_FOCUS_TINTS: Record<TeacherDashboardFocusIcon, string> = {
  message: "bg-[var(--sf-lav)]",
  calendar: "bg-[var(--sf-sky)]",
  students: "bg-[var(--sf-butter)]",
  signups: "bg-[var(--sf-peach)]",
  attendance: "bg-[var(--sf-mint)]",
};

/** The verb on a focus item's CTA (the item title says what). */
export const TEACHER_FOCUS_CTA: Record<TeacherDashboardFocusIcon, string> = {
  message: "Reply",
  calendar: "Open",
  students: "Review",
  signups: "Open",
  attendance: "Mark",
};

export function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function initials(firstName: string, lastName: string): string {
  return `${firstName.trim()[0] ?? ""}${lastName.trim()[0] ?? ""}`.toUpperCase() || "?";
}

const FACE_SIZES = {
  xs: "h-8 w-8 rounded-full text-[11px] ring-2 ring-white",
  sm: "h-10 w-10 rounded-[12px] text-[13px]",
  md: "h-14 w-14 rounded-[16px] text-[17px]",
  lg: "h-24 w-24 rounded-[24px] text-[2rem]",
} as const;

/** A child's photo, or initials on a pastel. Decorative: the name is always next to it. */
export function StudentFace({
  student,
  index,
  size = "md",
  className = "",
}: {
  student: { firstName: string; lastName: string; profilePhotoUrl: string | null };
  index: number;
  size?: keyof typeof FACE_SIZES;
  className?: string;
}) {
  const box = FACE_SIZES[size];
  if (student.profilePhotoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={student.profilePhotoUrl}
        alt=""
        loading="lazy"
        className={`${box} shrink-0 object-cover ${size === "xs" ? "" : "ring-[1.5px] ring-[var(--sf-ink)]/10"} ${className}`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`${box} sf-display flex shrink-0 items-center justify-center text-[var(--sf-ink)]/70 ${PANEL_TINTS[index % PANEL_TINTS.length]} ${className}`}
    >
      {initials(student.firstName, student.lastName)}
    </span>
  );
}
