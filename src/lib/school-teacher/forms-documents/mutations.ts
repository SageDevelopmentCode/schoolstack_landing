import type { SupabaseClient } from "@supabase/supabase-js";
import { loadTeacherClassroomOptions } from "@/lib/classroom-signups/load-teacher-classrooms";
import { countFormAudienceForType } from "./audience";
import { assertTeacherFamilyAccess } from "./load-form-family-options";
import {
  fetchClassroomNames,
  fetchFamilyNames,
  materializeFormResponses,
  publishParentFormCore,
  revertFormPublishState,
} from "./publish-parent-form-core";
import {
  mapTeacherParentFormRow,
  TEACHER_PARENT_FORM_SELECT,
  type TeacherParentFormRow,
} from "./db-mapper";
import type {
  PublishTeacherParentFormInput,
  TeacherFormAudienceType,
  TeacherFormConfig,
  TeacherParentForm,
  TeacherParentFormStatus,
} from "./types";
import {
  buildTeacherFormStoragePath,
  copyTeacherFormFile,
} from "./teacher-form-file-storage";

async function assertTeacherClassroomAccess(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  classroomIds: string[],
): Promise<void> {
  const options = await loadTeacherClassroomOptions(admin, organizationId, staffMemberId);
  const allowedIds = new Set(options.map((option) => option.id));
  const invalid = classroomIds.filter((id) => !allowedIds.has(id));
  if (invalid.length > 0) {
    throw new Error("You can only assign forms to your classrooms.");
  }
}

async function assertTeacherAudienceAccess(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  audienceType: TeacherFormAudienceType,
  classroomIds: string[],
  familyIds: string[],
): Promise<void> {
  if (audienceType === "classrooms") {
    await assertTeacherClassroomAccess(admin, organizationId, staffMemberId, classroomIds);
  }
  if (audienceType === "families") {
    await assertTeacherFamilyAccess(admin, organizationId, staffMemberId, familyIds);
  }
}

function resolveAudienceIds(
  audienceType: TeacherFormAudienceType,
  classroomIds: string[],
  familyIds: string[],
): { classroomIds: string[]; familyIds: string[] } {
  if (audienceType === "classrooms") {
    return { classroomIds, familyIds: [] };
  }
  if (audienceType === "families") {
    return { classroomIds: [], familyIds };
  }
  return { classroomIds: [], familyIds: [] };
}

export async function publishTeacherParentForm(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  input: PublishTeacherParentFormInput,
  uploadFile?: File | null,
): Promise<TeacherParentForm> {
  if (input.audienceType !== "unassigned") {
    await assertTeacherAudienceAccess(
      admin,
      organizationId,
      staffMemberId,
      input.audienceType,
      input.classroomIds,
      input.familyIds,
    );
  }

  return publishParentFormCore(
    admin,
    organizationId,
    staffMemberId,
    { ...input, formCategory: "general" },
    uploadFile,
  );
}

export type UpdateTeacherParentFormInput = {
  title?: string;
  description?: string;
  dueDate?: string | null;
  requireSignature?: boolean;
  audienceType?: TeacherFormAudienceType;
  classroomIds?: string[];
  familyIds?: string[];
  fields?: PublishTeacherParentFormInput["fields"];
  status?: TeacherParentFormStatus;
};

