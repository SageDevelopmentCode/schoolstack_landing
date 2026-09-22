import type { SupabaseClient } from "@supabase/supabase-js";
import { loadStudentAttendanceHistory } from "@/lib/school-admin/attendance/attendance-history";
import type { AttendanceHistoryResponse } from "@/lib/school-admin/attendance/attendance-types";

const PREVIEW_PAGE_SIZE = 20;

export async function loadParentAttendancePreviewHistory(
  admin: SupabaseClient,
  organizationId: string,
  studentIds: string[],
): Promise<Record<string, AttendanceHistoryResponse>> {
  const histories = await Promise.all(
    studentIds.map((studentId) =>
      loadStudentAttendanceHistory(admin, organizationId, studentId, {
        limit: PREVIEW_PAGE_SIZE,
        offset: 0,
      }),
    ),
  );

  return Object.fromEntries(histories.map((history) => [history.studentId, history]));
}
