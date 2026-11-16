"use client";

import Link from "next/link";
import { ChevronDown, Loader2 } from "lucide-react";
import StudentPhoto from "@/components/students/StudentPhoto";
import { GChip, G_FOCUS } from "@/components/school-parent/garden/ui";
import { formatEnrolledDate, type AdminEnrolledStudentSummary } from "@/lib/school-admin/enrolled-students";

/*
 * Garden table cells for My Students. The teacher portal keeps the story
 * cells (StudentIdentityCell / StudentContactCell / StudentEnrolledCell).
 */

export function GardenStudentIdentity({
  name,
  familyName,
  photoUrl,
  hasStandingHealthItems,
}: {
  name: string;
  familyName: string | null;
  photoUrl: string | null;
  hasStandingHealthItems?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <StudentPhoto
        name={name}
        photoUrl={photoUrl}
        size="sm"
        shape="circle"
        accentColor="var(--sf-clay)"
        accentGlowColor="var(--sf-accent-wash)"
        healthIndicator={hasStandingHealthItems}
        healthIndicatorColor="#b4412f"
      />
      <div className="min-w-0">
        <div className="truncate text-[14px] font-extrabold text-[var(--sf-ink)]">{name}</div>
        {familyName ? <div className="max-w-[14rem] truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">{familyName}</div> : null}
        {hasStandingHealthItems ? <span className="sr-only">Has standing health items</span> : null}
      </div>
    </div>
  );
}

/** Classroom chip-button: opens the classroom picker. Unassigned = butter. */
export function GardenClassroomButton({
  classroomNames,
  busy,
  disabled,
  onOpen,
}: {
  classroomNames: string[];
  busy?: boolean;
  disabled?: boolean;
  onOpen: () => void;
}) {
  const unassigned = classroomNames.length === 0;
  return (
    <button
      type="button"
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      onClick={(event) => {
        event.stopPropagation();
        onOpen();
      }}
      onKeyDown={(event) => event.stopPropagation()}
      aria-label={unassigned ? "Assign classrooms" : `Classrooms: ${classroomNames.join(", ")}. Change`}
      className={`inline-flex min-w-[8.5rem] max-w-[14rem] items-center justify-between gap-2 rounded-full border-[1.5px] px-3 py-1.5 text-left text-[13px] font-extrabold transition-colors disabled:cursor-wait disabled:opacity-70 ${
        unassigned
          ? "border-[#d9a400]/50 bg-[var(--sf-butter)]/60 text-[#6b4f00] hover:border-[#d9a400]"
          : "border-[var(--sf-ink)]/15 bg-white text-[var(--sf-ink)] hover:border-[var(--sf-ink)]/40"
      } ${G_FOCUS}`}
    >
      <span className="truncate">{busy ? "Saving…" : unassigned ? "Unassigned" : classroomNames.join(", ")}</span>
      {busy ? <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden /> : <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />}
    </button>
  );
}

export function GardenStudentTeachers({
  student,
  classroomsPath,
}: {
  student: Pick<AdminEnrolledStudentSummary, "assignedTeachers" | "classroomNames">;
  classroomsPath: string;
}) {
  if (student.assignedTeachers.length > 0) {
    return (
      <span className="block max-w-[13rem] truncate text-[13px] font-bold text-[var(--sf-ink)]/85">
        {student.assignedTeachers.map((t) => t.name).join(", ")}
      </span>
    );
  }
  if (student.classroomNames.length > 0) {
    return (
      <Link
        href={classroomsPath}
        onClick={(event) => event.stopPropagation()}
        className={`inline-flex items-center gap-1 text-[12.5px] font-extrabold text-[var(--sf-clay-deep)] hover:underline ${G_FOCUS}`}
      >
        Assign on Classrooms
      </Link>
    );
  }
  return <GChip tone="neutral">—</GChip>;
}

export function GardenStudentContact({ name, email }: { name: string | null; email: string | null }) {
  if (!name && !email) return <span className="text-[13px] text-[var(--sf-soft)]">—</span>;
  return (
    <div className="min-w-0">
      {name ? <div className="max-w-[13rem] truncate text-[13px] font-bold text-[var(--sf-ink)]/85">{name}</div> : null}
      {email ? <div className="max-w-[13rem] truncate text-[12px] font-semibold text-[var(--sf-soft)]">{email}</div> : null}
    </div>
  );
}

export function GardenStudentEnrolled({ enrolledAt }: { enrolledAt: string }) {
  return <span className="text-[13px] font-bold tabular-nums text-[var(--sf-ink)]/75">{enrolledAt ? formatEnrolledDate(enrolledAt) : "—"}</span>;
}
