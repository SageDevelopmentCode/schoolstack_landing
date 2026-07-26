import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AuthError } from "@/lib/admissions/application-auth";
import {
  FamilyGuardianError,
  removeFamilyGuardianAccess,
} from "@/lib/admissions/family-guardians";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admissions/families/[familyId]/guardians/[guardianId]";

type RouteContext = {
  params: Promise<{ familyId: string; guardianId: string }>;
};

type RemoveGuardianBody = {
  organizationId?: string;
};

async function resolveFamilyOrganizationId(
  admin: ReturnType<typeof createAdminClient>,
  familyId: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from("families")
    .select("organization_id")
    .eq("id", familyId)
    .maybeSingle();

  if (error) throw error;
  return data?.organization_id ? String(data.organization_id) : null;
}

export async function DELETE(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { familyId, guardianId } = await context.params;

  try {
    let body: RemoveGuardianBody;
    try {
      body = (await request.json()) as RemoveGuardianBody;
    } catch {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Invalid request body.",
        code: "invalid_body",
      });
    }

    const admin = createAdminClient();
    const familyOrganizationId = await resolveFamilyOrganizationId(admin, familyId);

    if (!familyOrganizationId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Family not found.",
        code: "not_found",
      });
    }

    const organizationId = body.organizationId?.trim() || familyOrganizationId;

    if (organizationId !== familyOrganizationId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Organization does not match this family.",
        code: "invalid_organization",
      });
    }

    await requireSchoolAdminUser(supabase, organizationId);

    await removeFamilyGuardianAccess(admin, {
      organizationId,
      familyId,
      guardianId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError || error instanceof AuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    if (error instanceof FamilyGuardianError) {
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
      error:
        error instanceof Error
          ? error.message
          : "Failed to remove parent access.",
      code: "internal_error",
      cause: error,
    });
  }
}
