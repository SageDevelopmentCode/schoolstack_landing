import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/performance/results/[id]";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id } = await context.params;

  try {
    await requirePlatformAdminUser(supabase);

    const admin = createAdminClient();
    const { data: result, error: resultError } = await admin
      .from("performance_audit_results")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (resultError) {
      return apiError(ROUTE, {
        status: 500,
        error: resultError.message,
        cause: resultError,
      });
    }

    if (!result) {
      return apiError(ROUTE, {
        status: 404,
        error: "Audit result not found.",
        code: "not_found",
      });
    }

    return NextResponse.json({ result });
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
      error: "Failed to load audit result.",
      code: "internal_error",
      cause: error,
    });
  }
}
