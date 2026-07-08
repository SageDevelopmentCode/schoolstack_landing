import type { SupabaseClient } from "@supabase/supabase-js";

export const ENROLLMENT_CHECKLIST_PATH = "enrollment";

export function publicEnrollmentChecklistPath(
  orgSlug: string,
  path = ENROLLMENT_CHECKLIST_PATH,
): string {
  return `/school/${orgSlug}/forms/${path}`;
}

export function enrollmentChecklistRelativePath(
  path = ENROLLMENT_CHECKLIST_PATH,
): string {
  return `/forms/${path}`;
}

export type EnrollmentChecklistTemplate = {
  id: string;
  organizationId: string;
  programId: string | null;
  name: string;
  enrollmentPath: string;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
};

function templateFromRow(row: Record<string, unknown>): EnrollmentChecklistTemplate {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    programId: row.program_id ? String(row.program_id) : null,
    name: String(row.name),
    enrollmentPath: String(row.enrollment_path),
    status: row.status as EnrollmentChecklistTemplate["status"],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function listEnrollmentChecklistTemplates(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<EnrollmentChecklistTemplate[]> {
  const { data, error } = await supabase
    .from("enrollment_checklist_templates")
    .select("*")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) =>
    templateFromRow(row as Record<string, unknown>),
  );
}

export async function orgHasEnrollmentChecklist(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("enrollment_checklist_templates")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("enrollment_path", ENROLLMENT_CHECKLIST_PATH)
    .in("status", ["draft", "published"])
    .limit(1);

  if (error) throw error;
  return (data ?? []).length > 0;
}

export async function createEnrollmentChecklistTemplate(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<EnrollmentChecklistTemplate> {
  const exists = await orgHasEnrollmentChecklist(supabase, organizationId);
  if (exists) {
    throw new Error("Your school already has an enrollment checklist.");
  }

  const { data, error } = await supabase
    .from("enrollment_checklist_templates")
    .insert({
      organization_id: organizationId,
      name: "Enrollment checklist",
      enrollment_path: ENROLLMENT_CHECKLIST_PATH,
      status: "draft",
    })
    .select("*")
    .single();

  if (error) throw error;
  return templateFromRow(data as Record<string, unknown>);
}

export async function getEnrollmentChecklistTemplate(
  supabase: SupabaseClient,
  id: string,
): Promise<EnrollmentChecklistTemplate | null> {
  const { data, error } = await supabase
    .from("enrollment_checklist_templates")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return templateFromRow(data as Record<string, unknown>);
}
