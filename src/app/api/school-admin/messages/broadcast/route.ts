import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  getStaffMemberIdForUser,
  requireSchoolAdminUser,
} from "@/lib/messages/api-helpers";
import { adminBroadcastSend } from "@/lib/messages/admin-broadcast-send";
import {
  buildBroadcastPartialFailureMessage,
  buildBroadcastTotalFailureBody,
  summarizeBroadcastFailures,
} from "@/lib/messages/admin-broadcast-route-response";
import {
  hasAdminBroadcastAudienceSelection,
  parseAdminBroadcastAudience,
} from "@/lib/messages/parse-admin-broadcast-audience";
import { reportOperationalError } from "@/lib/operational-errors";
import { SchoolAdminAuthError } from "@/lib/school-admin/access";
import { activityClientMetadataFromRequest } from "@/lib/activity-client";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-admin/messages/broadcast";

export const maxDuration = 300;

async function parseBroadcastRequest(request: Request): Promise<{
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  body: string;
  files: File[];
  audience: ReturnType<typeof parseAdminBroadcastAudience>;
  broadcastBatchId: string | null;
}> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const organizationId = String(formData.get("organizationId") ?? "").trim();
    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const schoolName = String(formData.get("schoolName") ?? "School").trim();
    const body = String(formData.get("body") ?? "").trim();
    const audienceRaw = formData.get("audience");
    let audience: unknown = {};
    if (typeof audienceRaw === "string" && audienceRaw.trim()) {
      audience = JSON.parse(audienceRaw);
    }
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);
    const broadcastBatchId = String(formData.get("broadcastBatchId") ?? "").trim() || null;

    return {
      organizationId,
      organizationSlug,
      schoolName,
      body,
      files,
      audience: parseAdminBroadcastAudience(audience),
      broadcastBatchId,
    };
  }

  const json = (await request.json()) as {
    organizationId?: string;
    organizationSlug?: string;
    schoolName?: string;
    body?: string;
    audience?: unknown;
    broadcastBatchId?: string;
  };

  return {
    organizationId: json.organizationId?.trim() ?? "",
    organizationSlug: json.organizationSlug?.trim() ?? "",
    schoolName: json.schoolName?.trim() ?? "School",
    body: json.body?.trim() ?? "",
    files: [],
    audience: parseAdminBroadcastAudience(json.audience),
    broadcastBatchId: json.broadcastBatchId?.trim() || null,
  };
}

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);

  try {
    const parsed = await parseBroadcastRequest(request);
    const {
      organizationId,
      organizationSlug,
      schoolName,
      body,
      files,
      audience,
      broadcastBatchId,
    } = parsed;

    if (!organizationId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId is required.",
        code: "missing_fields",
      });
    }

    if (!hasAdminBroadcastAudienceSelection(audience)) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Select at least one parent to message.",
        code: "missing_fields",
      });
    }

    if (!body.trim() && files.length === 0) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Message content is required.",
        code: "missing_fields",
      });
    }

    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const staffMemberId = await getStaffMemberIdForUser(
      supabase,
      user.id,
      organizationId,
    );
    const admin = createAdminClient();

    const result = await adminBroadcastSend(admin, {
      organizationId,
      organizationSlug: organizationSlug || organizationId,
      schoolName,
      body,
      files,
      audience,
      userId: user.id,
      staffMemberId,
      broadcastBatchId,
      activityMetadata: activityClientMetadataFromRequest(request),
    });

    if (result.failedCount > 0) {
      void reportOperationalError({
        supabase: admin,
        surface: "school_admin",
        organizationId,
        operation: "school_admin_messages_broadcast_partial_failure",
        error: buildBroadcastPartialFailureMessage(result),
        code: result.sentCount === 0 ? "broadcast_failed" : "broadcast_partial_failure",
        metadata: {
          sentCount: result.sentCount,
          failedCount: result.failedCount,
          failures: summarizeBroadcastFailures(result.failures),
        },
        notify: true,
        actor: { type: "school_admin", userId: user.id, email: user.email },
      });
    }

    if (result.sentCount === 0) {
      return NextResponse.json(buildBroadcastTotalFailureBody(result), { status: 500 });
    }

    return NextResponse.json(result);
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

    if (err instanceof Error && err.message.includes("message up to")) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: err.message,
        code: "too_many_recipients",
      });
    }

    if (
      err instanceof Error &&
      (err.message.includes("Select at least one parent") ||
        err.message.includes("Message content is required"))
    ) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: err.message,
        code: "missing_fields",
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to send bulk messages.",
      cause: err,
      code: "internal_error",
    });
  }
}
