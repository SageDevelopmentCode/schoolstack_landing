import "server-only";

import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { markCommitteeSectionRead } from "@/lib/committees/committee-unread";
import { createAdminClient } from "@/utils/supabase/admin";
import type { CommitteeWorkspaceSection } from "@/lib/committees/types";

export type MarkReadBody = {
  organizationId?: string;
  section?: CommitteeWorkspaceSection;
};

export async function handleMarkCommitteeSectionRead(
  request: Request,
  route: string,
  committeeId: string,
  body: MarkReadBody,
  memberId: string,
) {
  const organizationId = body.organizationId?.trim() ?? "";
  const section = body.section;

  if (!organizationId || !committeeId || !section) {
    return apiError(route, {
      request,
      status: 400,
      error: "Missing required fields.",
      code: "missing_fields",
    });
  }

  const admin = createAdminClient();
  const { data: member, error } = await admin
    .from("committee_members")
    .select("id")
    .eq("id", memberId)
    .eq("committee_id", committeeId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    return apiError(route, {
      request,
      status: 500,
      error: "Failed to verify membership.",
      cause: error,
    });
  }

  if (!member) {
    return apiError(route, {
      request,
      status: 403,
      error: "Forbidden.",
      code: "forbidden",
    });
  }

  try {
    await markCommitteeSectionRead(admin, memberId, section);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(route, {
      request,
      status: 500,
      error: "Failed to mark section read.",
      cause: err,
    });
  }
}
