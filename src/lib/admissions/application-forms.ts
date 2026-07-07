import type { SupabaseClient } from "@supabase/supabase-js";
import {
  applicationFormFromRow,
  defaultApplicationFormFeeConfig,
  emptyApplicationFormSchema,
  emptyApplicationSection,
  normalizePublicSlug,
  parseApplicationFormFeeConfig,
  schemaToDbJson,
  slugifyFormTitle,
  validatePublicSlug,
  validateApplicationFormSchema,
  type ApplicationFormFeeConfig,
  type ApplicationFormPostSubmitConfig,
  type ApplicationFormSchema,
  type ApplicationFormVersion,
} from "./application-form-schema";
import {
  buildApplySystemSection,
  emptyApplyCustomSection,
  ensureApplySystemSchema,
  validateApplySystemSchema,
} from "./apply-system-fields";
import { orgPaymentsReadyForFees } from "@/lib/stripe/organization-payment-account";
export type { ProgramOption } from "./programs";
export { listPrograms } from "./programs";

export function publicApplicationFormPath(
  orgSlug: string,
  formSlug: string,
): string {
  return `/school/${orgSlug}/forms/${formSlug}`;
}

export const APPLY_FORM_PUBLIC_SLUG = "apply";

export async function orgHasApplyForm(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("application_form_versions")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("public_slug", APPLY_FORM_PUBLIC_SLUG)
    .in("status", ["draft", "published"])
    .limit(1);

  if (error) throw error;
  return (data ?? []).length > 0;
}

export function isApplyFormSlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return normalizePublicSlug(slug) === APPLY_FORM_PUBLIC_SLUG;
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
    .in("status", ["draft", "published"]);

  if (excludeFormId) {
    query = query.neq("id", excludeFormId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).length === 0;
}

export function slugConflictError(slug: string): string {
  return `The slug "${slug}" is already used by another form.`;
}

async function nextAvailablePublicSlug(
  supabase: SupabaseClient,
  organizationId: string,
  candidates: string[],
): Promise<string> {
  for (const candidate of candidates) {
    const base = normalizePublicSlug(candidate);
    if (!base || validatePublicSlug(base)) continue;

    const variants = [base];
    for (let i = 2; i <= 20; i++) {
      variants.push(normalizePublicSlug(`${base}-${i}`));
    }

    for (const slug of variants) {
      if (!slug || validatePublicSlug(slug)) continue;
      if (await isPublicSlugAvailable(supabase, organizationId, slug)) {
        return slug;
      }
    }
  }

  return normalizePublicSlug(`application-${Date.now().toString(36)}`) || "application";
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

  const candidates: string[] = [];
  if ((data ?? []).length === 0) {
    candidates.push("apply");
  }
  if (title) {
    const fromTitle = slugifyFormTitle(title);
    if (fromTitle) candidates.push(fromTitle);
  }
  candidates.push("application");

  return nextAvailablePublicSlug(supabase, organizationId, candidates);
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

export async function createApplyForm(
  supabase: SupabaseClient,
  organizationId: string,
  input: { title?: string; programId?: string | null } = {},
): Promise<ApplicationFormVersion> {
  const hasApply = await orgHasApplyForm(supabase, organizationId);
  if (hasApply) {
    throw new Error("Your school already has an apply form.");
  }

  const programId = input.programId ?? null;
  const version = await nextVersion(supabase, organizationId, programId);
  const schema = emptyApplicationFormSchema();
  schema.sections.push(buildApplySystemSection());
  schema.sections.push(emptyApplyCustomSection());
  const title = input.title?.trim() || "Application";

  const { data, error } = await supabase
    .from("application_form_versions")
    .insert({
      organization_id: organizationId,
      program_id: programId,
      version,
      status: "draft",
      title,
      intro: null,
      public_slug: APPLY_FORM_PUBLIC_SLUG,
      schema: schemaToDbJson(schema),
      fee_config: defaultApplicationFormFeeConfig(),
    })
    .select("*")
    .single();

  if (error) throw error;
  return applicationFormFromRow(data as Record<string, unknown>);
}

export type UpdateApplicationFormInput = {
  title?: string;
  intro?: string | null;
  program_id?: string | null;
  public_slug?: string | null;
  schema?: ApplicationFormSchema;
  fee_config?: ApplicationFormFeeConfig;
  post_submit_config?: ApplicationFormPostSubmitConfig;
};

/** @deprecated Use UpdateApplicationFormInput */
export type UpdateDraftFormInput = UpdateApplicationFormInput;

async function assertPublicSlugAvailable(
  supabase: SupabaseClient,
  organizationId: string,
  normalizedSlug: string,
  excludeFormId: string,
): Promise<void> {
  const available = await isPublicSlugAvailable(
    supabase,
    organizationId,
    normalizedSlug,
    excludeFormId,
  );
  if (!available) {
    throw new Error(slugConflictError(normalizedSlug));
  }
}

export async function updateApplicationForm(
  supabase: SupabaseClient,
  id: string,
  input: UpdateApplicationFormInput,
): Promise<ApplicationFormVersion> {
  const existing = await getApplicationForm(supabase, id);
  if (!existing) throw new Error("Application form not found.");
  if (existing.status === "archived") {
    throw new Error("Archived forms cannot be edited.");
  }

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.intro !== undefined) patch.intro = input.intro;
  if (input.program_id !== undefined) patch.program_id = input.program_id;

  let normalizedSlug: string | null = existing.public_slug;
  const isApplyForm = isApplyFormSlug(existing.public_slug);

  if (input.public_slug !== undefined) {
    if (isApplyForm) {
      normalizedSlug = APPLY_FORM_PUBLIC_SLUG;
    } else if (!input.public_slug) {
      if (existing.status === "published") {
        throw new Error("A public URL slug is required for published forms.");
      }
      patch.public_slug = null;
      normalizedSlug = null;
    } else if (!isApplyForm) {
      normalizedSlug = normalizePublicSlug(input.public_slug);
      const slugError = validatePublicSlug(normalizedSlug);
      if (slugError) throw new Error(slugError);
      await assertPublicSlugAvailable(
        supabase,
        existing.organization_id,
        normalizedSlug,
        existing.id,
      );
      patch.public_slug = normalizedSlug;
    }
  } else if (existing.status === "published" && existing.public_slug) {
    normalizedSlug = normalizePublicSlug(existing.public_slug);
  }

  if (input.schema !== undefined) {
    patch.schema = schemaToDbJson(
      isApplyForm ? ensureApplySystemSchema(input.schema) : input.schema,
    );
  }
  if (input.fee_config !== undefined) patch.fee_config = input.fee_config;
  if (input.post_submit_config !== undefined) {
    patch.post_submit_config = input.post_submit_config;
  }

  const { data, error } = await supabase
    .from("application_form_versions")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return applicationFormFromRow(data as Record<string, unknown>);
}

