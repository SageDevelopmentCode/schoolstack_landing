import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import {
  PortalAccountLinkError,
  createPortalAccountLinkGroupFromEmails,
  linkPortalAccountsByEmail,
  listOrganizationPortalAccountLinkGroups,
  listCrossRoleSingleLoginAccounts,
  listUnlinkedOrgPortalIdentities,
} from "@/lib/auth/organization-portal-account-links";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/admin/organizations/[id]/account-links";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type CreateLinkBody = {
  primaryEmail?: string;
  linkedEmail?: string;
  memberEmails?: string[];
  label?: string | null;
};

export async function GET(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { id: organizationId } = await context.params;

  try {
    await requirePlatformAdminUser(supabase, request);
    const admin = createAdminClient();

    const [groups, unlinked, crossRoleSingleLoginAccounts] = await Promise.all([
      listOrganizationPortalAccountLinkGroups(admin, organizationId),
      listUnlinkedOrgPortalIdentities(admin, organizationId),
      listCrossRoleSingleLoginAccounts(admin, organizationId),
    ]);

    return NextResponse.json({
      groups,
      unlinked,
      crossRoleSingleLoginAccounts,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      status: 500,
      error: "Failed to load account links.",
      code: "internal_error",
      cause: error,
    });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { id: organizationId } = await context.params;

  try {
    await requirePlatformAdminUser(supabase, request);

    let body: CreateLinkBody;
    try {
      body = (await request.json()) as CreateLinkBody;
    } catch {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Invalid request body.",
        code: "invalid_body",
      });
    }

    const primaryEmail = body.primaryEmail?.trim();
    const memberEmails =
      body.memberEmails?.map((email) => email.trim()).filter(Boolean) ?? [];
    const linkedEmail = body.linkedEmail?.trim();

    if (!primaryEmail) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "primaryEmail is required.",
        code: "missing_fields",
      });
    }

    const admin = createAdminClient();

    const group =
      memberEmails.length > 0
        ? await createPortalAccountLinkGroupFromEmails(admin, organizationId, {
            primaryEmail,
            memberEmails,
            label: body.label,
          })
        : linkedEmail
          ? await linkPortalAccountsByEmail(admin, organizationId, {
              primaryEmail,
              linkedEmail,
              label: body.label,
            })
          : null;

    if (!group) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error:
          "Provide memberEmails (one or more) or linkedEmail to create a link group.",
        code: "missing_fields",
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
      error: "Failed to link accounts.",
      cause: error,
      code: "internal_error",
    });
  }
}
