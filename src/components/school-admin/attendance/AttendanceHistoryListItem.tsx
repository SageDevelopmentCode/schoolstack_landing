"use client";

import StudentPhoto from "@/components/students/StudentPhoto";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  buildAttendanceHistorySummary,
  resolveAttendanceHistoryActor,
} from "@/lib/school-admin/attendance/attendance-history";
import type { AttendanceHistoryEntry } from "@/lib/school-admin/attendance/attendance-types";
import AttendanceStatusBadge from "./AttendanceStatusBadge";

type AttendanceHistoryListItemProps = {
  entry: AttendanceHistoryEntry;
  C: AdminThemeTokens;
  highlightDate?: string | null;
};

export default function AttendanceHistoryListItem({
  entry,
  C,
  highlightDate,
}: AttendanceHistoryListItemProps) {
  const actor = resolveAttendanceHistoryActor(entry);
  const summary = buildAttendanceHistorySummary(entry);
  const isHighlighted = highlightDate != null && entry.date === highlightDate;

  return (
    <div
      className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t px-0 py-3"
      style={{
        borderColor: "#EDF1ED",
        backgroundColor: isHighlighted ? C.accentGlow : undefined,
        borderLeftWidth: isHighlighted ? 3 : 0,
        borderLeftColor: isHighlighted ? C.accent : undefined,
        paddingLeft: isHighlighted ? 9 : 0,
      }}
    >
      <StudentPhoto
        name={actor.name}
        photoUrl={actor.photoUrl}
        size="sm"
        shape="circle"
        accentColor={C.accent}
        accentGlowColor={C.accentLight}
      />
      <div className="min-w-0">
        <p className="truncate text-xs font-medium" style={{ color: C.textPrimary }}>
          {summary.primary}
        </p>
        <p className="mt-0.5 truncate text-[11px]" style={{ color: C.textTertiary }}>
          {summary.secondary}
        </p>
      </div>
      <AttendanceStatusBadge status={entry.status} />
    </div>
  );
}
