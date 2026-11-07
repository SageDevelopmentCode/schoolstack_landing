import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { listFamilyChildrenForHome } from "@/lib/admissions/parent-portal-access";
import { loadParentClassroomSignupsPageBundle } from "@/lib/classroom-signups/load-parent-signups";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/classroom-signups";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    feature: "classroom_signups",
    fallbackErrorMessage: "Failed to load classroom signups.",
  },
  async ({ request, supabase, user, organizationId, familyId }) => {
    try {
      if (!familyId) {
        return NextResponse.json({
          items: [],
          responsesBySignupId: {},
          studentOptions: [],
        });
      }

      const familyChildren = await listFamilyChildrenForHome(
        supabase,
        organizationId,
        user.id,
      );
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
  },
);
