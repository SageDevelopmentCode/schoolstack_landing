import type { SupabaseClient } from "@supabase/supabase-js";
import {
  applicationFormFromRow,
  defaultApplicationFormFeeConfig,
  emptyApplicationFormSchema,
  emptyApplicationSection,
  schemaToDbJson,
  type ApplicationFormFeeConfig,
  type ApplicationFormSchema,
  type ApplicationFormVersion,
} from "./application-form-schema";

export type ProgramOption = {
  id: string;
  name: string;
};

async function nextVersion(
  supabase: SupabaseClient,
  organizationId: string,
  programId: string | null,
): Promise<number> {
  let query = supabase
    .from("application_form_versions")
    .select("version")
    .eq("organization_id", organizationId)
    .order("version", { ascending: false })
    .limit(1);

  if (programId) {
    query = query.eq("program_id", programId);
  } else {
    query = query.is("program_id", null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data?.[0]?.version ?? 0) + 1;
}

export async function listApplicationForms(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<ApplicationFormVersion[]> {
  const { data, error } = await supabase
    .from("application_form_versions")
    .select("*")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) =>
    applicationFormFromRow(row as Record<string, unknown>),
  );
}

export async function getApplicationForm(
  supabase: SupabaseClient,
  id: string,
): Promise<ApplicationFormVersion | null> {
  const { data, error } = await supabase
    .from("application_form_versions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return applicationFormFromRow(data as Record<string, unknown>);
}

export async function listPrograms(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<ProgramOption[]> {
  const { data, error } = await supabase
    .from("programs")
    .select("id, name")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ProgramOption[];
}

export async function createDraftForm(
  supabase: SupabaseClient,
  organizationId: string,
  input: { title?: string; programId?: string | null } = {},
): Promise<ApplicationFormVersion> {
  const programId = input.programId ?? null;
  const version = await nextVersion(supabase, organizationId, programId);
  const schema = emptyApplicationFormSchema();
  schema.sections.push(emptyApplicationSection());

  const { data, error } = await supabase
    .from("application_form_versions")
    .insert({
      organization_id: organizationId,
      program_id: programId,
      version,
      status: "draft",
      title: input.title?.trim() || "New Application Form",
      intro: null,
      schema: schemaToDbJson(schema),
      fee_config: defaultApplicationFormFeeConfig(),
    })
    .select("*")
    .single();

  if (error) throw error;
  return applicationFormFromRow(data as Record<string, unknown>);
}

export type UpdateDraftFormInput = {
  title?: string;
  intro?: string | null;
  program_id?: string | null;
  schema?: ApplicationFormSchema;
  fee_config?: ApplicationFormFeeConfig;
};

export async function updateDraftForm(
  supabase: SupabaseClient,
  id: string,
  input: UpdateDraftFormInput,
): Promise<ApplicationFormVersion> {
  const existing = await getApplicationForm(supabase, id);
  if (!existing) throw new Error("Application form not found.");
  if (existing.status !== "draft") {
    throw new Error("Only draft forms can be edited. Duplicate to create a new draft.");
  }

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.intro !== undefined) patch.intro = input.intro;
  if (input.program_id !== undefined) patch.program_id = input.program_id;
  if (input.schema !== undefined) patch.schema = schemaToDbJson(input.schema);
  if (input.fee_config !== undefined) patch.fee_config = input.fee_config;

  const { data, error } = await supabase
    .from("application_form_versions")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return applicationFormFromRow(data as Record<string, unknown>);
}

export async function publishForm(
  supabase: SupabaseClient,
  id: string,
): Promise<ApplicationFormVersion> {
  const existing = await getApplicationForm(supabase, id);
  if (!existing) throw new Error("Application form not found.");
  if (existing.status !== "draft") {
    throw new Error("Only draft forms can be published.");
  }

  let archiveQuery = supabase
    .from("application_form_versions")
    .update({ status: "archived" })
    .eq("organization_id", existing.organization_id)
    .eq("status", "published");

  if (existing.program_id) {
    archiveQuery = archiveQuery.eq("program_id", existing.program_id);
  } else {
    archiveQuery = archiveQuery.is("program_id", null);
  }

  const { error: archiveError } = await archiveQuery;
  if (archiveError) throw archiveError;

  const { data, error } = await supabase
    .from("application_form_versions")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return applicationFormFromRow(data as Record<string, unknown>);
}

export async function duplicateForm(
  supabase: SupabaseClient,
  id: string,
): Promise<ApplicationFormVersion> {
  const existing = await getApplicationForm(supabase, id);
  if (!existing) throw new Error("Application form not found.");

  const version = await nextVersion(
    supabase,
    existing.organization_id,
    existing.program_id,
  );

  const { data, error } = await supabase
    .from("application_form_versions")
    .insert({
      organization_id: existing.organization_id,
      program_id: existing.program_id,
      version,
      status: "draft",
      title: `${existing.title} (copy)`,
      intro: existing.intro,
      schema: schemaToDbJson(existing.schema),
      fee_config: existing.fee_config,
    })
    .select("*")
    .single();

  if (error) throw error;
  return applicationFormFromRow(data as Record<string, unknown>);
}
