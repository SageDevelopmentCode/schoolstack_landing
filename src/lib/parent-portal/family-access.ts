import type { SupabaseClient } from "@supabase/supabase-js";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";

/**
 * True when `familyId` is one of the families the signed-in user can act for in
 * this organization (their own guardian families plus linked-account logins).
 *
 * API routes that accept a `familyId` from the client must call this before
 * reading or writing family data, instead of relying on RLS alone.
 */
export async function userCanAccessFamily(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  familyId: string,
): Promise<boolean> {
  if (!familyId) return false;
  const familyIds = await getFamilyIdsForUser(supabase, userId, organizationId);
  return familyIds.includes(familyId);
}
