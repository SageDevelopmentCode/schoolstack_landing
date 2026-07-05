import type { SupabaseClient } from "@supabase/supabase-js";
import {
  parseApplicationFormFeeConfig,
  validateApplicationFormSchema,
  type ApplicationFormSchema,
} from "./application-form-schema";

export type ApplicationRecord = {
  id: string;
  organizationId: string;
  programId: string;
  formVersionId: string;
  status: string;
  feeStatus: string;
  responses: Record<string, unknown>;
  acknowledgments: Record<string, boolean>;
};

function parseAcknowledgments(value: unknown): Record<string, boolean> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const result: Record<string, boolean> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    result[key] = Boolean(entry);
  }
  return result;
}

export async function getApplicationForSubmit(
  supabase: SupabaseClient,
  applicationId: string,
): Promise<ApplicationRecord | null> {
  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, organization_id, program_id, form_version_id, status, fee_status, responses, acknowledgments",
    )
    .eq("id", applicationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: String(data.id),
    organizationId: String(data.organization_id),
    programId: String(data.program_id),
    formVersionId: String(data.form_version_id),
    status: String(data.status),
    feeStatus: String(data.fee_status),
    responses: (data.responses as Record<string, unknown>) ?? {},
    acknowledgments: parseAcknowledgments(data.acknowledgments),
  };
}

export function validateAcknowledgmentsComplete(
  schema: ApplicationFormSchema,
  acknowledgments: Record<string, boolean>,
): string | null {
  for (const item of schema.acknowledgments) {
    if (!acknowledgments[item.id]) {
      return "Please confirm all acknowledgments before submitting.";
    }
  }
  return null;
}

export async function submitApplicationRecord(
  supabase: SupabaseClient,
  applicationId: string,
): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("applications")
    .update({
      status: "submitted",
      submitted_at: now,
    })
    .eq("id", applicationId)
    .eq("status", "draft");

  if (error) throw error;
}

export async function completeApplicationPaymentAndSubmit(
  supabase: SupabaseClient,
  applicationId: string,
): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("applications")
    .update({
      fee_status: "paid",
      fee_paid_at: now,
      status: "submitted",
      submitted_at: now,
    })
    .eq("id", applicationId)
    .eq("status", "draft");

  if (error) throw error;
}

export async function loadPublishedFormForApplication(
  supabase: SupabaseClient,
  application: ApplicationRecord,
): Promise<{
  schema: ApplicationFormSchema;
  feeConfig: ReturnType<typeof parseApplicationFormFeeConfig>;
  publicSlug: string | null;
}> {
  const { data, error } = await supabase
    .from("application_form_versions")
    .select("schema, fee_config, public_slug, status")
    .eq("id", application.formVersionId)
    .eq("organization_id", application.organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!data || data.status !== "published") {
    throw new Error("Application form is not available.");
  }

  const schema = data.schema as ApplicationFormSchema;
  const validationErrors = validateApplicationFormSchema(schema);
  if (validationErrors.length > 0) {
    throw new Error("Application form is incomplete.");
  }

  return {
    schema,
    feeConfig: parseApplicationFormFeeConfig(data.fee_config),
    publicSlug:
      typeof data.public_slug === "string" ? data.public_slug : null,
  };
}
