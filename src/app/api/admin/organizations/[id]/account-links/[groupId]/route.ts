import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import {
  PortalAccountLinkError,
  listOrganizationPortalAccountLinkGroups,
  setPrimaryUserForLinkGroup,
  updateLinkGroupLabel,
} from "@/lib/auth/organization-portal-account-links";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/admin/organizations/[id]/account-links/[groupId]";

type RouteContext = {
  params: Promise<{ id: string; groupId: string }>;
};

type PatchLinkGroupBody = {
  primaryUserId?: string;
  label?: string | null;
};

export async function PATCH(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { id: organizationId, groupId } = await context.params;

  try {
    await requirePlatformAdminUser(supabase, request);

    let body: PatchLinkGroupBody;
    try {
      body = (await request.json()) as PatchLinkGroupBody;
    } catch {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Invalid request body.",
        code: "invalid_body",
      });
    }

    const admin = createAdminClient();

    if (!body.primaryUserId && body.label === undefined) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Provide primaryUserId or label to update.",
        code: "missing_fields",
      });
    }

    if (body.primaryUserId) {
      await setPrimaryUserForLinkGroup(
        admin,
        organizationId,
        groupId,
        body.primaryUserId,
      );
    }

    if (body.label !== undefined) {
      const group = await updateLinkGroupLabel(
        admin,
        organizationId,
        groupId,
        body.label,
      );
      return NextResponse.json({ group });
    }

    const groups = await listOrganizationPortalAccountLinkGroups(
      admin,
      organizationId,
    );
    const group = groups.find((candidate) => candidate.id === groupId);

    if (!group) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Link group not found.",
        code: "not_found",
      });
    }

    return NextResponse.json({ group });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    if (error instanceof PortalAccountLinkError) {
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
      error: "Failed to update account link group.",
      cause: error,
      code: "internal_error",
    });
  }
}
