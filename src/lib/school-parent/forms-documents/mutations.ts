import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mapTeacherParentFormRow,
  TEACHER_PARENT_FORM_SELECT,
  type TeacherParentFormRow,
} from "@/lib/school-teacher/forms-documents/db-mapper";
import type { TeacherFormField } from "@/lib/school-teacher/forms-documents/types";
import { assertParentFormAccess } from "./load-parent-forms";
import type { ParentFormDetail, SubmitParentFormInput } from "./types";

function validateBuilderFieldValues(
  fields: TeacherFormField[],
  fieldValues: Record<string, string | boolean | string[]>,
): void {
  for (const field of fields) {
    if (!field.required) continue;

    const value = fieldValues[field.id];
    if (field.type === "checkbox") {
      if (value !== true) {
        throw new Error(`"${field.label}" is required.`);
      }
      continue;
    }

    if (field.type === "multiple_choice") {
      const selected = Array.isArray(value) ? value : [];
      if (selected.length === 0) {
        throw new Error(`"${field.label}" is required.`);
      }
      continue;
    }

    const text = typeof value === "string" ? value.trim() : "";
    if (!text) {
      throw new Error(`"${field.label}" is required.`);
    }
  }
}

function buildStoredResponses(
  detail: ParentFormDetail,
  input: SubmitParentFormInput,
): Record<string, unknown> {
  const now = new Date().toISOString();
  const signerName = input.signerName?.trim() ?? "";

  if (detail.form.formType === "upload") {
    if (detail.form.requireSignature && !signerName) {
      throw new Error("Type your full legal name to sign.");
    }

    return {
      signerName,
      signedAt: now,
    };
  }

  const fields = detail.form.fields ?? [];
  const fieldValues = input.fieldValues ?? {};
  validateBuilderFieldValues(fields, fieldValues);

  const signatureField = fields.find((field) => field.type === "signature");
  let signatureValue = "";
  if (signatureField) {
    const rawSignature = fieldValues[signatureField.id];
    signatureValue =
      typeof rawSignature === "string" ? rawSignature.trim() : "";
    if (signatureField.required && !signatureValue) {
      throw new Error("Type your full legal name to sign.");
    }
  }

  return {
    fields: fieldValues,
    signerName: signerName || signatureValue,
    signedAt: now,
  };
}

export async function submitParentFormResponse(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
  formId: string,
  input: SubmitParentFormInput,
): Promise<ParentFormDetail> {
  const detail = await assertParentFormAccess(
    admin,
    organizationId,
    familyId,
    formId,
  );

  if (detail.response.status === "signed") {
    throw new Error("This form has already been signed.");
  }

  const storedResponses = buildStoredResponses(detail, input);
  const now = new Date().toISOString();

  const { error: responseError } = await admin
    .from("teacher_parent_form_responses")
    .update({
      status: "signed",
      signed_at: now,
      responses: storedResponses,
      updated_at: now,
    })
    .eq("organization_id", organizationId)
    .eq("family_id", familyId)
    .eq("form_id", formId);

  if (responseError) throw responseError;

  const { data: formRow, error: formLoadError } = await admin
    .from("teacher_parent_forms")
    .select("signed_families")
    .eq("organization_id", organizationId)
    .eq("id", formId)
    .maybeSingle();

  if (formLoadError) throw formLoadError;

  const signedFamilies = Number(formRow?.signed_families ?? 0) + 1;
  const { error: formUpdateError } = await admin
    .from("teacher_parent_forms")
    .update({
      signed_families: signedFamilies,
      updated_at: now,
    })
    .eq("organization_id", organizationId)
    .eq("id", formId);

  if (formUpdateError) throw formUpdateError;

  const updated = await assertParentFormAccess(
    admin,
    organizationId,
    familyId,
    formId,
  );
  return updated;
}

export async function getParentFormUploadStoragePath(
  admin: SupabaseClient,
  organizationId: string,
  formId: string,
): Promise<{ storagePath: string; fileName: string }> {
  const { data, error } = await admin
    .from("teacher_parent_forms")
    .select(TEACHER_PARENT_FORM_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", formId)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Form not found.");

  const form = mapTeacherParentFormRow(data as TeacherParentFormRow);
  if (form.formType !== "upload") {
    throw new Error("Only uploaded documents can be downloaded.");
  }

  const config = (data as TeacherParentFormRow).config ?? {};
  const storagePath = config.upload?.storagePath;
  if (!storagePath) {
    throw new Error("No file is attached to this form.");
  }

  return {
    storagePath,
    fileName: config.upload?.fileName ?? form.uploadFileName ?? "document",
  };
}
