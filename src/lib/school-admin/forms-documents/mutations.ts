import type { SupabaseClient } from "@supabase/supabase-js";
import { listClassrooms } from "@/lib/school-admin/classrooms";
import {
  fetchClassroomNames,
  materializeFormResponses,
  publishParentFormCore,
} from "@/lib/school-teacher/forms-documents/publish-parent-form-core";
import {
  mapTeacherParentFormRow,
  TEACHER_PARENT_FORM_SELECT,
  type TeacherParentFormRow,
} from "@/lib/school-teacher/forms-documents/db-mapper";
import type {
  PublishTeacherParentFormInput,
  TeacherFormConfig,
  TeacherParentForm,
  TeacherParentFormStatus,
} from "@/lib/school-teacher/forms-documents/types";
import {
  buildTeacherFormStoragePath,
  copyTeacherFormFile,
} from "@/lib/school-teacher/forms-documents/teacher-form-file-storage";
import { countFormAudienceFamilies } from "@/lib/school-teacher/forms-documents/audience";
import { getOrgParentFormById } from "./load-admin-forms";
import type { AdminParentForm } from "./types";

async function assertOrgClassroomAccess(
  admin: SupabaseClient,
  organizationId: string,
  classroomIds: string[],
): Promise<void> {
  const classrooms = await listClassrooms(admin, organizationId);
  const allowedIds = new Set(
    classrooms
      .filter((classroom) => classroom.status !== "inactive")
      .map((classroom) => classroom.id),
  );
  const invalid = classroomIds.filter((id) => !allowedIds.has(id));
  if (invalid.length > 0) {
    throw new Error("One or more selected classrooms are invalid.");
  }
}

export async function publishAdminParentForm(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  input: PublishTeacherParentFormInput,
  uploadFile?: File | null,
): Promise<AdminParentForm> {
  await assertOrgClassroomAccess(admin, organizationId, input.classroomIds);
  const form = await publishParentFormCore(
    admin,
    organizationId,
    staffMemberId,
    input,
    uploadFile,
  );
  const mapped = await getOrgParentFormById(admin, organizationId, form.id);
  if (!mapped) throw new Error("Failed to load published form.");
  return mapped;
}

export type UpdateAdminParentFormInput = {
  title?: string;
  description?: string;
  dueDate?: string | null;
  requireSignature?: boolean;
  classroomIds?: string[];
  fields?: PublishTeacherParentFormInput["fields"];
  status?: TeacherParentFormStatus;
};

export async function updateAdminParentForm(
  admin: SupabaseClient,
  organizationId: string,
  formId: string,
  input: UpdateAdminParentFormInput,
): Promise<AdminParentForm> {
  const existingForm = await getOrgParentFormById(admin, organizationId, formId);
  if (!existingForm) throw new Error("Form not found.");

  const { data: existingRow, error: loadError } = await admin
    .from("teacher_parent_forms")
    .select(TEACHER_PARENT_FORM_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", formId)
    .maybeSingle();

  if (loadError) throw loadError;
  if (!existingRow) throw new Error("Form not found.");

  const existing = mapTeacherParentFormRow(existingRow as TeacherParentFormRow);
  const now = new Date().toISOString();

  if (input.classroomIds) {
    await assertOrgClassroomAccess(admin, organizationId, input.classroomIds);
  }

  const nextClassroomIds = input.classroomIds ?? existing.classroomIds;
  const classroomNames = await fetchClassroomNames(
    admin,
    organizationId,
    nextClassroomIds,
  );

  const existingConfig = (existingRow as TeacherParentFormRow).config ?? {};
  const config: TeacherFormConfig = {
    ...existingConfig,
    classroomNames,
    ...(existing.formType === "builder" && input.fields
      ? { fields: input.fields }
      : {}),
  };

  const nextStatus = input.status ?? existing.status;
  const publishing = existing.status === "draft" && nextStatus === "active";

  let totalFamilies = existing.totalFamilies;
  if (publishing) {
    totalFamilies = await countFormAudienceFamilies(
      admin,
      organizationId,
      nextClassroomIds,
    );
  }

  const { data, error } = await admin
    .from("teacher_parent_forms")
    .update({
      title: input.title?.trim() ?? existing.title,
      description: input.description?.trim() ?? existing.description,
      classroom_ids: nextClassroomIds,
      due_date: input.dueDate !== undefined ? input.dueDate : existing.dueDate,
      require_signature:
        input.requireSignature !== undefined
          ? input.requireSignature
          : existing.requireSignature,
      status: nextStatus,
      config,
      total_families: publishing ? totalFamilies : existing.totalFamilies,
      published_at: publishing ? now : undefined,
      updated_at: now,
    })
    .eq("organization_id", organizationId)
    .eq("id", formId)
    .select(TEACHER_PARENT_FORM_SELECT)
    .single();

  if (error) throw error;

  if (publishing) {
    await materializeFormResponses(
      admin,
      organizationId,
      formId,
      nextClassroomIds,
    );
  }

  const updated = await getOrgParentFormById(admin, organizationId, formId);
  if (!updated) throw new Error("Failed to load updated form.");
  return updated;
}

export async function archiveAdminParentForm(
  admin: SupabaseClient,
  organizationId: string,
  formId: string,
): Promise<AdminParentForm> {
  const now = new Date().toISOString();
  const { error } = await admin
    .from("teacher_parent_forms")
    .update({
      status: "archived",
      archived_at: now,
      updated_at: now,
    })
    .eq("organization_id", organizationId)
    .eq("id", formId);

  if (error) throw error;

  const form = await getOrgParentFormById(admin, organizationId, formId);
  if (!form) throw new Error("Form not found.");
  return form;
}

export async function duplicateAdminParentForm(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  formId: string,
): Promise<AdminParentForm> {
  const { data: existingRow, error: loadError } = await admin
    .from("teacher_parent_forms")
    .select(TEACHER_PARENT_FORM_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", formId)
    .maybeSingle();

  if (loadError) throw loadError;
  if (!existingRow) throw new Error("Form not found.");

  const existing = existingRow as TeacherParentFormRow;
  const newFormId = crypto.randomUUID();
  const config = { ...(existing.config ?? {}) } as TeacherFormConfig;

  if (config.upload?.storagePath) {
    const newPath = buildTeacherFormStoragePath(
      organizationId,
      newFormId,
      config.upload.fileName,
    );
    await copyTeacherFormFile(admin, config.upload.storagePath, newPath);
    config.upload = {
      ...config.upload,
      storagePath: newPath,
    };
  }

  const { error } = await admin.from("teacher_parent_forms").insert({
    id: newFormId,
    organization_id: organizationId,
    created_by_staff_member_id: staffMemberId,
    title: `${existing.title} (copy)`.trim(),
    description: existing.description,
    form_type: existing.form_type,
    status: "draft",
    classroom_ids: existing.classroom_ids ?? [],
    due_date: existing.due_date,
    require_signature: existing.require_signature,
    config,
    total_families: 0,
    signed_families: 0,
    published_at: null,
    archived_at: null,
  });

  if (error) throw error;

  const form = await getOrgParentFormById(admin, organizationId, newFormId);
  if (!form) throw new Error("Failed to load duplicated form.");
  return form;
}
