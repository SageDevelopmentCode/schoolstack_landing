import type { SupabaseClient } from "@supabase/supabase-js";

/** Student ids belonging to any of the given families (single org-scoped query). */
export async function getStudentIdsForFamilies(
  supabase: SupabaseClient,
  organizationId: string,
  familyIds: string[],
): Promise<string[]> {
  if (familyIds.length === 0) return [];

  const { data, error } = await supabase
    .from("students")
    .select("id")
    .eq("organization_id", organizationId)
    .in("family_id", familyIds);

  if (error) throw error;
  return (data ?? []).map((row) => String(row.id));
}
