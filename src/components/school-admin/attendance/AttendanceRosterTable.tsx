"use client";

import { Loader2 } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AttendanceRosterStudent } from "@/lib/school-admin/attendance/attendance-types";
import AttendanceStudentRow from "./AttendanceStudentRow";

type AttendanceRosterTableProps = {
  students: AttendanceRosterStudent[];
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  loading: boolean;
  savingStudentId: string | null;
  selectedStudentId: string | null;
  emptyMessage: string;
  onRowClick: (student: AttendanceRosterStudent) => void;
  onMarkPresent: (student: AttendanceRosterStudent) => void;
  onRecordPickup: (student: AttendanceRosterStudent) => void;
};

const TABLE_HEADERS = ["Student", "Program", "Status", "Pickup", ""];

export default function AttendanceRosterTable({
  students,
  theme,
  C,
  loading,
  savingStudentId,
  selectedStudentId,
  emptyMessage,
  onRowClick,
  onMarkPresent,
  onRecordPickup,
}: AttendanceRosterTableProps) {
  if (loading) {
    return (
      <div
        className="flex items-center justify-center rounded-b-xl border border-t-0 py-12"
        style={{ borderColor: "#EDF1ED", backgroundColor: C.surface }}
      >
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: C.accent }} />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div
        className="rounded-b-xl border border-t-0 px-4 py-12 text-center"
        style={{ borderColor: "#EDF1ED", backgroundColor: C.surface }}
      >
        <p className="text-sm" style={{ color: C.textSecondary }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-b-xl border border-t-0"
      style={{ borderColor: "#EDF1ED", backgroundColor: C.surface }}
    >
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr style={{ backgroundColor: "#FBFCFB" }}>
            {TABLE_HEADERS.map((label) => (
              <th
                key={label || "action"}
                className="px-[17px] py-2.5 text-left text-[10px] font-extrabold uppercase tracking-[0.08em]"
                style={{ color: "#8B9699" }}
              >
                {label || <span className="sr-only">Action</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <AttendanceStudentRow
              key={student.id}
              student={student}
              theme={theme}
              C={C}
              saving={savingStudentId === student.id}
              selected={selectedStudentId === student.id}
              onRowClick={() => onRowClick(student)}
              onMarkPresent={() => onMarkPresent(student)}
              onRecordPickup={() => onRecordPickup(student)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
