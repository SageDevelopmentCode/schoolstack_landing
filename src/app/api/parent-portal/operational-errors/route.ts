import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  sanitizeClientErrorFields,
  shouldNotifyClientError,
} from "@/lib/client-operational-error-input";
import { reportOperationalError } from "@/lib/operational-errors";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/operational-errors";

type OperationalErrorBody = {
  organizationId?: string;
  operation?: string;
  error?: string;
  code?: string;
  details?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

export const POST = withParentPortalRoute<OperationalErrorBody>(
  {
    route: ROUTE,
    organizationFrom: "body",
    forbiddenMessage: "You do not have parent portal access to this school.",
    missingOrganizationMessage:
      "organizationId, operation, and error are required.",
    invalidBodyMessage: "Invalid JSON body.",
    fallbackErrorMessage: "Failed to report operational error.",
  },
  async ({ request, supabase, user, organizationId, body }) => {
    const fields = sanitizeClientErrorFields(body);
    const operation = fields?.operation;
    const error = fields?.error;

    if (!operation || !error) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId, operation, and error are required.",
        code: "missing_fields",
      });
    }

    try {
      const { data: organization } = await supabase
        .from("organizations")
        .select("id, name, slug")
        .eq("id", organizationId)
        .maybeSingle();

      await reportOperationalError({
        supabase: createAdminClient(),
        surface: "parent_portal",
        organizationId,
        organizationName: organization?.name ?? null,
        organizationSlug: organization?.slug ?? null,
        operation,
        error,
        code: fields?.code ?? null,
        details: fields?.details ?? null,
        entityType: fields?.entityType ?? null,
        entityId: fields?.entityId ?? null,
        metadata: fields?.metadata,
        // Server decides: client `notify` is ignored; throttled per user + organization.
        notify: shouldNotifyClientError(user.id, organizationId),
        actor: {
          type: "parent",
          userId: user.id,
          email: user.email ?? null,
        },
      });

      return new NextResponse(null, { status: 204 });
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to report operational error.",
        code: "internal_error",
        cause: err,
      });
    }
  },
);
