"use client";

import type { LucideIcon } from "lucide-react";
import { CircleCheck, LogOut, UserCheck, UserX } from "lucide-react";
import type { AttendanceRosterStatus } from "@/lib/school-admin/attendance/attendance-types";

export type AttendanceActionType =
  | "mark_present"
  | "mark_present_again"
  | "mark_absent"
  | "record_pickup"
  | "picked_up";

const ACTION_CONFIG: Record<
  AttendanceActionType,
  { label: string; icon: LucideIcon }
> = {
  mark_present: { label: "Mark Present", icon: UserCheck },
  mark_present_again: { label: "Mark Present again", icon: UserCheck },
  mark_absent: { label: "Mark Absent", icon: UserX },
  record_pickup: { label: "Record Pickup", icon: LogOut },
  picked_up: { label: "Picked up", icon: CircleCheck },
};

export function attendancePrimaryActionType(
  status: AttendanceRosterStatus,
): AttendanceActionType {
  if (status === "present") return "record_pickup";
  if (status === "picked_up") return "picked_up";
  return "mark_present";
}

type AttendanceActionLabelProps = {
  action: AttendanceActionType;
  iconClassName?: string;
};

export default function AttendanceActionLabel({
  action,
  iconClassName = "h-3.5 w-3.5 shrink-0",
}: AttendanceActionLabelProps) {
  const config = ACTION_CONFIG[action];
  const Icon = config.icon;

  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className={iconClassName} aria-hidden />
      {config.label}
    </span>
  );
}
