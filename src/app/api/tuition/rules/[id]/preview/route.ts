import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  AuthError,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import { previewRuleMatches } from "@/lib/tuition/rules-engine";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/tuition/rules/[id]/preview";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const user = await requireAuthenticatedUser(supabase);
    const { id: ruleId } = await context.params;
    const admin = createAdminClient();

    const { data: rule, error: ruleError } = await admin
      .from("tuition_adjustment_rules")
      .select("organization_id")
      .eq("id", ruleId)
      .maybeSingle();

    if (ruleError) throw ruleError;
    if (!rule) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Rule not found.",
        code: "not_found",
      });
    }

    const organizationId = String(rule.organization_id);

    const { data: membership, error: membershipError } = await admin
      .from("organization_memberships")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (membershipError) throw membershipError;
    if (membership?.role !== "owner" && membership?.role !== "admin") {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "Admin access required.",
        code: "forbidden",
      });
    }

    const matches = await previewRuleMatches(admin, ruleId);

    return NextResponse.json({ matches, count: matches.length });
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
