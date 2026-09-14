import { NextResponse } from "next/server";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { apiError } from "@/lib/api/route-errors";
import {
  GuardianPhotoUploadError,
  uploadGuardianProfilePhoto,
} from "@/lib/guardians/guardian-photo-storage";
import { logParentPortalActivity } from "@/lib/parent-portal/parent-portal-activity";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/profile-photo";

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in to upload a profile photo.",
      code: "unauthorized",
    });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid form data.",
      code: "invalid_body",
    });
  }

  const organizationId = String(formData.get("organizationId") ?? "").trim();
  const file = formData.get("file");

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  if (!(file instanceof File) || file.size === 0) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "A photo file is required.",
      code: "missing_file",
    });
  }

  const { data: guardian, error: guardianError } = await supabase
    .from("guardians")
    .select("id, first_name, last_name, family_id")
    .eq("user_id", user.id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (guardianError) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to verify guardian access.",
      code: "guardian_lookup_failed",
    });
  }

  if (!guardian?.id) {
    return apiError(ROUTE, {
      request,
      status: 403,
      error: "You do not have permission to update this profile photo.",
      code: "forbidden",
    });
  }

  const admin = createAdminClient();

  let profilePhotoUrl: string;
  try {
    profilePhotoUrl = await uploadGuardianProfilePhoto(
      admin,
      { organizationId, guardianId: guardian.id },
      file,
    );
  } catch (uploadError) {
    const message =
      uploadError instanceof GuardianPhotoUploadError
        ? uploadError.message
        : uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload photo.";

    return apiError(ROUTE, {
      request,
      status: 400,
      error: message,
      code:
        uploadError instanceof GuardianPhotoUploadError
          ? uploadError.code
          : "upload_failed",
    });
  }

  const { error: updateError } = await admin
    .from("guardians")
    .update({ profile_photo_url: profilePhotoUrl })
    .eq("id", guardian.id)
    .eq("organization_id", organizationId);

  if (updateError) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Photo uploaded but failed to save. Please try again.",
      code: "update_failed",
    });
  }

  let familyName: string | null = null;
  if (guardian.family_id) {
    const { data: family } = await admin
      .from("families")
      .select("name")
      .eq("id", guardian.family_id)
      .maybeSingle();
    familyName =
      typeof family?.name === "string" ? family.name.trim() : null;
  }
  const guardianName = [guardian.first_name, guardian.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  void logParentPortalActivity(admin, {
    organizationId,
    actorUserId: user.id,
    actorEmail: user.email ?? null,
    actorName: guardianName || null,
    action: ACTIVITY_ACTIONS.PARENT_PROFILE_PHOTO_UPDATED,
    summary: "Updated guardian profile photo",
    entityType: "guardian",
    entityId: guardian.id,
    metadata: {
      guardianId: guardian.id,
      familyName,
    },
    request,
  });

  return NextResponse.json({ profilePhotoUrl });
}
