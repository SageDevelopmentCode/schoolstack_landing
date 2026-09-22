"use client";

import type { AttendanceRosterStatus } from "@/lib/school-admin/attendance/attendance-types";

type AttendanceStatusBadgeProps = {
  status: AttendanceRosterStatus;
};

export default function AttendanceStatusBadge({ status }: AttendanceStatusBadgeProps) {
  if (status === "present") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Present
      </span>
    );
  }

  if (status === "picked_up") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        Picked up
      </span>
    );
  }

  if (status === "absent") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        Absent
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-400">
      Not marked
    </span>
  );
}
