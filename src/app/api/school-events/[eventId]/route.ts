import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  OrganizationEventManageAuthError,
  programBelongsToOrganization,
  requireCanManageOrganizationEvents,
} from "@/lib/school-events/event-manage-access";
import {
  isUuid,
  parseUpdateOrganizationEventBody,
} from "@/lib/school-events/event-payload";
import {
  deleteOrganizationEvent,
  updateOrganizationEvent,
} from "@/lib/school-events/events";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-events/[eventId]";

type RouteContext = { params: Promise<{ eventId: string }> };

async function loadEventOrganizationId(
  eventId: string,
): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("organization_events")
    .select("organization_id")
    .eq("id", eventId)
    .maybeSingle();

  if (error) throw error;
  return data?.organization_id ? String(data.organization_id) : null;
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  const { eventId } = await context.params;
  if (!isUuid(eventId)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid event id.",
      code: "invalid_body",
    });
  }

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

  const parsed = parseUpdateOrganizationEventBody(body);
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
    await requireCanManageOrganizationEvents(
      supabase,
      parsed.organizationId,
      request,
    );

    const existingOrganizationId = await loadEventOrganizationId(eventId);
    if (
      !existingOrganizationId ||
      existingOrganizationId !== parsed.organizationId
    ) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Event not found.",
        code: "not_found",
      });
    }

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

    await updateOrganizationEvent(admin, eventId, parsed.input);
    return NextResponse.json({ ok: true });
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
      error: err instanceof Error ? err.message : "Failed to update event.",
      code: "internal_error",
      cause: err,
    });
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext,
) {
  const { eventId } = await context.params;
  if (!isUuid(eventId)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid event id.",
      code: "invalid_body",
    });
  }

  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId")?.trim() ?? "";
  if (!isUuid(organizationId)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    const supabase = await createClientFromRequest(request);
    await requireCanManageOrganizationEvents(
      supabase,
      organizationId,
      request,
    );

    const existingOrganizationId = await loadEventOrganizationId(eventId);
    if (!existingOrganizationId || existingOrganizationId !== organizationId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Event not found.",
        code: "not_found",
      });
    }

    const admin = createAdminClient();
    await deleteOrganizationEvent(admin, eventId);
    return NextResponse.json({ ok: true });
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
      error: err instanceof Error ? err.message : "Failed to delete event.",
      code: "internal_error",
      cause: err,
    });
  }
}
