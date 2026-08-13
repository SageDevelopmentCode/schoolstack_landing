import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { listFamilyGuardians } from "@/lib/admissions/family-guardians";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import {
  clearBillingSplits,
  listBillingSplitsWithGuardians,
  upsertBillingSplits,
} from "@/lib/tuition/billing-splits";
import { regenerateFutureCharges } from "@/lib/tuition/charge-generator";
import { schoolAdminActivityContext } from "@/lib/tuition/tuition-activity";
import { requireAuthenticatedUser } from "@/lib/admissions/application-auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/tuition/families/[familyId]/billing-splits";

type RouteContext = {
  params: Promise<{ familyId: string }>;
};

async function requireFamilySchoolAdmin(
  supabase: ReturnType<typeof createClient>,
  admin: ReturnType<typeof createAdminClient>,
  familyId: string,
  request?: Request,
) {
  const { data: family, error: familyError } = await admin
    .from("families")
    .select("id, organization_id")
    .eq("id", familyId)
    .maybeSingle();

  if (familyError) throw familyError;
  if (!family) {
    return {
      error: apiError(ROUTE, {
        request,
        status: 404,
        error: "Family not found.",
        code: "not_found",
      }),
    };
  }

  await requireSchoolAdminUser(supabase, String(family.organization_id));
  return { family };
}

export async function GET(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { familyId } = await context.params;

  try {
    const admin = createAdminClient();
    const auth = await requireFamilySchoolAdmin(supabase, admin, familyId, request);
    if (auth.error) return auth.error;

    const [splits, guardians] = await Promise.all([
      listBillingSplitsWithGuardians(admin, familyId),
      listFamilyGuardians(admin, familyId),
    ]);

    return NextResponse.json({ splits, guardians });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
      });
    }
    throw error;
  }
}

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { familyId } = await context.params;

  try {
    const user = await requireAuthenticatedUser(supabase);
    const admin = createAdminClient();
    const auth = await requireFamilySchoolAdmin(supabase, admin, familyId, request);
    if (auth.error) return auth.error;
    const activityContext = schoolAdminActivityContext(user);

    const body = (await request.json()) as {
      enabled?: boolean;
      splits?: Array<{ guardianId: string; shareBps: number }>;
    };

    if (body.enabled === false) {
      await clearBillingSplits(
        admin,
        familyId,
        String(auth.family.organization_id),
        { context: activityContext },
      );
    } else {
      if (!Array.isArray(body.splits) || body.splits.length === 0) {
        return apiError(ROUTE, {
          request,
          status: 400,
          error: "Provide at least two guardian splits.",
          code: "invalid_splits",
        });
      }

      await upsertBillingSplits(admin, {
        organizationId: String(auth.family.organization_id),
        familyId,
        splits: body.splits,
      }, { context: activityContext });
    }

    const { data: assignments, error: assignmentsError } = await admin
      .from("tuition_enrollment_assignments")
      .select("id")
      .eq("family_id", familyId)
      .eq("status", "active");

    if (assignmentsError) throw assignmentsError;

    for (const assignment of assignments ?? []) {
      await regenerateFutureCharges(admin, String(assignment.id));
    }

    const splits = await listBillingSplitsWithGuardians(admin, familyId);
    return NextResponse.json({ ok: true, splits });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
      });
    }

    if (error instanceof Error) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: error.message,
        code: "invalid_splits",
      });
    }

    throw error;
  }
}
