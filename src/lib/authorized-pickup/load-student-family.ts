import type { SupabaseClient } from "@supabase/supabase-js";
import { AuthorizedPickupValidationError } from "./mutations";

export async function loadStudentFamilyId(
  supabase: SupabaseClient,
  organizationId: string,
  studentId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("students")
    .select("family_id")
    .eq("id", studentId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;

  const familyId = data?.family_id ? String(data.family_id) : "";
  if (!familyId) {
    throw new AuthorizedPickupValidationError(
      "Student family not found.",
      "student_not_found",
      404,
    );
  }

  return familyId;
}
