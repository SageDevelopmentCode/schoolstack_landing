"use client";

import { ChevronRight } from "lucide-react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { TeacherFormAudienceType } from "@/lib/school-teacher/forms-documents/types";
import { formatFamilyAudienceSelectionLabel } from "@/lib/school-teacher/forms-documents/utils";

type TeacherFormAudienceSummaryStripProps = {
  theme: ParentThemeTokens;
  audienceType: TeacherFormAudienceType;
  classroomCount: number;
  familyCount: number;
  familyNames?: string[];
  onEdit: () => void;
};

export default function TeacherFormAudienceSummaryStrip({
  theme,
  audienceType,
  classroomCount,
  familyCount,
  familyNames = [],
  onEdit,
}: TeacherFormAudienceSummaryStripProps) {
  if (audienceType !== "classrooms" && audienceType !== "families") {
    return null;
  }

  const label =
    audienceType === "classrooms"
      ? classroomCount === 0
        ? "Choose classrooms"
        : classroomCount === 1
          ? "1 classroom selected"
          : `${classroomCount} classrooms selected`
      : formatFamilyAudienceSelectionLabel(familyNames);

  return (
    <button
      type="button"
      onClick={onEdit}
      className="flex w-full min-h-[44px] cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition-colors hover:bg-[#F7FAF7]"
      style={{
        borderColor: theme.line,
        backgroundColor: theme.cream,
      }}
    >
      <span className="text-sm font-medium" style={{ color: theme.ink }}>{label}</span>
      <span
        className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold"
        style={{ color: theme.primary }}
      >
        Edit
        <ChevronRight className="h-4 w-4" />
      </span>
    </button>
  );
}
