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

export async function loadApplyProgramPickerData(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<{
  forms: ApplicationFormVersion[];
  programsById: Map<string, string>;
}> {
  const forms = await listPublishedApplyForms(supabase, organizationId);
  const programIds = [
    ...new Set(
      forms
        .map((form) => form.program_id)
        .filter((programId): programId is string => Boolean(programId)),
    ),
  ];

  let programsById = new Map<string, string>();
  if (programIds.length > 0) {
    const { data, error } = await supabase
      .from("programs")
      .select("id, name")
      .eq("organization_id", organizationId)
      .in("id", programIds);

    if (error) throw error;
    programsById = buildProgramsByIdMap(
      (data ?? []).map((row) => ({
        id: String(row.id),
        name: String(row.name),
      })),
    );
  }

  return { forms, programsById };
}