export async function updateDraftForm(
  supabase: SupabaseClient,
  id: string,
  input: UpdateDraftFormInput,
): Promise<ApplicationFormVersion> {
  return updateApplicationForm(supabase, id, input);
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

  if (!existing.program_id) {
    throw new Error(
      "Link this form to a program before publishing. Families cannot apply until a program is selected.",
    );
  }

  const slugError = validatePublicSlug(existing.public_slug);
  if (slugError) throw new Error(slugError);

  const schema = isApplyFormSlug(existing.public_slug)
    ? ensureApplySystemSchema(existing.schema)
    : existing.schema;
  const schemaErrors = [
    ...validateApplicationFormSchema(schema),
    ...(isApplyFormSlug(existing.public_slug)
      ? validateApplySystemSchema(schema)
      : []),
  ];
  if (schemaErrors.length > 0) {
    throw new Error(schemaErrors[0]);
  }

  const feeConfig = parseApplicationFormFeeConfig(existing.fee_config);
  if (feeConfig.enabled) {
    const paymentsReady = await orgPaymentsReadyForFees(
      supabase,
      existing.organization_id,
    );
    if (!paymentsReady) {
      throw new Error(
        "Connect Stripe under Admissions → Payments before publishing a form with an application fee.",
      );
    }
  }

  const normalizedSlug = normalizePublicSlug(existing.public_slug!);

  const { error: archiveError } = await supabase
    .from("application_form_versions")
    .update({ status: "archived" })
    .eq("organization_id", existing.organization_id)
    .eq("public_slug", normalizedSlug)
    .eq("status", "published")
    .neq("id", existing.id);

  if (archiveError) throw archiveError;

  const slugAvailable = await isPublicSlugAvailable(
    supabase,
    existing.organization_id,
    normalizedSlug,
    existing.id,
  );
  if (!slugAvailable) {
    throw new Error(slugConflictError(normalizedSlug));
  }

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

export async function unpublishForm(
  supabase: SupabaseClient,
  id: string,
): Promise<ApplicationFormVersion> {
  const existing = await getApplicationForm(supabase, id);
  if (!existing) throw new Error("Application form not found.");
  if (existing.status !== "published") {
    throw new Error("Only published forms can be unpublished.");
  }

  const { data, error } = await supabase
    .from("application_form_versions")
    .update({
      status: "draft",
      published_at: null,
    })
    .eq("id", id)
    .eq("status", "published")
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

  const copyTitle = `${existing.title} (copy)`;
  const slugCandidates = existing.public_slug
    ? [`${existing.public_slug}-copy`, copyTitle]
    : [copyTitle];
  const publicSlug = await nextAvailablePublicSlug(
    supabase,
    existing.organization_id,
    slugCandidates,
  );

  const { data, error } = await supabase
    .from("application_form_versions")
    .insert({
      organization_id: existing.organization_id,
      program_id: existing.program_id,
      version,
      status: "draft",
      title: copyTitle,
      intro: existing.intro,
      public_slug: publicSlug,
      schema: schemaToDbJson(existing.schema),
      fee_config: existing.fee_config,
      post_submit_config: existing.post_submit_config,
    })
    .select("*")
    .single();

  if (error) throw error;
  return applicationFormFromRow(data as Record<string, unknown>);
}
