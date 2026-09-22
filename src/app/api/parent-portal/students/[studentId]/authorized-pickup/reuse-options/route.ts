import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { authorizeParentStudentPickupAccess } from "@/lib/authorized-pickup/authorize-parent-student";
import { loadFamilyPickupReuseOptions } from "@/lib/authorized-pickup/load-family-pickup-reuse-options";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE =
  "/api/parent-portal/students/[studentId]/authorized-pickup/reuse-options";

type RouteContext = {
  params: Promise<{ studentId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { studentId } = await context.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in.",
      code: "unauthorized",
    });
  }

  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim() ?? "";
  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  const access = await authorizeParentStudentPickupAccess(
    supabase,
    user,
    organizationId,
    studentId,
  );

  if (!access.ok) {
    return apiError(ROUTE, {
      request,
      status: 403,
      error: "You do not have permission to view this student's authorized pickup list.",
      code: "forbidden",
    });
  }

  try {
    const admin = createAdminClient();
    const options = await loadFamilyPickupReuseOptions(admin, organizationId, studentId);
    return NextResponse.json({ options });
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load authorized pickup reuse options.",
      cause: error,
      code: "load_failed",
    });
  }
}
