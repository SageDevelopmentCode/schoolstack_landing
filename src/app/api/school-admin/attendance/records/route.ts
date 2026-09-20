import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  AttendanceMutationError,
  parseAttendanceDate,
  upsertAttendanceRecord,
} from "@/lib/school-admin/attendance/attendance-mutations";
import type {
  AttendanceAction,
  PickupContactSource,
} from "@/lib/school-admin/attendance/attendance-types";
import { assertStudentEligibleForAttendance } from "@/lib/school-admin/attendance/attendance-roster";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/school-admin/attendance/records";

type AttendanceRecordRequestBody = {
  organizationId?: string;
  studentId?: string;
  date?: string;
  action?: AttendanceAction;
  pickupSource?: PickupContactSource;
  pickupContactId?: string;
};

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let body: AttendanceRecordRequestBody;
  try {
    body = (await request.json()) as AttendanceRecordRequestBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid JSON body.",
      code: "invalid_body",
    });
  }

  const organizationId = body.organizationId?.trim() ?? "";
  const studentId = body.studentId?.trim() ?? "";
  const date =
    body.date?.trim() ?? new Date().toISOString().slice(0, 10);
  const action = body.action;
  const pickupSource = body.pickupSource;
  const pickupContactId = body.pickupContactId?.trim() ?? null;

  if (!organizationId || !studentId || !action) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId, studentId, and action are required.",
      code: "missing_fields",
    });
  }

  if (action !== "present" && action !== "absent" && action !== "pickup") {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "action must be present, absent, or pickup.",
      code: "invalid_action",
    });
  }

  try {
    parseAttendanceDate(date);
    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();

    const { familyId, currentStatus } = await assertStudentEligibleForAttendance(
      admin,
      organizationId,
      studentId,
      date,
    );

    const result = await upsertAttendanceRecord(
      admin,
      {
        organizationId,
        studentId,
        familyId,
        date,
        action,
        pickupSelection:
          action === "pickup" && pickupSource && pickupContactId
            ? { source: pickupSource, contactId: pickupContactId }
            : null,
        recordedByUserId: user.id,
      },
      currentStatus,
    );

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    if (err instanceof AttendanceMutationError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    if (err instanceof Error && err.message.includes("not eligible")) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: err.message,
        code: "student_not_eligible",
        cause: err,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to save attendance record.",
      code: "internal_error",
      cause: err,
    });
  }
}
