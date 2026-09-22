import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  previewAdminBroadcastAudience,
  resolveAdminBroadcastGuardians,
} from "@/lib/messages/admin-broadcast-audience";
import { ADMIN_BROADCAST_MAX_RECIPIENTS } from "@/lib/messages/admin-broadcast-constants";
import { requireSchoolAdminUser } from "@/lib/messages/api-helpers";
import {
  hasAdminBroadcastAudienceSelection,
  parseAdminBroadcastAudience,
} from "@/lib/messages/parse-admin-broadcast-audience";
import { SchoolAdminAuthError } from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-admin/messages/broadcast/preview";

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);

  try {
    const body = (await request.json()) as {
      organizationId?: string;
      audience?: unknown;
    };

    const organizationId = body.organizationId?.trim() ?? "";
    const audience = parseAdminBroadcastAudience(body.audience);

    if (!organizationId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId is required.",
        code: "missing_fields",
      });
    }

    if (!hasAdminBroadcastAudienceSelection(audience)) {
      return NextResponse.json({
        count: 0,
        recipientNames: [],
        exceedsLimit: false,
      });
    }

    await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();
    const contacts = await resolveAdminBroadcastGuardians(
      admin,
      organizationId,
      audience,
    );
    const preview = previewAdminBroadcastAudience(contacts);

    return NextResponse.json({
      ...preview,
      exceedsLimit: preview.count > ADMIN_BROADCAST_MAX_RECIPIENTS,
    });
  } catch (err) {
    if (err instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to preview broadcast audience.",
      cause: err,
      code: "internal_error",
    });
  }
}
