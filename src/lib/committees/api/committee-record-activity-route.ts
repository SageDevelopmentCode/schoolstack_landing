import "server-only";

import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { resolveCommitteeWorkspaceCreateActivity } from "@/lib/committees/api/resolve-committee-workspace-create-activity";
import { recordCommitteeActivityServer } from "@/lib/committees/record-committee-activity-server";
import { createAdminClient } from "@/utils/supabase/admin";

export type RecordCommitteeActivityBody = {
  organizationId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
};

export async function handleRecordCommitteeActivity(
  request: Request,
  route: string,
  committeeId: string,
  body: RecordCommitteeActivityBody,
  actor: {
    userId: string;
    email?: string | null;
    name: string;
    memberId?: string | null;
    type: "parent" | "teacher" | "school_admin";
    surface: "parent_portal" | "teacher_portal" | "school_admin";
  },
) {
  const organizationId = body.organizationId?.trim() ?? "";
  const action = body.action?.trim() ?? "";
  const entityId = body.entityId?.trim() ?? "";

  if (!organizationId || !committeeId || !action || !entityId) {
    return apiError(route, {
      request,
      status: 400,
      error: "Missing required fields.",
      code: "missing_fields",
    });
  }

  const admin = createAdminClient();
  const { data: committee, error: committeeError } = await admin
    .from("committees")
    .select("id, name, organization_id")
    .eq("id", committeeId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (committeeError) {
    return apiError(route, {
      request,
      status: 500,
      error: "Failed to load committee.",
      cause: committeeError,
    });
  }

  if (!committee) {
    return apiError(route, {
      request,
      status: 404,
      error: "Committee not found.",
      code: "not_found",
    });
  }

  let resolved;
  try {
    resolved = await resolveCommitteeWorkspaceCreateActivity(admin, {
      committeeId,
      action,
      entityId,
    });
  } catch (err) {
    return apiError(route, {
      request,
      status: 500,
      error: "Failed to verify committee activity.",
      cause: err,
    });
  }

  if (!resolved.ok) {
    if (resolved.code === "action_not_allowed") {
      return apiError(route, {
        request,
        status: 400,
        error: "This activity type cannot be recorded through this endpoint.",
        code: "action_not_allowed",
      });
    }
    if (resolved.code === "entity_too_old") {
      return apiError(route, {
        request,
        status: 400,
        error: "This item is too old to record as a new workspace update.",
        code: "entity_too_old",
      });
    }
    return apiError(route, {
      request,
      status: 404,
      error: "Committee item not found.",
      code: "invalid_entity",
    });
  }

  const { activity } = resolved;

  try {
    await recordCommitteeActivityServer(admin, {
      organizationId,
      committeeId,
      committeeName: String(committee.name ?? "Committee"),
      action: activity.action,
      entityType: activity.entityType,
      entityId: activity.entityId,
      summary: activity.summary,
      metadata: activity.metadata,
      actorUserId: actor.userId,
      actorEmail: actor.email,
      actorName: actor.name,
      actorMemberId: actor.memberId ?? null,
      actorType: actor.type,
      surface: actor.surface,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(route, {
      request,
      status: 500,
      error: "Failed to record committee activity.",
      cause: err,
    });
  }
}
