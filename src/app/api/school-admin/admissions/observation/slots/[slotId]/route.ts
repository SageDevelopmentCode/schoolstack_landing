import { NextResponse } from "next/server";
import { deleteObservationSlot } from "@/lib/admissions/admissions-observation-slots";
import { activityClientMetadataFromRequest } from "@/lib/activity-client";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/school-admin/admissions/observation/slots/[slotId]";

type RouteContext = {
  params: Promise<{ slotId: string }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  const { slotId } = await context.params;
  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim();

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    const supabase = await createClientFromRequest(request);
    await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();

    await deleteObservationSlot(
      admin,
      organizationId,
      slotId,
      activityClientMetadataFromRequest(request),
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: error instanceof Error ? error.message : "Failed to delete shadow slot.",
      code: "internal_error",
      cause: error,
    });
  }
}
