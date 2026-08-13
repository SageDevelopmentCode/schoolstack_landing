import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  AuthError,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import { requireTuitionOrgAdmin } from "@/lib/tuition/api-auth";
import { importFinancialAidCsv } from "@/lib/tuition/autopay";
import { schoolAdminActivityContext } from "@/lib/tuition/tuition-activity";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/tuition/import-financial-aid";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const user = await requireAuthenticatedUser(supabase);
    const admin = createAdminClient();
    const body = (await request.json()) as {
      organizationId?: string;
      csvContent?: string;
    };

    if (!body.organizationId || !body.csvContent) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId and csvContent are required.",
        code: "invalid_request",
      });
    }

    await requireTuitionOrgAdmin(admin, body.organizationId, user.id);

    const result = await importFinancialAidCsv(
      admin,
      body.organizationId,
      body.csvContent,
      user.id,
      { context: schoolAdminActivityContext(user) },
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
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
