import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import {
  PortalAccountLinkError,
  removeMemberFromLinkGroup,
} from "@/lib/auth/organization-portal-account-links";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE =
  "/api/admin/organizations/[id]/account-links/[groupId]/members/[memberId]";

type RouteContext = {
  params: Promise<{ id: string; groupId: string; memberId: string }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { id: organizationId, groupId, memberId } = await context.params;

  try {
    await requirePlatformAdminUser(supabase, request);

    const admin = createAdminClient();
    const result = await removeMemberFromLinkGroup(
      admin,
      organizationId,
      groupId,
      memberId,
    );

    return NextResponse.json(result);
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
      error: "Failed to remove linked account.",
      cause: error,
      code: "internal_error",
    });
  }
}
