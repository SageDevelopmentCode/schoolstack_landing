import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
} from "@/lib/activity-log";
import { orgPaymentsReadyForFees } from "@/lib/stripe/organization-payment-account";
import {
  getEnrollmentChecklistWithItems,
  validateEnrollmentChecklistItems,
} from "./enrollment-checklist-items";

export {
  ensureUniqueChecklistItemKeys,
  getEnrollmentChecklistWithItems,
  hasDuplicateChecklistItemKeys,
  saveEnrollmentChecklistItems,
  validateEnrollmentChecklistItems,
  type EnrollmentChecklistWithItems,
} from "./enrollment-checklist-items";

export const ENROLLMENT_CHECKLIST_PATH = "enrollment";

export type ProgramOption = {
  id: string;
  name: string;
};

export function listProgramsWithoutEnrollmentChecklist(
  programs: ProgramOption[],
  checklists: EnrollmentChecklistTemplate[],
): ProgramOption[] {
  const programsWithChecklist = new Set(
    checklists
      .filter((checklist) => checklist.status !== "archived" && checklist.programId)
      .map((checklist) => checklist.programId as string),
  );

  return programs.filter((program) => !programsWithChecklist.has(program.id));
}

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

export function schoolAdminEnrollmentChecklistPreviewPath(
  orgSlug: string,
  checklistId: string,
  options?: { itemId?: string },
): string {
  const base = `/school/${orgSlug}/admin/enrollment-checklist-preview/${checklistId}`;
  if (!options?.itemId) return base;
  return `${base}?item=${encodeURIComponent(options.itemId)}`;
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

export async function programHasEnrollmentChecklist(
  supabase: SupabaseClient,
  organizationId: string,
  programId: string,
): Promise<boolean> {
  const normalizedProgramId = programId.trim();
  if (!normalizedProgramId) return false;

  const { data, error } = await supabase
    .from("enrollment_checklist_templates")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("program_id", normalizedProgramId)
    .in("status", ["draft", "published"])
    .limit(1);

  if (error) throw error;
  return (data ?? []).length > 0;
}

/** @deprecated Use programHasEnrollmentChecklist for per-program checks. */
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
  input: { programId: string; programName?: string },
): Promise<EnrollmentChecklistTemplate> {
  const programId = input.programId.trim();
  if (!programId) {
    throw new Error("Select a program before creating an enrollment checklist.");
  }

  const exists = await programHasEnrollmentChecklist(
    supabase,
    organizationId,
    programId,
  );
  if (exists) {
    throw new Error("This program already has an enrollment checklist.");
  }

  let programName = input.programName?.trim() ?? "";
  if (!programName) {
    const { data: programRow, error: programError } = await supabase
      .from("programs")
      .select("name")
      .eq("id", programId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (programError) throw programError;
    programName = programRow?.name ? String(programRow.name) : "";
  }

  const name = programName
    ? `${programName} enrollment`
    : "Enrollment checklist";

  const { data, error } = await supabase
    .from("enrollment_checklist_templates")
    .insert({
      organization_id: organizationId,
      program_id: programId,
      name,
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

export type UpdateEnrollmentChecklistTemplateInput = {
  name?: string;
  program_id?: string | null;
};

export async function updateEnrollmentChecklistTemplate(
  supabase: SupabaseClient,
  id: string,
  input: UpdateEnrollmentChecklistTemplateInput,
  options?: { logActivity?: boolean },
): Promise<EnrollmentChecklistTemplate> {
  const existing = await getEnrollmentChecklistTemplate(supabase, id);
  if (!existing) throw new Error("Enrollment checklist not found.");
  if (existing.status === "archived") {
    throw new Error("Archived checklists cannot be edited.");
  }

  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name.trim() || "Enrollment checklist";
  if (input.program_id !== undefined) patch.program_id = input.program_id;

  const { data, error } = await supabase
    .from("enrollment_checklist_templates")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  const template = templateFromRow(data as Record<string, unknown>);

  if (options?.logActivity) {
    void logActivityEvent(supabase, {
      organizationId: template.organizationId,
      actorType: "school_admin",
      surface: "school_admin",
      action: ACTIVITY_ACTIONS.CHECKLIST_SAVED,
      entityType: "enrollment_checklist_template",
      entityId: template.id,
      summary: `Saved enrollment checklist “${template.name}”`,
      metadata: {
        enrollmentPath: template.enrollmentPath,
        status: template.status,
      },
    });
  }

  return template;
}

export async function publishEnrollmentChecklistTemplate(
  supabase: SupabaseClient,
  id: string,
): Promise<EnrollmentChecklistTemplate> {
  const loaded = await getEnrollmentChecklistWithItems(supabase, id);
  if (!loaded) throw new Error("Enrollment checklist not found.");

  const { template, items } = loaded;
  if (template.status !== "draft") {
    throw new Error("Only draft checklists can be published.");
  }

  if (!template.programId) {
    throw new Error(
      "Link this checklist to a program before publishing. Families cannot enroll until a program is selected.",
    );
  }

  const paymentsReady = await orgPaymentsReadyForFees(
    supabase,
    template.organizationId,
  );
  const validationErrors = validateEnrollmentChecklistItems(items, {
    paymentsReady,
  });
  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0]);
  }

  const { error: archiveError } = await supabase
    .from("enrollment_checklist_templates")
    .update({ status: "archived" })
    .eq("organization_id", template.organizationId)
    .eq("program_id", template.programId)
    .eq("status", "published")
    .neq("id", template.id);

  if (archiveError) throw archiveError;

  const { data, error } = await supabase
    .from("enrollment_checklist_templates")
    .update({ status: "published" })
    .eq("id", id)
    .eq("status", "draft")
    .select("*")
    .single();

  if (error) throw error;
  const published = templateFromRow(data as Record<string, unknown>);

  void logActivityEvent(supabase, {
    organizationId: published.organizationId,
    actorType: "school_admin",
    surface: "school_admin",
    action: ACTIVITY_ACTIONS.CHECKLIST_PUBLISHED,
    entityType: "enrollment_checklist_template",
    entityId: published.id,
    summary: `Published enrollment checklist “${published.name}”`,
    metadata: {
      enrollmentPath: published.enrollmentPath,
    },
  });

  return published;
}

export async function unpublishEnrollmentChecklistTemplate(
  supabase: SupabaseClient,
  id: string,
): Promise<EnrollmentChecklistTemplate> {
  const existing = await getEnrollmentChecklistTemplate(supabase, id);
  if (!existing) throw new Error("Enrollment checklist not found.");
  if (existing.status !== "published") {
    throw new Error("Only published checklists can be unpublished.");
  }

  const { data, error } = await supabase
    .from("enrollment_checklist_templates")
    .update({ status: "draft" })
    .eq("id", id)
    .eq("status", "published")
    .select("*")
    .single();

  if (error) throw error;
  const unpublished = templateFromRow(data as Record<string, unknown>);

  void logActivityEvent(supabase, {
    organizationId: unpublished.organizationId,
    actorType: "school_admin",
    surface: "school_admin",
    action: ACTIVITY_ACTIONS.CHECKLIST_UNPUBLISHED,
    entityType: "enrollment_checklist_template",
    entityId: unpublished.id,
    summary: `Unpublished enrollment checklist “${unpublished.name}”`,
    metadata: {
      enrollmentPath: unpublished.enrollmentPath,
    },
  });

  return unpublished;
}

export async function getPublishedEnrollmentChecklistForProgram(
  supabase: SupabaseClient,
  organizationId: string,
  programId: string,
) {
  const { data, error } = await supabase
    .from("enrollment_checklist_templates")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("program_id", programId)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return getEnrollmentChecklistWithItems(supabase, String(data.id));
}
