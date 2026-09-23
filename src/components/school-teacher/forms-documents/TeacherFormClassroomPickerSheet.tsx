"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import TeacherFormPickerListSkeleton from "./TeacherFormPickerListSkeleton";
import TeacherFormSlideOverShell from "./TeacherFormSlideOverShell";
import type { TeacherClassroomOption } from "@/lib/classroom-signups/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type TeacherFormClassroomPickerSheetProps = {
  theme: ParentThemeTokens;
  open: boolean;
  classroomOptions: TeacherClassroomOption[];
  selectedClassroomIds: string[];
  allowSelectAllClassrooms?: boolean;
  onClose: () => void;
  onChange: (classroomIds: string[]) => void;
};

function ClassroomPickerRow({
  theme,
  classroom,
  selected,
  onSelect,
}: {
  theme: ParentThemeTokens;
  classroom: TeacherClassroomOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-start gap-3 rounded-[10px] border px-3 py-2.5 text-left transition-colors"
      style={{
        borderColor: selected ? "#CCE0CF" : theme.line,
        backgroundColor: selected ? "#EDF5EE" : theme.white,
      }}
    >
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border"
        style={{
          borderColor: selected ? theme.primary : theme.line,
          backgroundColor: selected ? theme.primary : theme.white,
        }}
      >
        {selected ? <Check className="h-3.5 w-3.5" style={{ color: "#fff" }} /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold" style={{ color: theme.ink }}>
          {classroom.name}
        </span>
        <span className="mt-0.5 block text-xs" style={{ color: theme.muted }}>
          {classroom.familyCount} {classroom.familyCount === 1 ? "family" : "families"}
        </span>
      </span>
    </button>
  );
}

export default function TeacherFormClassroomPickerSheet({
  theme,
  open,
  classroomOptions,
  selectedClassroomIds,
  allowSelectAllClassrooms = false,
  onClose,
  onChange,
}: TeacherFormClassroomPickerSheetProps) {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (!open) {
      setShowSkeleton(false);
      return;
    }

    setShowSkeleton(true);
    const timeout = window.setTimeout(() => {
      setShowSkeleton(false);
    }, 120);

    return () => window.clearTimeout(timeout);
  }, [open]);

  const toggleClassroom = (classroomId: string) => {
    const next = selectedClassroomIds.includes(classroomId)
      ? selectedClassroomIds.filter((id) => id !== classroomId)
      : [...selectedClassroomIds, classroomId];
    onChange(next);
  };

  return (
    <TeacherFormSlideOverShell
      theme={theme}
      open={open}
      onClose={onClose}
      title="Choose classrooms"
      subtitle="Select one or more classrooms to receive this form."
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {allowSelectAllClassrooms && classroomOptions.length > 1 ? (
            <button
              type="button"
              onClick={() => onChange(classroomOptions.map((classroom) => classroom.id))}
              className="cursor-pointer text-sm font-semibold"
              style={{ color: theme.primary }}
            >
              Select all
            </button>
          ) : (
            <span />
          )}
          <AdminButton theme={theme} variant="primary" onClick={onClose} className="w-full sm:w-auto">
            Done
          </AdminButton>
        </div>
      }
    >
      {showSkeleton ? (
        <TeacherFormPickerListSkeleton theme={theme} label="Loading classrooms" />
      ) : classroomOptions.length === 0 ? (
        <p className="text-sm" style={{ color: theme.muted }}>
          No classrooms available.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {classroomOptions.map((classroom) => (
            <ClassroomPickerRow
              key={classroom.id}
              theme={theme}
              classroom={classroom}
              selected={selectedClassroomIds.includes(classroom.id)}
              onSelect={() => toggleClassroom(classroom.id)}
            />
          ))}
        </div>
      )}
    </TeacherFormSlideOverShell>
  );
}
