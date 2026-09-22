"use client";

import { ChevronRight } from "lucide-react";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import type { ParentChipTone } from "@/components/school-parent/ui/ParentChip";
import {
  formatAttendanceHistoryDateLabel,
  formatAttendanceHistoryTime,
} from "@/lib/school-admin/attendance/attendance-history";
import type { AttendanceHistoryEntry } from "@/lib/school-admin/attendance/attendance-types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentAttendanceHistoryListItemProps = {
  entry: AttendanceHistoryEntry;
  theme: ParentThemeTokens;
  onSelect: (entry: AttendanceHistoryEntry) => void;
};

function statusChipTone(status: AttendanceHistoryEntry["status"]): ParentChipTone {
  if (status === "present") return "success";
  if (status === "absent") return "warning";
  return "info";
}

function statusLabel(status: AttendanceHistoryEntry["status"]): string {
  if (status === "present") return "Present";
  if (status === "absent") return "Absent";
  return "Picked up";
}

function compactMetaLine(entry: AttendanceHistoryEntry): string {
  const time =
    entry.status === "present"
      ? formatAttendanceHistoryTime(entry.presentAt)
      : entry.status === "absent"
        ? formatAttendanceHistoryTime(entry.absentAt)
        : formatAttendanceHistoryTime(entry.pickedUpAt);

  const label = statusLabel(entry.status);
  return time ? `${time} · ${label}` : label;
}

export default function ParentAttendanceHistoryListItem({
  entry,
  theme,
  onSelect,
}: ParentAttendanceHistoryListItemProps) {
  const dateLabel = formatAttendanceHistoryDateLabel(entry.date);
  const metaLine = compactMetaLine(entry);

  return (
    <button
      type="button"
      onClick={() => onSelect(entry)}
      className="flex w-full items-center justify-between gap-2 border-t py-1.5 text-left transition-colors first:border-t-0 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
      style={{
        borderColor: theme.line,
        backgroundColor: "transparent",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.backgroundColor = theme.primarySoft;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor = "transparent";
      }}
      onFocus={(event) => {
        event.currentTarget.style.backgroundColor = theme.primarySoft;
      }}
      onBlur={(event) => {
        event.currentTarget.style.backgroundColor = "transparent";
      }}
      aria-label={`View attendance for ${dateLabel}`}
      data-testid={`parent-attendance-history-item-${entry.date}`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-semibold" style={{ color: theme.ink }}>
          {dateLabel}
        </p>
        <p className="mt-0.5 truncate text-[10px]" style={{ color: theme.muted }}>
          {metaLine}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <ParentChip theme={theme} tone={statusChipTone(entry.status)} className="!px-1.5 !py-0.5 !text-[9px]">
          {statusLabel(entry.status)}
        </ParentChip>
        <ChevronRight className="h-3.5 w-3.5" style={{ color: theme.muted }} aria-hidden />
      </div>
    </button>
  );
}
