import type { SupabaseClient } from "@supabase/supabase-js";
import { createOrGetConfirmedAuthUser } from "@/lib/admin/auth-users";

export type FamilyGuardianRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  userId: string | null;
  relationship: string | null;
  isLinked: boolean;
  hasEverSignedIn?: boolean;
  lastSignInAt?: string | null;
};

export class FamilyGuardianError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "FamilyGuardianError";
    this.code = code;
    this.status = status;
  }
}

function mapGuardianRow(row: Record<string, unknown>): FamilyGuardianRecord {
  const userId =
    row.user_id != null && String(row.user_id).trim() !== ""
      ? String(row.user_id)
      : null;

  return {
    id: String(row.id),
    firstName: String(row.first_name ?? ""),
    lastName: String(row.last_name ?? ""),
    email: typeof row.email === "string" ? row.email : null,
    userId,
    relationship: typeof row.relationship === "string" ? row.relationship : null,
    isLinked: userId != null,
  };
}

export async function listFamilyGuardians(
  admin: SupabaseClient,
  familyId: string,
): Promise<FamilyGuardianRecord[]> {
  const { data, error } = await admin
    .from("guardians")
    .select("id, first_name, last_name, email, user_id, relationship")
    .eq("family_id", familyId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) =>
    mapGuardianRow(row as Record<string, unknown>),
  );
}

export type AddFamilyGuardianInput = {
  organizationId: string;
  familyId: string;
  email: string;
  firstName: string;
  lastName: string;
  relationship?: string;
};

export type RemoveFamilyGuardianInput = {
  organizationId: string;
  familyId: string;
  guardianId: string;
};

export async function removeFamilyGuardianAccess(
  admin: SupabaseClient,
  input: RemoveFamilyGuardianInput,
): Promise<void> {
  const { organizationId, familyId, guardianId } = input;

  const { data: guardian, error: guardianError } = await admin
    .from("guardians")
    .select("id, family_id, organization_id, user_id")
    .eq("id", guardianId)
    .maybeSingle();

  if (guardianError) {
    throw new FamilyGuardianError(
      guardianError.message,
      "guardian_lookup_failed",
      500,
    );
  }

  if (
    !guardian ||
    String(guardian.family_id) !== familyId ||
    String(guardian.organization_id) !== organizationId
  ) {
    throw new FamilyGuardianError(
      "Guardian not found.",
      "guardian_not_found",
      404,
    );
  }

  const { data: familyGuardians, error: familyGuardiansError } = await admin
    .from("guardians")
    .select("id")
    .eq("family_id", familyId);

  if (familyGuardiansError) {
    throw new FamilyGuardianError(
      familyGuardiansError.message,
      "guardian_lookup_failed",
      500,
    );
  }

  if ((familyGuardians ?? []).length <= 1) {
    throw new FamilyGuardianError(
      "Cannot remove the only guardian on this family.",
      "sole_guardian",
      409,
    );
  }

  const { data: primaryApplications, error: primaryApplicationsError } = await admin
    .from("applications")
    .select("id")
    .eq("family_id", familyId)
    .eq("primary_guardian_id", guardianId)
    .limit(1);

  if (primaryApplicationsError) {
    throw new FamilyGuardianError(
      primaryApplicationsError.message,
      "application_lookup_failed",
      500,
    );
  }

  if ((primaryApplications ?? []).length > 0) {
    throw new FamilyGuardianError(
      "Cannot remove the primary contact for this family.",
      "primary_guardian",
      409,
    );
  }

  const userId =
    guardian.user_id != null && String(guardian.user_id).trim() !== ""
      ? String(guardian.user_id)
      : null;

  const { error: deleteError } = await admin
    .from("guardians")
    .delete()
    .eq("id", guardianId);

  if (deleteError) {
    throw new FamilyGuardianError(
      deleteError.message,
      "guardian_delete_failed",
      500,
    );
  }

  if (!userId) {
    return;
  }

  const { data: remainingGuardians, error: remainingGuardiansError } = await admin
    .from("guardians")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .limit(1);

  if (remainingGuardiansError) {
    throw new FamilyGuardianError(
      remainingGuardiansError.message,
      "guardian_lookup_failed",
      500,
    );
  }

  if ((remainingGuardians ?? []).length > 0) {
    return;
  }

  const { data: membership, error: membershipLookupError } = await admin
    .from("organization_memberships")
    .select("id, role, status")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipLookupError) {
    throw new FamilyGuardianError(
      membershipLookupError.message,
      "membership_lookup_failed",
      500,
    );
  }

  if (!membership || membership.role !== "parent") {
    return;
  }

  if (membership.status === "disabled") {
    return;
  }

  const { error: membershipUpdateError } = await admin
    .from("organization_memberships")
    .update({ status: "disabled" })
    .eq("id", membership.id);

  if (membershipUpdateError) {
    throw new FamilyGuardianError(
      membershipUpdateError.message,
      "membership_update_failed",
      500,
    );
  }
}

