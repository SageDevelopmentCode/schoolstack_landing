import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { enrichApplicationSubmissionsForList } from "@/lib/admissions/application-submissions";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/school-admin/admissions/submissions/enrichment";
const MAX_APPLICATION_IDS = 50;

type EnrichmentRequestBody = {
  organizationId?: string;
  applicationIds?: string[];
};

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);

  let body: EnrichmentRequestBody;
  try {
    body = (await request.json()) as EnrichmentRequestBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid JSON body.",
      code: "invalid_json",
    });
  }

  const organizationId = body.organizationId?.trim() ?? "";
  const applicationIds = [...new Set((body.applicationIds ?? []).map((id) => id.trim()))]
    .filter(Boolean)
    .slice(0, MAX_APPLICATION_IDS);

  if (!organizationId || applicationIds.length === 0) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and applicationIds are required.",
      code: "missing_fields",
    });
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);

    const enrichment = await enrichApplicationSubmissionsForList(
      supabase,
      organizationId,
      applicationIds,
    );

    return NextResponse.json({ enrichment });
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
        err instanceof Error ? err.message : "Failed to enrich submissions.",
      code: "internal_error",
      cause: err,
    });
  }
}
