import type { SupabaseClient } from "@supabase/supabase-js";
import {
  extractStudentFromResponses,
  validateStudentResponses,
} from "./apply-system-fields";

export class ApplicationMaterializationError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApplicationMaterializationError";
    this.code = code;
    this.status = status;
  }
}

export async function materializeApplicationStudent(
  admin: SupabaseClient,
  applicationId: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from("applications")
    .select("id, organization_id, family_id, student_id, responses, status")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new ApplicationMaterializationError(
      "Application not found.",
      "not_found",
      404,
    );
  }

  if (data.student_id) {
    return String(data.student_id);
  }

  const familyId = data.family_id ? String(data.family_id) : null;
  if (!familyId) {
    throw new ApplicationMaterializationError(
      "Application is missing a family record.",
      "missing_family",
      500,
    );
  }

  const validationError = validateStudentResponses(data.responses);
  if (validationError) {
    throw new ApplicationMaterializationError(
      validationError,
      "student_fields_incomplete",
      400,
    );
  }

  const student = extractStudentFromResponses(data.responses);
  if (!student) {
    throw new ApplicationMaterializationError(
      "Please complete all student information fields before submitting.",
      "student_fields_incomplete",
      400,
    );
  }

  const { data: newStudent, error: insertError } = await admin
    .from("students")
    .insert({
      organization_id: String(data.organization_id),
      family_id: familyId,
      first_name: student.firstName,
      last_name: student.lastName,
      date_of_birth: student.dateOfBirth,
      grade: student.grade,
      status: "prospect",
    })
    .select("id")
    .single();

  if (insertError || !newStudent) {
    throw new ApplicationMaterializationError(
      insertError?.message ?? "Failed to create student record.",
      "student_insert_failed",
      500,
    );
  }

  const studentId = String(newStudent.id);
  const { error: updateError } = await admin
    .from("applications")
    .update({ student_id: studentId })
    .eq("id", applicationId);

  if (updateError) {
    throw new ApplicationMaterializationError(
      updateError.message,
      "application_update_failed",
      500,
    );
  }

  return studentId;
}
