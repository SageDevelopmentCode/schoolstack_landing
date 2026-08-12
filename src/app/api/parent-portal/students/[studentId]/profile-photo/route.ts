import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { userIsGuardianForStudent } from "@/lib/admissions/parent-portal-access";
import {
  StudentPhotoUploadError,
  uploadStudentProfilePhoto,
} from "@/lib/students/student-photo-storage";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/parent-portal/students/[studentId]/profile-photo";

type RouteContext = {
  params: Promise<{ studentId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { studentId } = await context.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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

  const isGuardian = await userIsGuardianForStudent(
    supabase,
    user.id,
    organizationId,
    studentId,
  );

  if (!isGuardian) {
    return apiError(ROUTE, {
      request,
      status: 403,
      error: "You do not have permission to update this student's photo.",
      code: "forbidden",
    });
  }

  const admin = createAdminClient();

  let profilePhotoUrl: string;
  try {
    profilePhotoUrl = await uploadStudentProfilePhoto(
      admin,
      { organizationId, studentId },
      file,
    );
  } catch (uploadError) {
    const message =
      uploadError instanceof StudentPhotoUploadError
        ? uploadError.message
        : uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload photo.";

    return apiError(ROUTE, {
      request,
      status: 400,
      error: message,
      code:
        uploadError instanceof StudentPhotoUploadError
          ? uploadError.code
          : "upload_failed",
    });
  }

  const { error: updateError } = await admin
    .from("students")
    .update({ profile_photo_url: profilePhotoUrl })
    .eq("id", studentId)
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
}
