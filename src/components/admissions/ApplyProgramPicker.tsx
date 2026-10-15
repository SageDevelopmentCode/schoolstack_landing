import { listPublishedApplyForms } from "@/lib/admissions/application-forms";
import type { ApplicationFormVersion } from "@/lib/admissions/application-form-schema";
import type { SupabaseClient } from "@supabase/supabase-js";

type ProgramRow = {
  id: string;
  name: string;
};

export function buildProgramsByIdMap(rows: ProgramRow[]): Map<string, string> {
  return new Map(rows.map((row) => [row.id, row.name]));
}

export async function loadProgramsByIdForApplyForms(
  supabase: SupabaseClient,
  organizationId: string,
  forms: ApplicationFormVersion[],
): Promise<Map<string, string>> {
  const programIds = [
    ...new Set(
      forms
        .map((form) => form.program_id)
        .filter((programId): programId is string => Boolean(programId)),
    ),
  ];

  if (programIds.length === 0) {
    return new Map<string, string>();
  }

  const { data, error } = await supabase
    .from("programs")
    .select("id, name")
    .eq("organization_id", organizationId)
    .in("id", programIds);

  if (error) throw error;
  return buildProgramsByIdMap(
    (data ?? []).map((row) => ({
      id: String(row.id),
      name: String(row.name),
    })),
  );
}

/** @deprecated Prefer resolve entry + loadProgramsByIdForApplyForms to avoid duplicate form queries. */
export async function loadApplyProgramPickerData(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<{
  forms: ApplicationFormVersion[];
  programsById: Map<string, string>;
}> {
  const forms = await listPublishedApplyForms(supabase, organizationId);
  const programsById = await loadProgramsByIdForApplyForms(
    supabase,
    organizationId,
    forms,
  );
  return { forms, programsById };
}
