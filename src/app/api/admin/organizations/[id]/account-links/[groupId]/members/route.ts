import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import {
  PortalAccountLinkError,
  addMemberToLinkGroupByEmail,
} from "@/lib/auth/organization-portal-account-links";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE =
  "/api/admin/organizations/[id]/account-links/[groupId]/members";

type RouteContext = {
  params: Promise<{ id: string; groupId: string }>;
};

type AddMemberBody = {
  email?: string;
};

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { id: organizationId, groupId } = await context.params;

  try {
    await requirePlatformAdminUser(supabase, request);

    let body: AddMemberBody;
    try {
      body = (await request.json()) as AddMemberBody;
    } catch {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Invalid request body.",
        code: "invalid_body",
      });
    }

    const email = body.email?.trim();
    if (!email) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "email is required.",
        code: "missing_fields",
      });
    }

    const admin = createAdminClient();
    const group = await addMemberToLinkGroupByEmail(
      admin,
      organizationId,
      groupId,
      email,
    );

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
      error: "Failed to add linked account.",
      cause: error,
      code: "internal_error",
    });
  }
}
