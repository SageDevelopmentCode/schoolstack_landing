import type { SupabaseClient } from "@supabase/supabase-js";
import type { ApplicationFormSchema } from "./application-form-schema";

const PROGRESS_KEY = "__progress";

export type CopyableApplication = {
  id: string;
  submittedAt: string | null;
  label: string;
};

function parseStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (key === PROGRESS_KEY) continue;
    if (typeof entry === "string") {
      result[key] = entry;
    } else if (entry != null) {
      result[key] = String(entry);
    }
  }
  return result;
}

function formatCopyableLabel(submittedAt: string | null, responses: Record<string, string>): string {
  const dateLabel = submittedAt
    ? new Date(submittedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Previous application";

  const nameKeys = ["student_first_name", "student_name", "child_first_name", "first_name"];
  for (const key of nameKeys) {
    const value = responses[key]?.trim();
    if (value) {
      return `${value} · ${dateLabel}`;
    }
  }

  return dateLabel;
}

export function copyableFieldIds(schema: ApplicationFormSchema): string[] {
  const ids: string[] = [];
  for (const section of schema.sections) {
    for (const field of section.fields) {
      if (field.type !== "file") {
        ids.push(field.id);
      }
    }
  }
  return ids;
}

export function pickResponsesForCopy(
  source: Record<string, string>,
  schema: ApplicationFormSchema,
  fieldIds?: string[],
): Record<string, string> {
  const allowed = new Set(fieldIds ?? copyableFieldIds(schema));
  const result: Record<string, string> = {};

  for (const fieldId of allowed) {
    const value = source[fieldId];
    if (value) {
      result[fieldId] = value;
    }
  }

  return result;
}

export async function listCopyableApplications(
  supabase: SupabaseClient,
  organizationId: string,
  formVersionId: string,
  excludeApplicationId?: string,
): Promise<CopyableApplication[]> {
  let query = supabase
    .from("applications")
    .select("id, submitted_at, responses")
    .eq("organization_id", organizationId)
    .eq("form_version_id", formVersionId)
    .neq("status", "draft")
    .order("submitted_at", { ascending: false });

  if (excludeApplicationId) {
    query = query.neq("id", excludeApplicationId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => {
    const responses = parseStringRecord(row.responses);
    return {
      id: String(row.id),
      submittedAt: row.submitted_at ? String(row.submitted_at) : null,
      label: formatCopyableLabel(
        row.submitted_at ? String(row.submitted_at) : null,
        responses,
      ),
    };
  });
}

export async function getApplicationResponsesForCopy(
  supabase: SupabaseClient,
  sourceApplicationId: string,
): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from("applications")
    .select("responses, status")
    .eq("id", sourceApplicationId)
    .maybeSingle();

  if (error) throw error;
  if (!data || data.status === "draft") {
    throw new Error("Source application is not available to copy from.");
  }

  return parseStringRecord(data.responses);
}

export async function loadPriorResponsesByField(
  supabase: SupabaseClient,
  organizationId: string,
  formVersionId: string,
  fieldId: string,
  excludeApplicationId?: string,
): Promise<{ applicationId: string; value: string } | null> {
  const copyable = await listCopyableApplications(
    supabase,
    organizationId,
    formVersionId,
    excludeApplicationId,
  );

  for (const application of copyable) {
    const responses = await getApplicationResponsesForCopy(supabase, application.id);
    const value = responses[fieldId];
    if (value) {
      return { applicationId: application.id, value };
    }
  }

  return null;
}
