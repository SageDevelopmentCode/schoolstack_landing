import type { SupabaseClient } from '@supabase/supabase-js';

export type FamilyGuardianRecord = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: string | null;
  isPrimary: boolean;
};

export async function listFamilyGuardians(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
  primaryGuardianId?: string | null,
): Promise<FamilyGuardianRecord[]> {
  const { data, error } = await supabase
    .from('guardians')
    .select('id, first_name, last_name, email, role')
    .eq('organization_id', organizationId)
    .eq('family_id', familyId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: String(row.id),
    firstName: row.first_name ? String(row.first_name) : null,
    lastName: row.last_name ? String(row.last_name) : null,
    email: row.email ? String(row.email) : null,
    role: row.role ? String(row.role) : null,
    isPrimary: primaryGuardianId != null && String(row.id) === primaryGuardianId,
  }));
}
