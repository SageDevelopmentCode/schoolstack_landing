import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  StaffPhotoUploadError,
  uploadStaffProfilePhoto,
} from "@/lib/staff/staff-photo-storage";
import {
  getStaffMemberIdForUser,
  requireTeacherPortalUser,
  TeacherPortalAuthError,
} from "@/lib/staff/teacher-portal-access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/teacher-portal/profile-photo";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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

  try {
    const user = await requireTeacherPortalUser(supabase, organizationId);

    const staffMemberId = await getStaffMemberIdForUser(
      supabase,
      user.id,
      organizationId,
    );

    if (!staffMemberId) {
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
      profilePhotoUrl = await uploadStaffProfilePhoto(
        admin,
        { organizationId, staffMemberId },
        file,
      );
    } catch (uploadError) {
      const message =
        uploadError instanceof StaffPhotoUploadError
          ? uploadError.message
          : uploadError instanceof Error
            ? uploadError.message
            : "Failed to upload photo.";

      return apiError(ROUTE, {
        request,
        status: 400,
        error: message,
        code:
          uploadError instanceof StaffPhotoUploadError
            ? uploadError.code
            : "upload_failed",
      });
    }

    const { error: updateError } = await admin
      .from("staff_members")
      .update({ profile_photo_url: profilePhotoUrl })
      .eq("id", staffMemberId)
      .eq("organization_id", organizationId);

    if (updateError) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Photo uploaded but failed to save. Please try again.",
        code: "update_failed",
      });
    }

    return NextResponse.json({ profilePhotoUrl });
  } catch (error) {
    if (error instanceof TeacherPortalAuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
      });
    }

    throw error;
  }
}
