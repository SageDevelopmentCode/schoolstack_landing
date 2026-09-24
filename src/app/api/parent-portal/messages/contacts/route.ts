import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { userHasAccessForOptionalProgramScope } from "@/lib/admissions/program-parent-portal-access";
import { loadParentMessagesContacts } from "@/lib/messages/parent-messages";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest, getUserFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/parent-portal/messages/contacts";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const schoolName = searchParams.get("schoolName")?.trim() ?? "School";
  const programId = searchParams.get("programId")?.trim() || null;

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  const {
    data: { user },
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in.",
      code: "unauthorized",
    });
  }

  try {
    const hasAccess = await userHasAccessForOptionalProgramScope(
      supabase,
      user.id,
      organizationId,
      programId,
    );
    if (!hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to the parent portal.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const contacts = await loadParentMessagesContacts(
      admin,
      supabase,
      organizationId,
      user.id,
      schoolName,
      programId,
    );

    return NextResponse.json({ contacts });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load contacts.",
      cause: err,
      code: "internal_error",
    });
  }
}
