"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Home } from "lucide-react";
import { GardenEmptyState } from "@/components/school-admin/garden/kit";
import { GardenPickerSheet, type GardenPickerOption } from "@/components/school-admin/garden/blocks";
import { gLinkSm } from "@/components/school-parent/garden/ui";
import type { ClassroomSummary } from "@/lib/school-admin/classrooms";

/**
 * Classroom groups for one student: one group per program the student is in
 * (that program's classrooms + all-program classrooms). Each classroom is
 * listed once, under the first group it fits.
 */
export function classroomPickerOptions(
  studentProgramNames: string[],
  classrooms: ClassroomSummary[],
): GardenPickerOption[] {
  const sorted = [...classrooms].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  const orgWide = sorted.filter((c) => !c.programId);
  const programSpecific = sorted.filter((c) => c.programId);
  const groups: [string, ClassroomSummary[]][] = [];
  if (studentProgramNames.length === 0) {
    const byProgram = new Map<string, ClassroomSummary[]>();
    for (const c of programSpecific) {
      const label = c.programName ?? "Program";
      byProgram.set(label, [...(byProgram.get(label) ?? []), c]);
    }
    for (const [label, entries] of [...byProgram.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      groups.push([label, entries]);
    }
    if (orgWide.length) groups.push(["All programs", orgWide]);
  } else {
    for (const label of studentProgramNames) {
      groups.push([label, programSpecific.filter((c) => c.programName === label)]);
    }
    if (orgWide.length) groups.push(["All programs", orgWide]);
  }
  const seen = new Set<string>();
  const options: GardenPickerOption[] = [];
  for (const [label, entries] of groups) {
    for (const c of entries) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      options.push({
        id: c.id,
        label: c.name,
        meta: [
          `${c.studentCount} student${c.studentCount === 1 ? "" : "s"}`,
          c.leadTeacherNames.length ? c.leadTeacherNames.join(", ") : "No lead teacher",
          c.status === "full" ? "Full" : c.status === "inactive" ? "Inactive" : null,
        ]
          .filter(Boolean)
          .join(" · "),
        group: label,
        searchText: `${c.programName ?? ""} ${c.leadTeacherNames.join(" ")}`,
      });
    }
  }
  return options;
}

export default function StudentClassroomPicker({
  open,
  onClose,
  studentName,
  studentProgramNames,
  classroomIds,
  classrooms,
  classroomsPath,
  loading,
  loadError,
  onRetryLoad,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  studentName: string;
  studentProgramNames: string[];
  classroomIds: string[];
  classrooms: ClassroomSummary[];
  classroomsPath: string;
  loading: boolean;
  loadError: string | null;
  onRetryLoad: () => void;
  onSave: (classroomIds: string[]) => Promise<boolean>;
}) {
  const options = useMemo(() => classroomPickerOptions(studentProgramNames, classrooms), [classrooms, studentProgramNames]);
  return (
    <GardenPickerSheet
      open={open}
      onClose={onClose}
      kicker="Classrooms"
      title={studentName}
      subtitle="Pick every classroom this student belongs to. Clear them all to unassign."
      options={options}
      initialSelected={classroomIds}
      onSave={onSave}
      allowEmpty
      saveLabel={(count) => (count === 0 ? "Remove from classrooms" : `Save ${count} classroom${count === 1 ? "" : "s"}`)}
      loading={loading}
      loadError={loadError}
      onRetryLoad={onRetryLoad}
      searchPlaceholder="Search classrooms or teachers"
      testId="student-classroom-picker"
      emptyState={
        <GardenEmptyState
          icon={Home}
          title="No classrooms yet"
          description="Create a classroom first, then come back to place this student."
          action={
            <Link href={classroomsPath} className={gLinkSm}>
              Add classroom
            </Link>
          }
        />
      }
    />
  );
}
