import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { listProgramsDetailed } from "@/lib/admissions/programs";
import { requireSchoolAdminUser } from "@/lib/messages/api-helpers";
import { listClassrooms } from "@/lib/school-admin/classrooms";
import { SchoolAdminAuthError } from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-admin/messages/broadcast/options";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();

    const [programs, classrooms] = await Promise.all([
      listProgramsDetailed(admin, organizationId),
      listClassrooms(admin, organizationId),
    ]);

    return NextResponse.json({
      programs: programs.map((program) => ({
        id: program.id,
        name: program.name,
      })),
      classrooms: classrooms
        .filter((classroom) => classroom.status !== "inactive")
        .map((classroom) => ({
          id: classroom.id,
          name: classroom.name,
          programId: classroom.programId,
          programName: classroom.programName,
        })),
    });
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

    return apiError(ROUTE, {
      request,
      status: 500,
      error: err instanceof Error ? err.message : "Failed to load broadcast options.",
      code: "internal_error",
      cause: err,
    });
  }
}
