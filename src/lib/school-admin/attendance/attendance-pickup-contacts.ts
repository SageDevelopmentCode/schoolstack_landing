import type { SupabaseClient } from "@supabase/supabase-js";
import { listFamilyGuardians } from "@/lib/admissions/family-guardians";
import { formatAuthorizedPickupContactName } from "@/lib/authorized-pickup/map-row";
import { loadStudentAuthorizedPickupContacts } from "@/lib/authorized-pickup/load-student-pickup-contacts";
import type { AttendancePickupContact } from "./attendance-types";

export function formatAttendancePickupContactName(
  contact: Pick<AttendancePickupContact, "firstName" | "lastName">,
): string {
  return formatAuthorizedPickupContactName(contact);
}

export async function loadAttendancePickupContacts(
  admin: SupabaseClient,
  organizationId: string,
  studentId: string,
  familyId: string,
): Promise<AttendancePickupContact[]> {
  const [guardians, authorizedContacts] = await Promise.all([
    listFamilyGuardians(admin, familyId),
    loadStudentAuthorizedPickupContacts(admin, organizationId, studentId),
  ]);

  const guardianContacts: AttendancePickupContact[] = guardians
    .filter((guardian) => guardian.isLinked)
    .map((guardian) => ({
      id: guardian.id,
      source: "guardian",
      firstName: guardian.firstName,
      lastName: guardian.lastName,
      relationship: guardian.relationship,
      email: guardian.email,
      phone: null,
    }));

  const authorizedPickupContacts: AttendancePickupContact[] = authorizedContacts.map(
    (contact) => ({
      id: contact.id,
      source: "authorized_contact",
      firstName: contact.firstName,
      lastName: contact.lastName,
      relationship: contact.relationship,
      email: null,
      phone: contact.phone,
    }),
  );

  return [...guardianContacts, ...authorizedPickupContacts].sort((left, right) =>
    formatAttendancePickupContactName(left).localeCompare(
      formatAttendancePickupContactName(right),
    ),
  );
}

export async function resolveAttendancePickupSelection(
  admin: SupabaseClient,
  organizationId: string,
  studentId: string,
  familyId: string,
  source: AttendancePickupContact["source"],
  contactId: string,
): Promise<{ pickedUpByName: string; guardianId: string | null; authorizedContactId: string | null }> {
  const contacts = await loadAttendancePickupContacts(
    admin,
    organizationId,
    studentId,
    familyId,
  );
  const match = contacts.find(
    (contact) => contact.id === contactId && contact.source === source,
  );

  if (!match) {
    throw new Error("Pickup contact not found for this student.");
  }

  const pickedUpByName = formatAttendancePickupContactName(match);

  return {
    pickedUpByName,
    guardianId: source === "guardian" ? contactId : null,
    authorizedContactId: source === "authorized_contact" ? contactId : null,
  };
}
