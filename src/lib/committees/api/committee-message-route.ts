import "server-only";

import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { postCommitteeMessageServer } from "@/lib/committees/post-committee-message-server";
import { SCHOOL_ADMIN_ATTRIBUTION } from "@/lib/committees/attribution";
import { createAdminClient } from "@/utils/supabase/admin";

export async function handlePostCommitteeMessage(
  request: Request,
  route: string,
  input: {
    committeeId: string;
    organizationId: string;
    actorUserId: string;
    actorEmail?: string | null;
    actorName: string;
    actorMemberId?: string | null;
    senderMemberId?: string | null;
    senderName: string;
    actorType: "parent" | "teacher" | "school_admin";
    surface: "parent_portal" | "teacher_portal" | "school_admin";
  },
) {
  const contentType = request.headers.get("content-type") ?? "";
  let body = "";
  let files: File[] = [];

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    body = String(formData.get("body") ?? "").trim();
    const fileEntries = formData.getAll("files");
    files = fileEntries.filter((entry): entry is File => entry instanceof File);
  } else {
    try {
      const json = (await request.json()) as { body?: string };
      body = String(json.body ?? "").trim();
    } catch {
      return apiError(route, {
        request,
        status: 400,
        error: "Invalid request body.",
        code: "invalid_body",
      });
    }
  }

  const admin = createAdminClient();
  const { data: committee, error: committeeError } = await admin
    .from("committees")
    .select("id, name, organization_id")
    .eq("id", input.committeeId)
    .eq("organization_id", input.organizationId)
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

  try {
    const message = await postCommitteeMessageServer(admin, {
      organizationId: input.organizationId,
      committeeId: input.committeeId,
      committeeName: String(committee.name ?? "Committee"),
      body,
      files,
      senderMemberId: input.senderMemberId ?? null,
      senderName: input.senderName || SCHOOL_ADMIN_ATTRIBUTION,
      actorUserId: input.actorUserId,
      actorEmail: input.actorEmail,
      actorName: input.actorName,
      actorMemberId: input.actorMemberId ?? null,
      actorType: input.actorType,
      surface: input.surface,
    });

    return NextResponse.json({ message });
  } catch (err) {
    return apiError(route, {
      request,
      status: 400,
      error: err instanceof Error ? err.message : "Failed to send message.",
      cause: err,
    });
  }
}
