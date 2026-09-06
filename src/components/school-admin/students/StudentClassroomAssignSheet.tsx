"use client";

import { useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import SchoolAdminSlideOverShell from "@/components/school-admin/ui/SchoolAdminSlideOverShell";
import ClassroomPickerRow from "./ClassroomPickerRow";
import type { ClassroomSummary } from "@/lib/school-admin/classrooms";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type StudentClassroomAssignSheetProps = {
  open: boolean;
  onClose: () => void;
  studentName: string;
  studentProgramNames: string[];
  classroomIds: string[];
  classrooms: ClassroomSummary[];
  classroomsPath: string;
  saving?: boolean;
  C: AdminThemeTokens;
  onSave: (classroomIds: string[]) => Promise<void>;
};

type ClassroomGroup = {
  programLabel: string;
  classrooms: ClassroomSummary[];
};

function classroomSortKey(classroom: ClassroomSummary): string {
  return classroom.name.toLowerCase();
}

function sortClassrooms(classrooms: ClassroomSummary[]): ClassroomSummary[] {
  return [...classrooms].sort((a, b) =>
    classroomSortKey(a).localeCompare(classroomSortKey(b)),
  );
}

function buildStudentProgramGroups(
  studentProgramNames: string[],
  classrooms: ClassroomSummary[],
): ClassroomGroup[] {
  const orgWideClassrooms = sortClassrooms(
    classrooms.filter((classroom) => !classroom.programId),
  );
  const programSpecificClassrooms = classrooms.filter(
    (classroom) => classroom.programId,
  );

  if (studentProgramNames.length === 0) {
    const byProgram = new Map<string, ClassroomSummary[]>();
    for (const classroom of programSpecificClassrooms) {
      const label = classroom.programName ?? "Program";
      const list = byProgram.get(label) ?? [];
      list.push(classroom);
      byProgram.set(label, list);
    }

    const groups = [...byProgram.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([programLabel, entries]) => ({
        programLabel,
        classrooms: sortClassrooms([...entries, ...orgWideClassrooms]),
      }));

    if (groups.length > 0) return groups;

    return orgWideClassrooms.length > 0
      ? [{ programLabel: "All programs", classrooms: orgWideClassrooms }]
      : [];
  }

  return studentProgramNames.map((programLabel) => {
    const matching = programSpecificClassrooms.filter(
      (classroom) => classroom.programName === programLabel,
    );

    return {
      programLabel,
      classrooms: sortClassrooms([...matching, ...orgWideClassrooms]),
    };
  });
}

export default function StudentClassroomAssignSheet({
  open,
  onClose,
  studentName,
  studentProgramNames,
  classroomIds,
  classrooms,
  classroomsPath,
  saving = false,
  C,
  onSave,
}: StudentClassroomAssignSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(() => [...classroomIds]);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSelectedIds([...classroomIds]);
      setSearchQuery("");
    }
  }

  const groupedClassrooms = useMemo(
    () => buildStudentProgramGroups(studentProgramNames, classrooms),
    [classrooms, studentProgramNames],
  );

  const filteredGroups = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return groupedClassrooms;

    return groupedClassrooms
      .map((group) => ({
        ...group,
        classrooms: group.classrooms.filter((classroom) => {
          const haystack = [
            classroom.name,
            classroom.programName ?? "",
            classroom.leadTeacherNames.join(" "),
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(normalized);
        }),
      }))
      .filter((group) => group.classrooms.length > 0);
  }, [groupedClassrooms, searchQuery]);

  const toggleClassroom = (classroom: ClassroomSummary) => {
    const programKey = classroom.programId ?? "__none__";

    setSelectedIds((current) => {
      if (current.includes(classroom.id)) {
        return current.filter((id) => id !== classroom.id);
      }

      const sameProgramIds = new Set(
        classrooms
          .filter((entry) => (entry.programId ?? "__none__") === programKey)
          .map((entry) => entry.id),
      );

      return [...current.filter((id) => !sameProgramIds.has(id)), classroom.id];
    });
  };

  const handleSave = async () => {
    try {
      await onSave(selectedIds);
      onClose();
    } catch {
      // Parent shows toast; keep sheet open for retry.
    }
  };

  return (
    <SchoolAdminSlideOverShell
      open={open}
      onClose={onClose}
      title="Assign classrooms"
      subtitle={studentName}
      C={C}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-60"
            style={{ color: C.textSecondary }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-60"
            style={{ backgroundColor: C.accent, color: "#fff" }}
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Save
          </button>
        </>
      }
    >
      {classrooms.length === 0 ? (
        <p className="text-sm" style={{ color: C.textTertiary }}>
          No classrooms yet.{" "}
          <a href={classroomsPath} className="font-medium underline-offset-2 hover:underline">
            Add a classroom
          </a>{" "}
          before assigning students.
        </p>
      ) : (
        <>
          <p className="mb-3 text-xs" style={{ color: C.textTertiary }}>
            Select one classroom per program enrollment. Org-wide classrooms can
            be used for any program.
          </p>

          <div className="relative mb-3">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
              style={{ color: C.textTertiary }}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search classrooms or teachers…"
              className="w-full rounded-md border py-2 pl-8 pr-3 text-sm outline-none"
              style={{
                borderColor: C.inputBorder,
                backgroundColor: C.input,
                color: C.textPrimary,
              }}
            />
          </div>

          <div className="space-y-4">
            {filteredGroups.map((group) => (
              <div key={group.programLabel}>
                <p
                  className="mb-2 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: C.textTertiary }}
                >
                  {group.programLabel}
                </p>
                <ul className="space-y-2">
                  {group.classrooms.map((classroom) => (
                    <li key={`${group.programLabel}-${classroom.id}`}>
                      <ClassroomPickerRow
                        classroom={classroom}
                        selected={selectedIds.includes(classroom.id)}
                        disabled={saving}
                        C={C}
                        onSelect={() => toggleClassroom(classroom)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {filteredGroups.length === 0 ? (
            <p className="mt-3 text-sm" style={{ color: C.textTertiary }}>
              No classrooms match your search.
            </p>
          ) : null}
        </>
      )}
    </SchoolAdminSlideOverShell>
  );
}
