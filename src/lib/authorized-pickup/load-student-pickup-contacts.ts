import type { SupabaseClient } from "@supabase/supabase-js";
import { mapAuthorizedPickupContactRow } from "./map-row";
import { AuthorizedPickupValidationError } from "./mutations";
import type { AuthorizedPickupContact, AuthorizedPickupContactRow } from "./types";

const CONTACT_SELECT =
  "id, organization_id, student_id, family_id, first_name, last_name, relationship, phone, notes, is_active, created_at, updated_at";

export async function loadStudentAuthorizedPickupContacts(
  supabase: SupabaseClient,
  organizationId: string,
  studentId: string,
  options: { includeInactive?: boolean } = {},
): Promise<AuthorizedPickupContact[]> {
  let query = supabase
    .from("student_authorized_pickup_contacts")
    .select(CONTACT_SELECT)
    .eq("organization_id", organizationId)
    .eq("student_id", studentId)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (!options.includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) =>
    mapAuthorizedPickupContactRow(row as AuthorizedPickupContactRow),
  );
}

export async function loadAuthorizedPickupContact(
  supabase: SupabaseClient,
  organizationId: string,
  studentId: string,
  contactId: string,
): Promise<AuthorizedPickupContact> {
  const { data, error } = await supabase
    .from("student_authorized_pickup_contacts")
    .select(CONTACT_SELECT)
    .eq("organization_id", organizationId)
    .eq("student_id", studentId)
    .eq("id", contactId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new AuthorizedPickupValidationError(
      "Authorized pickup contact not found.",
      "not_found",
      404,
    );
  }

  return mapAuthorizedPickupContactRow(data as AuthorizedPickupContactRow);
}
