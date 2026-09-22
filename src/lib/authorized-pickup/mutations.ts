import type { SupabaseClient } from "@supabase/supabase-js";
import { mapAuthorizedPickupContactRow } from "./map-row";
import type {
  AuthorizedPickupContact,
  AuthorizedPickupContactInput,
  AuthorizedPickupContactRow,
} from "./types";

export class AuthorizedPickupValidationError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "AuthorizedPickupValidationError";
    this.code = code;
    this.status = status;
  }
}

function normalizeText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export function validateAuthorizedPickupContactInput(
  input: AuthorizedPickupContactInput,
): AuthorizedPickupContactInput {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  if (!firstName) {
    throw new AuthorizedPickupValidationError(
      "First name is required.",
      "missing_first_name",
      400,
    );
  }

  if (!lastName) {
    throw new AuthorizedPickupValidationError(
      "Last name is required.",
      "missing_last_name",
      400,
    );
  }

  return {
    firstName,
    lastName,
    relationship: normalizeText(input.relationship),
    phone: normalizeText(input.phone),
    notes: normalizeText(input.notes),
  };
}

type CreateAuthorizedPickupContactContext = {
  organizationId: string;
  studentId: string;
  familyId: string;
  userId: string;
  guardianId: string | null;
};

export async function createAuthorizedPickupContact(
  supabase: SupabaseClient,
  context: CreateAuthorizedPickupContactContext,
  input: AuthorizedPickupContactInput,
): Promise<AuthorizedPickupContact> {
  const validated = validateAuthorizedPickupContactInput(input);

  const { data, error } = await supabase
    .from("student_authorized_pickup_contacts")
    .insert({
      organization_id: context.organizationId,
      student_id: context.studentId,
      family_id: context.familyId,
      first_name: validated.firstName,
      last_name: validated.lastName,
      relationship: validated.relationship,
      phone: validated.phone,
      notes: validated.notes,
      is_active: true,
      created_by_guardian_id: context.guardianId,
      created_by_user_id: context.userId,
    })
    .select(
      "id, organization_id, student_id, family_id, first_name, last_name, relationship, phone, notes, is_active, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create authorized pickup contact.");
  }

  return mapAuthorizedPickupContactRow(data as AuthorizedPickupContactRow);
}

export async function updateAuthorizedPickupContact(
  supabase: SupabaseClient,
  organizationId: string,
  studentId: string,
  contactId: string,
  input: AuthorizedPickupContactInput,
): Promise<AuthorizedPickupContact> {
  const validated = validateAuthorizedPickupContactInput(input);

  const { data, error } = await supabase
    .from("student_authorized_pickup_contacts")
    .update({
      first_name: validated.firstName,
      last_name: validated.lastName,
      relationship: validated.relationship,
      phone: validated.phone,
      notes: validated.notes,
    })
    .eq("id", contactId)
    .eq("organization_id", organizationId)
    .eq("student_id", studentId)
    .eq("is_active", true)
    .select(
      "id, organization_id, student_id, family_id, first_name, last_name, relationship, phone, notes, is_active, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new AuthorizedPickupValidationError(
      "Authorized pickup contact not found.",
      "not_found",
      404,
    );
  }

  return mapAuthorizedPickupContactRow(data as AuthorizedPickupContactRow);
}

export async function deactivateAuthorizedPickupContact(
  supabase: SupabaseClient,
  organizationId: string,
  studentId: string,
  contactId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("student_authorized_pickup_contacts")
    .update({ is_active: false })
    .eq("id", contactId)
    .eq("organization_id", organizationId)
    .eq("student_id", studentId)
    .eq("is_active", true)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new AuthorizedPickupValidationError(
      "Authorized pickup contact not found.",
      "not_found",
      404,
    );
  }
}
