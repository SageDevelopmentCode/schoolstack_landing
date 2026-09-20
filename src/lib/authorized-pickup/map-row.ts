import type {
  AuthorizedPickupContact,
  AuthorizedPickupContactRow,
} from "./types";

export function mapAuthorizedPickupContactRow(
  row: AuthorizedPickupContactRow,
): AuthorizedPickupContact {
  return {
    id: row.id,
    organizationId: row.organization_id,
    studentId: row.student_id,
    familyId: row.family_id,
    firstName: row.first_name,
    lastName: row.last_name,
    relationship: row.relationship,
    phone: row.phone,
    notes: row.notes,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function formatAuthorizedPickupContactName(
  contact: Pick<AuthorizedPickupContact, "firstName" | "lastName">,
): string {
  return [contact.firstName, contact.lastName].filter(Boolean).join(" ").trim();
}
