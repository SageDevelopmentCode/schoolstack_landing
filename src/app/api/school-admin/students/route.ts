import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  listOrgEnrolledStudentsPage,
  ORG_ENROLLED_STUDENTS_PAGE_DEFAULT_LIMIT,
  ORG_ENROLLED_STUDENTS_PAGE_MAX_LIMIT,
} from "@/lib/school-admin/students-roster-page";
import { fetchStudentsPageMeta } from "@/lib/school-admin/students-page-meta";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-admin/students";

export type StudentsApiResponse = {
  students: Awaited<ReturnType<typeof listOrgEnrolledStudentsPage>>["students"];
  totalCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  meta?: Awaited<ReturnType<typeof fetchStudentsPageMeta>>;
};

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const limit = Math.min(
    Math.max(
      Number(searchParams.get("limit") ?? ORG_ENROLLED_STUDENTS_PAGE_DEFAULT_LIMIT),
      1,
    ),
    ORG_ENROLLED_STUDENTS_PAGE_MAX_LIMIT,
  );
  const offset = Math.max(Number(searchParams.get("offset") ?? 0), 0);
  const filter = searchParams.get("filter")?.trim() || "all";
  const search = searchParams.get("q")?.trim() ?? "";
  const includeMeta = searchParams.get("includeMeta") === "1";

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

    const [page, meta] = await Promise.all([
      listOrgEnrolledStudentsPage(admin, organizationId, {
        limit,
        offset,
        filter,
        search,
      }),
      includeMeta ? fetchStudentsPageMeta(admin, organizationId) : Promise.resolve(null),
    ]);

    const body: StudentsApiResponse = {
      students: page.students,
      totalCount: page.totalCount,
      limit: page.limit,
      offset: page.offset,
      hasMore: page.hasMore,
    };

    if (meta) {
      body.meta = meta;
    }

    return NextResponse.json(body);
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
      error: err instanceof Error ? err.message : "Failed to load students.",
      code: "internal_error",
      cause: err,
    });
  }
}