export async function updateTeacherParentForm(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  formId: string,
  input: UpdateTeacherParentFormInput,
): Promise<TeacherParentForm> {
  const { data: existingRow, error: loadError } = await admin
    .from("teacher_parent_forms")
    .select(TEACHER_PARENT_FORM_SELECT)
    .eq("organization_id", organizationId)
    .eq("created_by_staff_member_id", staffMemberId)
    .eq("id", formId)
    .maybeSingle();

  if (loadError) throw loadError;
  if (!existingRow) throw new Error("Form not found.");

  const existing = mapTeacherParentFormRow(existingRow as TeacherParentFormRow);
  const now = new Date().toISOString();

  const nextAudienceType = input.audienceType ?? existing.audienceType;
  const nextClassroomIds = input.classroomIds ?? existing.classroomIds;
  const nextFamilyIds = input.familyIds ?? existing.familyIds;

  if (nextAudienceType !== "unassigned") {
    await assertTeacherAudienceAccess(
      admin,
      organizationId,
      staffMemberId,
      nextAudienceType,
      nextClassroomIds,
      nextFamilyIds,
    );
  }

  const resolvedIds = resolveAudienceIds(
    nextAudienceType,
    nextClassroomIds,
    nextFamilyIds,
  );
  const classroomNames = await fetchClassroomNames(
    admin,
    organizationId,
    resolvedIds.classroomIds,
  );
  const familyNames = await fetchFamilyNames(
    admin,
    organizationId,
    resolvedIds.familyIds,
  );

  const existingConfig = (existingRow as TeacherParentFormRow).config ?? {};
  const config: TeacherFormConfig = {
    ...existingConfig,
    classroomNames,
    familyNames,
    ...(existing.formType === "builder" && input.fields
      ? { fields: input.fields }
      : {}),
  };

  const nextStatus = input.status ?? existing.status;
  const publishing = existing.status === "draft" && nextStatus === "active";

  if (publishing && nextAudienceType === "unassigned") {
    throw new Error("Choose who should receive this form before sending.");
  }

  let totalFamilies = existing.totalFamilies;
  if (publishing) {
    totalFamilies = await countFormAudienceForType(
      admin,
      organizationId,
      nextAudienceType,
      resolvedIds.classroomIds,
      resolvedIds.familyIds,
    );
  }

  const { data, error } = await admin
    .from("teacher_parent_forms")
    .update({
      title: input.title?.trim() ?? existing.title,
      description: input.description?.trim() ?? existing.description,
      audience_type: nextAudienceType,
      classroom_ids: resolvedIds.classroomIds,
      family_ids: resolvedIds.familyIds,
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
    .eq("created_by_staff_member_id", staffMemberId)
    .eq("id", formId)
    .select(TEACHER_PARENT_FORM_SELECT)
    .single();

  if (error) throw error;

  if (publishing) {
    try {
      await materializeFormResponses(
        admin,
        organizationId,
        formId,
        nextAudienceType,
        resolvedIds.classroomIds,
        resolvedIds.familyIds,
        { minExpectedCount: totalFamilies },
      );
    } catch (err) {
      await revertFormPublishState(admin, organizationId, formId, {
        status: existing.status,
        totalFamilies: existing.totalFamilies,
        publishedAt: (existingRow as TeacherParentFormRow).published_at ?? null,
      });
      throw err;
    }
  } else if (nextStatus === "active") {
    await materializeFormResponses(
      admin,
      organizationId,
      formId,
      nextAudienceType,
      resolvedIds.classroomIds,
      resolvedIds.familyIds,
    );
  }

  return mapTeacherParentFormRow(data as TeacherParentFormRow);
}

export async function archiveTeacherParentForm(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  formId: string,
): Promise<TeacherParentForm> {
  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("teacher_parent_forms")
    .update({
      status: "archived",
      archived_at: now,
      updated_at: now,
    })
    .eq("organization_id", organizationId)
    .eq("created_by_staff_member_id", staffMemberId)
    .eq("id", formId)
    .select(TEACHER_PARENT_FORM_SELECT)
    .single();

  if (error) throw error;
  return mapTeacherParentFormRow(data as TeacherParentFormRow);
}

export async function duplicateTeacherParentForm(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  formId: string,
): Promise<TeacherParentForm> {
  const { data: existingRow, error: loadError } = await admin
    .from("teacher_parent_forms")
    .select(TEACHER_PARENT_FORM_SELECT)
    .eq("organization_id", organizationId)
    .eq("created_by_staff_member_id", staffMemberId)
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

  const { data, error } = await admin
    .from("teacher_parent_forms")
    .insert({
      id: newFormId,
      organization_id: organizationId,
      created_by_staff_member_id: staffMemberId,
      title: `${existing.title} (copy)`.trim(),
      description: existing.description,
      form_type: existing.form_type,
      form_category: "general",
      status: "draft",
      audience_type: existing.audience_type ?? "unassigned",
      classroom_ids: existing.classroom_ids ?? [],
      family_ids: existing.family_ids ?? [],
      due_date: existing.due_date,
      require_signature: existing.require_signature,
      config,
      total_families: 0,
      signed_families: 0,
      published_at: null,
      archived_at: null,
    })
    .select(TEACHER_PARENT_FORM_SELECT)
    .single();

  if (error) throw error;
  return mapTeacherParentFormRow(data as TeacherParentFormRow);
}
