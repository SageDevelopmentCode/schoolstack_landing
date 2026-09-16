import type { SupabaseClient } from "@supabase/supabase-js";
import {
  countFormAudienceFamilies,
  resolveFormAudienceFamilies,
} from "./audience";
import {
  mapTeacherParentFormRow,
  TEACHER_PARENT_FORM_SELECT,
  type TeacherParentFormRow,
} from "./db-mapper";
import type {
  PublishTeacherParentFormInput,
  TeacherFormConfig,
  TeacherParentForm,
} from "./types";
import { uploadTeacherFormFile } from "./teacher-form-file-storage";

export async function fetchClassroomNames(
  admin: SupabaseClient,
  organizationId: string,
  classroomIds: string[],
): Promise<string[]> {
  if (classroomIds.length === 0) return [];

  const { data, error } = await admin
    .from("classrooms")
    .select("id, name")
    .eq("organization_id", organizationId)
    .in("id", classroomIds);

  if (error) throw error;

  const nameById = new Map(
    (data ?? []).map((row) => [String(row.id), String(row.name ?? "Classroom")]),
  );

  return classroomIds
    .map((id) => nameById.get(id))
    .filter((name): name is string => Boolean(name));
}

export function validatePublishInput(input: PublishTeacherParentFormInput): void {
  if (!input.title.trim()) throw new Error("Title is required.");
  if (input.classroomIds.length === 0) {
    throw new Error("Select at least one classroom.");
  }

  if (input.formType === "upload") {
    if (!input.uploadFileName) {
      throw new Error("Upload a document before saving.");
    }
  }

  if (input.formType === "builder") {
    const hasSignature = input.fields.some((field) => field.type === "signature");
    if (!hasSignature) {
      throw new Error("Built forms must include a signature field.");
    }
  }
}

export async function materializeFormResponses(
  admin: SupabaseClient,
  organizationId: string,
  formId: string,
  classroomIds: string[],
): Promise<void> {
  const families = await resolveFormAudienceFamilies(
    admin,
    organizationId,
    classroomIds,
  );

  if (families.length === 0) return;

  const rows = families.map((family) => ({
    organization_id: organizationId,
    form_id: formId,
    family_id: family.familyId,
    student_ids: family.studentIds,
    status: "pending" as const,
    responses: {},
  }));

  const { error } = await admin.from("teacher_parent_form_responses").insert(rows);
  if (error) throw error;
}

export async function publishParentFormCore(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  input: PublishTeacherParentFormInput,
  uploadFile?: File | null,
): Promise<TeacherParentForm> {
  validatePublishInput(input);

  const formId = crypto.randomUUID();
  const now = new Date().toISOString();
  const classroomNames = await fetchClassroomNames(
    admin,
    organizationId,
    input.classroomIds,
  );

  let config: TeacherFormConfig = {
    classroomNames,
  };

  if (input.formType === "builder") {
    config = {
      ...config,
      fields: input.fields,
    };
  }

  if (input.formType === "upload") {
    if (!uploadFile) {
      throw new Error("Upload a document before saving.");
    }
    const uploaded = await uploadTeacherFormFile(
      admin,
      { organizationId, formId },
      uploadFile,
    );
    config = {
      ...config,
      upload: {
        storagePath: uploaded.storagePath,
        fileName: uploaded.fileName,
        fileSizeBytes: uploaded.fileSizeBytes,
        mimeType: uploaded.mimeType,
        uploadFormat: uploaded.uploadFormat,
      },
    };
  }

  const isActive = input.status === "active";
  const totalFamilies = isActive
    ? await countFormAudienceFamilies(admin, organizationId, input.classroomIds)
    : 0;

  const { data, error } = await admin
    .from("teacher_parent_forms")
    .insert({
      id: formId,
      organization_id: organizationId,
      created_by_staff_member_id: staffMemberId,
      title: input.title.trim(),
      description: input.description.trim(),
      form_type: input.formType,
      status: input.status,
      classroom_ids: input.classroomIds,
      due_date: input.dueDate,
      require_signature: input.requireSignature,
      config,
      total_families: totalFamilies,
      signed_families: 0,
      published_at: isActive ? now : null,
      archived_at: null,
    })
    .select(TEACHER_PARENT_FORM_SELECT)
    .single();

  if (error) throw error;

  if (isActive) {
    await materializeFormResponses(
      admin,
      organizationId,
      formId,
      input.classroomIds,
    );
  }

  return mapTeacherParentFormRow(data as TeacherParentFormRow);
}
