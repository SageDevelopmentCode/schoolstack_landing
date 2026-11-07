import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { loadParentMessagesContacts } from "@/lib/messages/parent-messages";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/messages/contacts";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    programScope: "optional",
    feature: "messages",
    fallbackErrorMessage: "Failed to load contacts.",
  },
  async ({ request, supabase, user, organizationId, programId }) => {
    const schoolName = new URL(request.url).searchParams.get("schoolName")?.trim() ?? "School";

    try {
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
  },
);
