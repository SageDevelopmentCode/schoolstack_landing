import type { SupabaseClient } from "@supabase/supabase-js";
import { formatStaffMemberName } from "@/lib/school-admin/enrolled-students";
import type {
  AttendanceHistoryEntry,
  AttendanceHistoryResponse,
  AttendanceRecordStatus,
} from "./attendance-types";

type AttendanceHistoryRow = {
  attendance_date: string;
  status: AttendanceRecordStatus;
  present_at: string | null;
  absent_at: string | null;
  picked_up_at: string | null;
  picked_up_by_name: string | null;
  recorded_by_user_id: string | null;
};

type StaffMemberRow = {
  user_id: string;
  first_name: string;
  last_name: string;
  profile_photo_url: string | null;
};

export type AttendanceHistoryActor = {
  name: string;
  photoUrl: string | null;
};

export type AttendanceHistorySummary = {
  primary: string;
  secondary: string;
};

export function formatAttendanceHistoryDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return dateKey;

  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatAttendanceHistoryTime(iso: string | null): string | null {
  if (!iso) return null;

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function resolveAttendanceHistoryActor(
  entry: AttendanceHistoryEntry,
): AttendanceHistoryActor {
  if (entry.status === "picked_up" && entry.pickedUpByName) {
    return {
      name: entry.pickedUpByName,
      photoUrl: null,
    };
  }

  if (entry.recordedByName) {
    return {
      name: entry.recordedByName,
      photoUrl: entry.recordedByPhotoUrl,
    };
  }

  return {
    name: "School staff",
    photoUrl: null,
  };
}

export function buildAttendanceHistorySummary(
  entry: AttendanceHistoryEntry,
): AttendanceHistorySummary {
  const actor = resolveAttendanceHistoryActor(entry);
  const dateLabel = formatAttendanceHistoryDateLabel(entry.date);

  if (entry.status === "present") {
    const time = formatAttendanceHistoryTime(entry.presentAt);
    return {
      primary: time ? `Marked present · ${time}` : "Marked present",
      secondary: `${dateLabel} · ${actor.name}`,
    };
  }

  if (entry.status === "absent") {
    const time = formatAttendanceHistoryTime(entry.absentAt);
    return {
      primary: time ? `Marked absent · ${time}` : "Marked absent",
      secondary: `${dateLabel} · ${actor.name}`,
    };
  }

  const time = formatAttendanceHistoryTime(entry.pickedUpAt);
  return {
    primary: time ? `Picked up · ${time}` : "Picked up",
    secondary: `${dateLabel} · ${actor.name}`,
  };
}

export function mapAttendanceHistoryRow(
  row: AttendanceHistoryRow,
  staffByUserId: Map<string, StaffMemberRow>,
): AttendanceHistoryEntry {
  const recordedByUserId = row.recorded_by_user_id;
  const staff = recordedByUserId ? staffByUserId.get(recordedByUserId) : undefined;

  return {
    date: row.attendance_date,
    status: row.status,
    presentAt: row.present_at,
    absentAt: row.absent_at,
    pickedUpAt: row.picked_up_at,
    pickedUpByName: row.picked_up_by_name,
    recordedByUserId,
    recordedByName: staff
      ? formatStaffMemberName({
          firstName: staff.first_name,
          lastName: staff.last_name,
        })
      : null,
    recordedByPhotoUrl: staff?.profile_photo_url ?? null,
  };
}

async function loadStaffByUserIds(
  admin: SupabaseClient,
  organizationId: string,
  userIds: string[],
): Promise<Map<string, StaffMemberRow>> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueIds.length === 0) return new Map();

  const { data, error } = await admin
    .from("staff_members")
    .select("user_id, first_name, last_name, profile_photo_url")
    .eq("organization_id", organizationId)
    .in("user_id", uniqueIds);

  if (error) throw error;

  const map = new Map<string, StaffMemberRow>();
  for (const row of data ?? []) {
    if (!row.user_id) continue;
    map.set(row.user_id, row as StaffMemberRow);
  }
  return map;
}

export async function loadStudentAttendanceHistory(
  admin: SupabaseClient,
  organizationId: string,
  studentId: string,
  options?: { limit?: number; offset?: number },
): Promise<AttendanceHistoryResponse> {
  const limit = Math.min(Math.max(options?.limit ?? 14, 1), 60);
  const offset = Math.max(options?.offset ?? 0, 0);

  const { count, error: countError } = await admin
    .from("student_attendance_records")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("student_id", studentId);

  if (countError) throw countError;

  const totalCount = count ?? 0;

  const { data, error } = await admin
    .from("student_attendance_records")
    .select(
      "attendance_date, status, present_at, absent_at, picked_up_at, picked_up_by_name, recorded_by_user_id",
    )
    .eq("organization_id", organizationId)
    .eq("student_id", studentId)
    .order("attendance_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const rows = (data ?? []) as AttendanceHistoryRow[];
  const staffByUserId = await loadStaffByUserIds(
    admin,
    organizationId,
    rows.map((row) => row.recorded_by_user_id ?? ""),
  );

  const entries = rows.map((row) => mapAttendanceHistoryRow(row, staffByUserId));

  return {
    studentId,
    entries,
    totalCount,
    hasMore: offset + entries.length < totalCount,
  };
}
