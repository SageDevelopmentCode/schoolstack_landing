"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import StudentClassroomAssignSheet from "./StudentClassroomAssignSheet";
import type { ClassroomSummary } from "@/lib/school-admin/classrooms";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type StudentClassroomAssignSelectProps = {
  C: AdminThemeTokens;
  studentId: string;
  studentName: string;
  studentProgramNames: string[];
  classroomIds: string[];
  classroomNames: string[];
  classrooms: ClassroomSummary[];
  classroomsPath: string;
  classroomsLoading?: boolean;
  classroomsLoaded?: boolean;
  disabled?: boolean;
  onAssign: (studentId: string, classroomIds: string[]) => Promise<void>;
  onInteract?: () => void;
  className?: string;
};

function formatClassroomLabel(classroomNames: string[]): string {
  if (classroomNames.length === 0) return "Unassigned";
  return classroomNames.join(", ");
}

export default function StudentClassroomAssignSelect({
  C,
  studentId,
  studentName,
  studentProgramNames,
  classroomIds,
  classroomNames,
  classrooms,
  classroomsPath,
  classroomsLoading = false,
  classroomsLoaded = false,
  disabled = false,
  onAssign,
  onInteract,
  className,
}: StudentClassroomAssignSelectProps) {
  const [open, setOpen] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);

  useEffect(() => {
    if (!pendingOpen || !classroomsLoaded || classroomsLoading) return;

    queueMicrotask(() => {
      if (classrooms.length > 0) {
        setOpen(true);
      }
      setPendingOpen(false);
    });
  }, [pendingOpen, classroomsLoaded, classroomsLoading, classrooms.length]);

  if (classroomsLoading) {
    return (
      <div className={className}>
        <span className="inline-flex items-center gap-1 text-xs" style={{ color: C.textTertiary }}>
          <Loader2 className="h-3 w-3 animate-spin" />
          Loading classrooms…
        </span>
      </div>
    );
  }

  if (classroomsLoaded && classrooms.length === 0) {
    return (
      <div className={className}>
        <p className="text-xs" style={{ color: C.textTertiary }}>
          No classrooms yet
        </p>
        <Link
          href={classroomsPath}
          className="mt-0.5 inline-block text-xs font-medium underline-offset-2 hover:underline"
          style={{ color: C.accent }}
          onClick={(event) => event.stopPropagation()}
        >
          Add classroom →
        </Link>
      </div>
    );
  }

  const isUnassigned = classroomNames.length === 0;
  const unassignedBorder = "#E8C58A";
  const unassignedText = "#A26B22";

  const handleButtonClick = () => {
    if (classroomsLoaded && classrooms.length > 0) {
      setOpen(true);
      return;
    }

    onInteract?.();
    setPendingOpen(true);
  };

  return (
    <div
      className={className}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={handleButtonClick}
        className="inline-flex min-w-[9rem] max-w-[14rem] items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-left text-sm disabled:opacity-60"
        style={{
          borderColor: isUnassigned ? unassignedBorder : C.inputBorder,
          backgroundColor: C.input,
          color: isUnassigned ? unassignedText : C.textPrimary,
        }}
        aria-label="Assign classrooms"
      >
        <span className="truncate">{formatClassroomLabel(classroomNames)}</span>
        <ChevronDown
          className="h-3.5 w-3.5 shrink-0"
          style={{ color: isUnassigned ? unassignedBorder : C.textTertiary }}
        />
      </button>

      <StudentClassroomAssignSheet
        open={open}
        onClose={() => setOpen(false)}
        studentName={studentName}
        studentProgramNames={studentProgramNames}
        classroomIds={classroomIds}
        classrooms={classrooms}
        classroomsPath={classroomsPath}
        saving={disabled}
        C={C}
        onSave={async (nextClassroomIds) => {
          await onAssign(studentId, nextClassroomIds);
        }}
      />
    </div>
  );
}
