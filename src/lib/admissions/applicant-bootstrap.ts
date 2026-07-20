import type { SupabaseClient } from "@supabase/supabase-js";
import {
  parseApplicationFormFeeConfig,
  type ApplicationFormFeeConfig,
} from "./application-form-schema";

export type BootstrapApplicantInput = {
  userId: string;
  email: string;
  organizationId: string;
  formVersionId: string;
  firstName?: string;
  lastName?: string;
  forceNew?: boolean;
};

export type BootstrapApplicantAction = "resume" | "redirect_apply_dashboard";

export type BootstrapApplicantResult = {
  action: BootstrapApplicantAction;
  applicationId?: string;
  familyId: string;
  guardianId: string;
  membershipId: string;
  createdNewApplication?: boolean;
};

export class BootstrapApplicantError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "BootstrapApplicantError";
    this.code = code;
    this.status = status;
  }
}

function feeStatusFromConfig(feeConfig: ApplicationFormFeeConfig): string {
  return feeConfig.enabled ? "pending" : "not_required";
}

export async function bootstrapApplicant(
  admin: SupabaseClient,
  input: BootstrapApplicantInput,
): Promise<BootstrapApplicantResult> {
  const {
    userId,
    email,
    organizationId,
    formVersionId,
    firstName,
    lastName,
    forceNew = false,
  } = input;

  const { data: formRow, error: formError } = await admin
    .from("application_form_versions")
    .select("id, organization_id, program_id, fee_config")
    .eq("id", formVersionId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (formError) {
    throw new BootstrapApplicantError(formError.message, "form_lookup_failed", 500);
  }

  if (!formRow) {
    throw new BootstrapApplicantError(
      "Application form not found.",
      "form_not_found",
      404,
    );
  }

  const programId = formRow.program_id as string | null;
  if (!programId) {
    throw new BootstrapApplicantError(
      "This application form is not linked to a program. Contact the school to finish setup.",
      "missing_program",
      400,
    );
  }

  const feeConfig = parseApplicationFormFeeConfig(formRow.fee_config);

  let membershipId: string;

  const { data: existingMembership, error: membershipLookupError } = await admin
    .from("organization_memberships")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipLookupError) {
    throw new BootstrapApplicantError(
      membershipLookupError.message,
      "membership_lookup_failed",
      500,
    );
  }

  if (existingMembership) {
    membershipId = existingMembership.id as string;
  } else {
    const { data: newMembership, error: membershipInsertError } = await admin
      .from("organization_memberships")
      .insert({
        organization_id: organizationId,
        user_id: userId,
        role: "parent",
        status: "active",
      })
      .select("id")
      .single();

    if (membershipInsertError || !newMembership) {
      throw new BootstrapApplicantError(
        membershipInsertError?.message ?? "Failed to create membership.",
        "membership_insert_failed",
        500,
      );
    }

    membershipId = newMembership.id as string;
  }

  let guardianId: string;
  let familyId: string;

  const { data: existingGuardian, error: guardianLookupError } = await admin
    .from("guardians")
    .select("id, family_id")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (guardianLookupError) {
    throw new BootstrapApplicantError(
      guardianLookupError.message,
      "guardian_lookup_failed",
      500,
    );
  }

  if (existingGuardian) {
    guardianId = existingGuardian.id as string;
    familyId = existingGuardian.family_id as string;
  } else {
    const trimmedFirst = firstName?.trim() ?? "";
    const trimmedLast = lastName?.trim() ?? "";

    if (!trimmedFirst || !trimmedLast) {
      throw new BootstrapApplicantError(
        "First name and last name are required to create your account.",
        "missing_name",
        400,
      );
    }

    const familyName = `${trimmedLast} Family`;

    const { data: newFamily, error: familyInsertError } = await admin
      .from("families")
      .insert({
        organization_id: organizationId,
        name: familyName,
        primary_email: email,
      })
      .select("id")
      .single();

    if (familyInsertError || !newFamily) {
      throw new BootstrapApplicantError(
        familyInsertError?.message ?? "Failed to create family.",
        "family_insert_failed",
        500,
      );
    }

    familyId = newFamily.id as string;

    const { data: newGuardian, error: guardianInsertError } = await admin
      .from("guardians")
      .insert({
        organization_id: organizationId,
        family_id: familyId,
        user_id: userId,
        first_name: trimmedFirst,
        last_name: trimmedLast,
        email,
      })
      .select("id")
      .single();

    if (guardianInsertError || !newGuardian) {
      throw new BootstrapApplicantError(
        guardianInsertError?.message ?? "Failed to create guardian.",
        "guardian_insert_failed",
        500,
      );
    }

    guardianId = newGuardian.id as string;
  }

  const { data: existingApplications, error: applicationLookupError } = await admin
    .from("applications")
    .select("id")
    .eq("created_by_user_id", userId)
    .eq("form_version_id", formVersionId)
    .eq("status", "draft")
    .order("updated_at", { ascending: false })
    .limit(1);

  if (applicationLookupError) {
    throw new BootstrapApplicantError(
      applicationLookupError.message,
      "application_lookup_failed",
      500,
    );
  }

  const existingApplication = existingApplications?.[0];

  if (existingApplication && !forceNew) {
    return {
      action: "resume",
      applicationId: existingApplication.id as string,
      familyId,
      guardianId,
      membershipId,
      createdNewApplication: false,
    };
  }

  if (!forceNew) {
    const { data: submittedApplications, error: submittedLookupError } = await admin
      .from("applications")
      .select("id")
      .eq("created_by_user_id", userId)
      .eq("form_version_id", formVersionId)
      .neq("status", "draft")
      .limit(1);

    if (submittedLookupError) {
      throw new BootstrapApplicantError(
        submittedLookupError.message,
        "application_lookup_failed",
        500,
      );
    }

    if ((submittedApplications ?? []).length > 0) {
      return {
        action: "redirect_apply_dashboard",
        familyId,
        guardianId,
        membershipId,
        createdNewApplication: false,
      };
    }
  }

  const { data: newApplication, error: applicationInsertError } = await admin
    .from("applications")
    .insert({
      organization_id: organizationId,
      program_id: programId,
      form_version_id: formVersionId,
      family_id: familyId,
      primary_guardian_id: guardianId,
      created_by_user_id: userId,
      status: "draft",
      fee_status: feeStatusFromConfig(feeConfig),
    })
    .select("id")
    .single();

  if (applicationInsertError || !newApplication) {
    throw new BootstrapApplicantError(
      applicationInsertError?.message ?? "Failed to create application.",
      "application_insert_failed",
      500,
    );
  }

  return {
    action: "resume",
    applicationId: newApplication.id as string,
    familyId,
    guardianId,
    membershipId,
    createdNewApplication: true,
  };
}
