import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { getSchoolAdminUserProfile } from "@/lib/school-admin/access";
import {
  OrganizationEventManageAuthError,
  programBelongsToOrganization,
  requireCanManageOrganizationEvents,
} from "@/lib/school-events/event-manage-access";
import { parseCreateOrganizationEventBody } from "@/lib/school-events/event-payload";
import { createOrganizationEvent } from "@/lib/school-events/events";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-events";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid JSON body.",
      code: "invalid_body",
    });
  }

  const parsed = parseCreateOrganizationEventBody(body);
  if ("error" in parsed) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: parsed.error,
      code: "invalid_body",
    });
  }

  try {
    const supabase = await createClientFromRequest(request);
    const user = await requireCanManageOrganizationEvents(
      supabase,
      parsed.organizationId,
      request,
    );

    const admin = createAdminClient();
    if (parsed.input.programId) {
      const validProgram = await programBelongsToOrganization(
        admin,
        parsed.organizationId,
        parsed.input.programId,
      );
      if (!validProgram) {
        return apiError(ROUTE, {
          request,
          status: 400,
          error: "Invalid program.",
          code: "invalid_program",
        });
      }
    }

    const actor = getSchoolAdminUserProfile(user);
    const event = await createOrganizationEvent(
      admin,
      parsed.organizationId,
      parsed.input,
      { userId: user.id, name: actor.displayName },
    );

    return NextResponse.json({ event });
  } catch (err) {
    if (err instanceof OrganizationEventManageAuthError) {
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
      error: err instanceof Error ? err.message : "Failed to create event.",
      code: "internal_error",
      cause: err,
    });
  }
}