export async function addFamilyGuardianAccess(
  admin: SupabaseClient,
  input: AddFamilyGuardianInput,
): Promise<FamilyGuardianRecord> {
  const { organizationId, familyId } = input;
  const normalizedEmail = input.email.trim().toLowerCase();
  const trimmedFirst = input.firstName.trim();
  const trimmedLast = input.lastName.trim();
  const trimmedRelationship = input.relationship?.trim() ?? "";

  if (!normalizedEmail) {
    throw new FamilyGuardianError(
      "Email is required.",
      "missing_email",
      400,
    );
  }

  if (!trimmedFirst || !trimmedLast) {
    throw new FamilyGuardianError(
      "First name and last name are required.",
      "missing_name",
      400,
    );
  }

  const { data: family, error: familyError } = await admin
    .from("families")
    .select("id, organization_id")
    .eq("id", familyId)
    .maybeSingle();

  if (familyError) {
    throw new FamilyGuardianError(
      familyError.message,
      "family_lookup_failed",
      500,
    );
  }

  if (!family || String(family.organization_id) !== organizationId) {
    throw new FamilyGuardianError(
      "Family not found.",
      "family_not_found",
      404,
    );
  }

  const { data: sameFamilyGuardians, error: sameFamilyError } = await admin
    .from("guardians")
    .select("id, email, user_id, family_id")
    .eq("family_id", familyId);

  if (sameFamilyError) {
    throw new FamilyGuardianError(
      sameFamilyError.message,
      "guardian_lookup_failed",
      500,
    );
  }

  const emailMatchOnFamily = (sameFamilyGuardians ?? []).find(
    (row) => String(row.email ?? "").trim().toLowerCase() === normalizedEmail,
  );

  if (emailMatchOnFamily?.user_id) {
    throw new FamilyGuardianError(
      "This email already has portal access for this family.",
      "duplicate_guardian",
      409,
    );
  }

  const authUser = await createOrGetConfirmedAuthUser(admin, {
    email: normalizedEmail,
    firstName: trimmedFirst,
    lastName: trimmedLast,
  });

  const { data: orgGuardians, error: orgGuardianError } = await admin
    .from("guardians")
    .select("id, family_id, user_id")
    .eq("organization_id", organizationId)
    .eq("user_id", authUser.id);

  if (orgGuardianError) {
    throw new FamilyGuardianError(
      orgGuardianError.message,
      "guardian_lookup_failed",
      500,
    );
  }

  const conflictingFamily = (orgGuardians ?? []).find(
    (row) => String(row.family_id) !== familyId,
  );

  if (conflictingFamily) {
    throw new FamilyGuardianError(
      "This person is already linked to a different family at this school. Contact support if they need access here.",
      "guardian_other_family",
      409,
    );
  }

  const existingOnFamily = (orgGuardians ?? []).find(
    (row) => String(row.family_id) === familyId,
  );

  if (existingOnFamily) {
    throw new FamilyGuardianError(
      "This person already has portal access for this family.",
      "duplicate_guardian",
      409,
    );
  }

  let guardianRow: Record<string, unknown>;

  if (emailMatchOnFamily && !emailMatchOnFamily.user_id) {
    const { data: updated, error: updateError } = await admin
      .from("guardians")
      .update({
        user_id: authUser.id,
        first_name: trimmedFirst,
        last_name: trimmedLast,
        email: normalizedEmail,
        relationship: trimmedRelationship || null,
      })
      .eq("id", emailMatchOnFamily.id)
      .select("id, first_name, last_name, email, user_id, relationship")
      .single();

    if (updateError || !updated) {
      throw new FamilyGuardianError(
        updateError?.message ?? "Failed to update guardian.",
        "guardian_update_failed",
        500,
      );
    }

    guardianRow = updated as Record<string, unknown>;
  } else {
    const { data: inserted, error: insertError } = await admin
      .from("guardians")
      .insert({
        organization_id: organizationId,
        family_id: familyId,
        user_id: authUser.id,
        first_name: trimmedFirst,
        last_name: trimmedLast,
        email: normalizedEmail,
        relationship: trimmedRelationship || null,
      })
      .select("id, first_name, last_name, email, user_id, relationship")
      .single();

    if (insertError || !inserted) {
      throw new FamilyGuardianError(
        insertError?.message ?? "Failed to create guardian.",
        "guardian_insert_failed",
        500,
      );
    }

    guardianRow = inserted as Record<string, unknown>;
  }

  const { data: existingMembership, error: membershipLookupError } = await admin
    .from("organization_memberships")
    .select("id, role, status")
    .eq("organization_id", organizationId)
    .eq("user_id", authUser.id)
    .maybeSingle();

  if (membershipLookupError) {
    throw new FamilyGuardianError(
      membershipLookupError.message,
      "membership_lookup_failed",
      500,
    );
  }

  if (!existingMembership) {
    const { error: membershipInsertError } = await admin
      .from("organization_memberships")
      .insert({
        organization_id: organizationId,
        user_id: authUser.id,
        role: "parent",
        status: "active",
      });

    if (membershipInsertError) {
      throw new FamilyGuardianError(
        membershipInsertError.message,
        "membership_insert_failed",
        500,
      );
    }
  } else if (existingMembership.role === "parent") {
    if (existingMembership.status !== "active") {
      const { error: membershipUpdateError } = await admin
        .from("organization_memberships")
        .update({ status: "active" })
        .eq("id", existingMembership.id);

      if (membershipUpdateError) {
        throw new FamilyGuardianError(
          membershipUpdateError.message,
          "membership_update_failed",
          500,
        );
      }
    }
  }

  return mapGuardianRow(guardianRow);
}
