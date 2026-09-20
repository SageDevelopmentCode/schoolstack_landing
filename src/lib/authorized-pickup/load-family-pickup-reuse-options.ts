import type { SupabaseClient } from "@supabase/supabase-js";
import { loadStudentFamilyId } from "./load-student-family";
import { mapAuthorizedPickupContactRow } from "./map-row";
import type { AuthorizedPickupContact, AuthorizedPickupContactRow } from "./types";

const CONTACT_SELECT =
  "id, organization_id, student_id, family_id, first_name, last_name, relationship, phone, notes, is_active, created_at, updated_at";

export type FamilyPickupReuseOption = {
  studentId: string;
  studentName: string;
  contacts: AuthorizedPickupContact[];
};

function formatStudentName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || "Student";
}

export async function loadFamilyPickupReuseOptions(
  supabase: SupabaseClient,
  organizationId: string,
  targetStudentId: string,
): Promise<FamilyPickupReuseOption[]> {
  const familyId = await loadStudentFamilyId(supabase, organizationId, targetStudentId);

  const { data: siblings, error: siblingsError } = await supabase
    .from("students")
    .select("id, first_name, last_name")
    .eq("organization_id", organizationId)
    .eq("family_id", familyId)
    .neq("id", targetStudentId);

  if (siblingsError) throw siblingsError;
  if (!siblings?.length) return [];

  const siblingById = new Map(
    siblings.map((row) => [
      String(row.id),
      formatStudentName(
        row.first_name as string | null | undefined,
        row.last_name as string | null | undefined,
      ),
    ]),
  );
  const siblingIds = [...siblingById.keys()];
  if (siblingIds.length === 0) return [];

  const { data: contacts, error: contactsError } = await supabase
    .from("student_authorized_pickup_contacts")
    .select(CONTACT_SELECT)
    .eq("organization_id", organizationId)
    .in("student_id", siblingIds)
    .eq("is_active", true)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (contactsError) throw contactsError;

  const grouped = new Map<string, AuthorizedPickupContact[]>();
  for (const row of contacts ?? []) {
    const studentId = String((row as AuthorizedPickupContactRow).student_id);
    const mapped = mapAuthorizedPickupContactRow(row as AuthorizedPickupContactRow);
    const existing = grouped.get(studentId) ?? [];
    existing.push(mapped);
    grouped.set(studentId, existing);
  }

  return siblingIds
    .map((studentId) => {
      const studentContacts = grouped.get(studentId) ?? [];
      if (studentContacts.length === 0) return null;
      return {
        studentId,
        studentName: siblingById.get(studentId) ?? "Student",
        contacts: studentContacts,
      };
    })
    .filter((option): option is FamilyPickupReuseOption => option != null);
}
