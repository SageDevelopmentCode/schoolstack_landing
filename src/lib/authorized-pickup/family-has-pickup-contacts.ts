import type { SupabaseClient } from "@supabase/supabase-js";

export async function familyHasAnyAuthorizedPickupContacts(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
  studentIds: string[],
): Promise<boolean> {
  if (studentIds.length === 0) return false;

  const { data, error } = await supabase
    .from("student_authorized_pickup_contacts")
    .select("student_id")
    .eq("organization_id", organizationId)
    .eq("family_id", familyId)
    .eq("is_active", true)
    .in("student_id", studentIds)
    .limit(1);

  if (error) throw error;
  return (data ?? []).length > 0;
}
