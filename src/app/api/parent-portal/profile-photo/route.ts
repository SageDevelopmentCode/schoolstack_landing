import { NextResponse } from "next/server";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { apiError } from "@/lib/api/route-errors";
import {
  GuardianPhotoUploadError,
  uploadGuardianProfilePhoto,
} from "@/lib/guardians/guardian-photo-storage";
import { logParentPortalActivity } from "@/lib/parent-portal/parent-portal-activity";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/profile-photo";

export const POST = withParentPortalRoute(
  {
    route: ROUTE,
    organizationFrom: "body",
    // Authorization is the caller's own guardian row for this organization (checked below).
    enforceAccess: false,
    missingOrganizationMessage: "organizationId is required.",
    invalidBodyMessage: "Invalid form data.",
    fallbackErrorMessage: "Failed to upload photo.",
  },
  async ({
    request,
    supabase,
    user,
    organizationId,
    formData: parsedFormData,
  }) => {
    const formData = parsedFormData!;
    const file = formData.get("file");

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
      familyName = typeof family?.name === "string" ? family.name.trim() : null;
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
  },
);
