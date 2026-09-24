import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import { listFamilyChildrenForHome, userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { loadParentClassroomSignupsPageBundle } from "@/lib/classroom-signups/load-parent-signups";
import { createClientFromRequest, getUserFromRequest, signedInErrorForRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/classroom-signups";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim() ?? "";

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
    error: authError,
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: await signedInErrorForRequest(request, authError),
      code: "unauthorized",
    });
  }

  try {
    const hasAccess = await userHasEnrolledAccess(supabase, user.id, organizationId);
    if (!hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to the parent portal.",
        code: "forbidden",
      });
    }

    const familyIds = await getFamilyIdsForUser(supabase, user.id, organizationId);
    const familyId = familyIds[0];
    if (!familyId) {
      return NextResponse.json({
        items: [],
        responsesBySignupId: {},
        studentOptions: [],
      });
    }

    const familyChildren = await listFamilyChildrenForHome(supabase, organizationId, user.id);
    const studentOptions = familyChildren
      .filter((child) => child.studentId)
      .map((child) => ({
        id: child.studentId!,
        name: child.studentName,
      }));

    const admin = createAdminClient();
    const bundle = await loadParentClassroomSignupsPageBundle(
      admin,
      organizationId,
      familyId,
      studentOptions,
    );

    return NextResponse.json(bundle);
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load classroom signups.",
      cause: err,
      code: "load_failed",
    });
  }
}
