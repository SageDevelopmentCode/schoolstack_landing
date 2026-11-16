"use client";

import { PANEL_TINTS } from "@/components/school-parent/garden/ui";

/** Initials from a person's name ("Ana Ruiz" → "AR"). */
export function personInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Round photo (or initials on a pastel) with an ink ring, for teachers and contacts. */
export function TeacherAvatar({
  teacher,
  index,
  size = "md",
}: {
  teacher: { name: string; profilePhotoUrl?: string | null };
  index: number;
  size?: "md" | "lg";
}) {
  const box = size === "lg" ? "h-14 w-14 text-lg" : "h-11 w-11 text-sm";
  if (teacher.profilePhotoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={teacher.profilePhotoUrl}
        alt=""
        className={`${box} shrink-0 rounded-full object-cover ring-2 ring-[var(--sf-ink)]`}
        loading="lazy"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`${box} flex shrink-0 items-center justify-center rounded-full font-extrabold text-[var(--sf-ink)]/75 ring-2 ring-[var(--sf-ink)] ${PANEL_TINTS[index % PANEL_TINTS.length]}`}
    >
      {personInitials(teacher.name)}
    </span>
  );
}
