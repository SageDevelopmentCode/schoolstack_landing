import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AuthError } from "@/lib/admissions/application-auth";
import {
  addFamilyGuardianAccess,
  FamilyGuardianError,
  listFamilyGuardians,
} from "@/lib/admissions/family-guardians";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admissions/families/[familyId]/guardians";

type RouteContext = {
  params: Promise<{ familyId: string }>;
};

type CreateGuardianBody = {
  organizationId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  relationship?: string;
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

export async function GET(_request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { familyId } = await context.params;

  try {
    const admin = createAdminClient();
    const organizationId = await resolveFamilyOrganizationId(admin, familyId);

    if (!organizationId) {
      return apiError(ROUTE, {
        status: 404,
        error: "Family not found.",
        code: "not_found",
      });
    }

    await requireSchoolAdminUser(supabase, organizationId);

    const guardians = await listFamilyGuardians(admin, familyId);
    return NextResponse.json({ guardians });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
      });
    }

    return apiError(ROUTE, {
      status: 500,
      error: "Failed to load family guardians.",
      code: "internal_error",
      cause: error,
    });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { familyId } = await context.params;

  try {
    let body: CreateGuardianBody;
    try {
      body = (await request.json()) as CreateGuardianBody;
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

    const email = body.email?.trim();
    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();

    if (!email || !firstName || !lastName) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "email, firstName, and lastName are required.",
        code: "missing_fields",
      });
    }

    const guardian = await addFamilyGuardianAccess(admin, {
      organizationId,
      familyId,
      email,
      firstName,
      lastName,
      relationship: body.relationship,
    });

    return NextResponse.json({ guardian });
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
          : "Failed to add parent access.",
      code: "internal_error",
      cause: error,
    });
  }
}
