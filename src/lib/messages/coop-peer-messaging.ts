import type { SupabaseClient } from "@supabase/supabase-js";

async function familyHasEnrolledStudentInProgram(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
  programId: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from("enrollments")
    .select("id, students!inner(family_id)")
    .eq("organization_id", organizationId)
    .eq("program_id", programId)
    .eq("status", "enrolled")
    .eq("students.family_id", familyId)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return Boolean(data?.id);
}

export async function assertCoopPeerMessageAllowed(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    programId: string;
    fromFamilyId: string;
    toGuardianId: string;
  },
): Promise<void> {
  const programId = input.programId.trim();
  if (!programId) {
    throw new Error("Program context is required to message co-op families.");
  }

  const { data: guardian, error: guardianError } = await admin
    .from("guardians")
    .select("id, family_id")
    .eq("organization_id", input.organizationId)
    .eq("id", input.toGuardianId)
    .maybeSingle();

  if (guardianError) throw new Error(guardianError.message);
  if (!guardian?.family_id) {
    throw new Error("That family is not available for messaging.");
  }

  const toFamilyId = String(guardian.family_id);
  if (toFamilyId === input.fromFamilyId) {
    throw new Error("You cannot message your own family.");
  }

  const [fromEnrolled, toEnrolled] = await Promise.all([
    familyHasEnrolledStudentInProgram(
      admin,
      input.organizationId,
      input.fromFamilyId,
      programId,
    ),
    familyHasEnrolledStudentInProgram(
      admin,
      input.organizationId,
      toFamilyId,
      programId,
    ),
  ]);

  if (!fromEnrolled || !toEnrolled) {
    throw new Error("You can only message families enrolled in this co-op.");
  }
}
