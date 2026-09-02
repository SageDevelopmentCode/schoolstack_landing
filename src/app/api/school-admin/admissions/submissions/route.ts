import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  listOrgApplicationSubmissionsPage,
  ORG_SUBMISSIONS_PAGE_DEFAULT_SIZE,
  type SubmissionListStatusFilter,
} from "@/lib/admissions/application-submissions";
import {
  fetchSubmissionPageMeta,
  type SubmissionPageMeta,
} from "@/lib/school-admin/submissions-page-meta";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/school-admin/admissions/submissions";

export type ApplicationSubmissionsApiResponse = {
  submissions: Awaited<
    ReturnType<typeof listOrgApplicationSubmissionsPage>
  >["submissions"];
  totalCount: number;
  pageSize: number;
  meta?: SubmissionPageMeta;
};

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId")?.trim() ?? "";
  const statusFilter =
    (url.searchParams.get("status")?.trim() as SubmissionListStatusFilter | "") ||
    "all";
  const formKey = url.searchParams.get("formKey")?.trim() || "all";
  const includeMeta = url.searchParams.get("includeMeta") === "1";
  const offset = Math.max(
    Number.parseInt(url.searchParams.get("offset") ?? "0", 10) || 0,
    0,
  );
  const limit = Math.min(
    Math.max(
      Number.parseInt(
        url.searchParams.get("limit") ?? String(ORG_SUBMISSIONS_PAGE_DEFAULT_SIZE),
        10,
      ) || ORG_SUBMISSIONS_PAGE_DEFAULT_SIZE,
      1,
    ),
    500,
  );

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

    const [page, meta] = await Promise.all([
      listOrgApplicationSubmissionsPage(supabase, organizationId, {
        limit,
        offset,
        statusFilter,
        formKey,
        enrichment: "minimal",
      }),
      includeMeta ? fetchSubmissionPageMeta(supabase, organizationId) : null,
    ]);

    const body: ApplicationSubmissionsApiResponse = {
      submissions: page.submissions,
      totalCount: page.totalCount,
      pageSize: limit,
      ...(meta ? { meta } : {}),
    };

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
      error:
        err instanceof Error ? err.message : "Failed to load submissions.",
      code: "internal_error",
      cause: err,
    });
  }
}
