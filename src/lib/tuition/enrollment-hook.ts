import type { SupabaseClient } from "@supabase/supabase-js";
import { autoAssignTuitionForEnrollment } from "./assignments";

export async function tryAutoAssignTuitionForEnrollment(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    enrollmentId: string;
    familyId: string;
    programId: string;
    assignedByUserId?: string | null;
  },
): Promise<void> {
  try {
    await autoAssignTuitionForEnrollment(supabase, input);
  } catch (error) {
    console.error("Failed to auto-assign tuition for enrollment:", error);
  }
}
