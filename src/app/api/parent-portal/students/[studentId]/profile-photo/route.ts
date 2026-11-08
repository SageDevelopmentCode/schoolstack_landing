import { NextResponse } from "next/server";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { apiError } from "@/lib/api/route-errors";
import { userIsGuardianForStudent } from "@/lib/admissions/parent-portal-access";
import { logParentPortalActivity } from "@/lib/parent-portal/parent-portal-activity";
import {
  StudentPhotoUploadError,
  uploadStudentProfilePhoto,
} from "@/lib/students/student-photo-storage";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/students/[studentId]/profile-photo";

export const POST = withParentPortalRoute<unknown, { studentId: string }>(
  {
    route: ROUTE,
    organizationFrom: "body",
    enforceAccess: false,
    invalidBodyMessage: "Invalid form data.",
    fallbackErrorMessage: "Failed to upload photo.",
  },
  async ({
    request,
    supabase,
    user,
    organizationId,
    access,
    formData,
    params,
  }) => {
    const { studentId } = params;
    const file = formData?.get("file");

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
      access,
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

    const [{ data: student }, { data: guardian }] = await Promise.all([
      admin
        .from("students")
        .select("first_name, last_name, family_id, families(name)")
        .eq("id", studentId)
        .maybeSingle(),
      supabase
        .from("guardians")
        .select("first_name, last_name")
        .eq("user_id", user.id)
        .eq("organization_id", organizationId)
        .maybeSingle(),
    ]);

    const studentName = [student?.first_name, student?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    const guardianName = [guardian?.first_name, guardian?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    const family = student?.families as
      { name?: string } | { name?: string }[] | null;
    const familyRow = Array.isArray(family) ? family[0] : family;
    const familyName =
      typeof familyRow?.name === "string" ? familyRow.name.trim() : null;

    void logParentPortalActivity(admin, {
      organizationId,
      actorUserId: user.id,
      actorEmail: user.email ?? null,
      actorName: guardianName || null,
      action: ACTIVITY_ACTIONS.PARENT_STUDENT_PROFILE_PHOTO_UPDATED,
      summary: `Updated profile photo for ${studentName || "student"}`,
      entityType: "student",
      entityId: studentId,
      metadata: {
        studentId,
        studentName: studentName || null,
        familyId: student?.family_id ? String(student.family_id) : null,
        familyName,
      },
      request,
    });

    return NextResponse.json({ profilePhotoUrl });
  },
);
