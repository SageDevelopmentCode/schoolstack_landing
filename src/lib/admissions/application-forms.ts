import type { SupabaseClient } from "@supabase/supabase-js";
import {
  applicationFormFromRow,
  defaultApplicationFormFeeConfig,
  emptyApplicationFormSchema,
  emptyApplicationSection,
  normalizePublicSlug,
  schemaToDbJson,
  slugifyFormTitle,
  validatePublicSlug,
  type ApplicationFormFeeConfig,
  type ApplicationFormSchema,
  type ApplicationFormVersion,
} from "./application-form-schema";

export type ProgramOption = {
  id: string;
  name: string;
};

export function publicApplicationFormPath(
  orgSlug: string,
  formSlug: string,
): string {
  return `/school/${orgSlug}/forms/${formSlug}`;
}

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

export async function getPublishedApplicationFormBySlug(
  supabase: SupabaseClient,
  organizationId: string,
  publicSlug: string,
): Promise<ApplicationFormVersion | null> {
  const normalizedSlug = normalizePublicSlug(publicSlug);
  if (!normalizedSlug) return null;

  const { data, error } = await supabase
    .from("application_form_versions")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("public_slug", normalizedSlug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return applicationFormFromRow(data as Record<string, unknown>);
}

export async function isPublicSlugAvailable(
  supabase: SupabaseClient,
  organizationId: string,
  publicSlug: string,
  excludeFormId?: string,
): Promise<boolean> {
  const normalizedSlug = normalizePublicSlug(publicSlug);
  if (!normalizedSlug || validatePublicSlug(normalizedSlug)) return false;

  let query = supabase
    .from("application_form_versions")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("public_slug", normalizedSlug)
    .eq("status", "published");

  if (excludeFormId) {
    query = query.neq("id", excludeFormId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).length === 0;
}

async function suggestDefaultPublicSlug(
  supabase: SupabaseClient,
  organizationId: string,
  title?: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("application_form_versions")
    .select("id")
    .eq("organization_id", organizationId)
    .limit(1);

  if (error) throw error;

  if ((data ?? []).length === 0) {
    return "apply";
  }

  const fromTitle = title ? slugifyFormTitle(title) : "";
  if (fromTitle) return fromTitle;

  return "application";
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
  const title = input.title?.trim() || "New Application Form";
  const publicSlug = await suggestDefaultPublicSlug(
    supabase,
    organizationId,
    title,
  );

  const { data, error } = await supabase
    .from("application_form_versions")
    .insert({
      organization_id: organizationId,
      program_id: programId,
      version,
      status: "draft",
      title,
      intro: null,
      public_slug: publicSlug,
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
  public_slug?: string | null;
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
  if (input.public_slug !== undefined) {
    if (!input.public_slug) {
      patch.public_slug = null;
    } else {
      const normalized = normalizePublicSlug(input.public_slug);
      const slugError = validatePublicSlug(normalized);
      if (slugError) throw new Error(slugError);
      patch.public_slug = normalized;
    }
  }
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

  const slugError = validatePublicSlug(existing.public_slug);
  if (slugError) throw new Error(slugError);

  const normalizedSlug = normalizePublicSlug(existing.public_slug!);
  const slugAvailable = await isPublicSlugAvailable(
    supabase,
    existing.organization_id,
    normalizedSlug,
    existing.id,
  );
  if (!slugAvailable) {
    throw new Error(
      `The slug "${normalizedSlug}" is already used by another published form.`,
    );
  }

  const { error: archiveError } = await supabase
    .from("application_form_versions")
    .update({ status: "archived" })
    .eq("organization_id", existing.organization_id)
    .eq("public_slug", normalizedSlug)
    .eq("status", "published");

  if (archiveError) throw archiveError;

  const { data, error } = await supabase
    .from("application_form_versions")
    .update({
      status: "published",
      public_slug: normalizedSlug,
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
      public_slug: existing.public_slug
        ? normalizePublicSlug(`${existing.public_slug}-copy`)
        : await suggestDefaultPublicSlug(
            supabase,
            existing.organization_id,
            `${existing.title} (copy)`,
          ),
      schema: schemaToDbJson(existing.schema),
      fee_config: existing.fee_config,
    })
    .select("*")
    .single();

  if (error) throw error;
  return applicationFormFromRow(data as Record<string, unknown>);
}
