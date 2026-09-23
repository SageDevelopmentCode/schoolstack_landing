import type {
  PublishTeacherParentFormInput,
  TeacherFormAudienceType,
  TeacherFormField,
  TeacherParentFormCategory,
  TeacherParentFormStatus,
} from "./types";

export function parseFormCategory(
  value: string | null | undefined,
): TeacherParentFormCategory {
  return value === "tuition" ? "tuition" : "general";
}

export function parseStatus(value: string | null | undefined): TeacherParentFormStatus {
  if (value === "draft" || value === "active" || value === "archived") {
    return value;
  }
  return "active";
}

export function parseAudienceType(
  value: string | null | undefined,
): TeacherFormAudienceType {
  if (value === "unassigned" || value === "classrooms" || value === "families") {
    return value;
  }
  return "classrooms";
}

export function parseFields(raw: string | null | undefined): TeacherFormField[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as TeacherFormField[]) : [];
  } catch {
    return [];
  }
}

export function parseIdList(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(String).filter(Boolean);
  } catch {
    return raw.split(",").map((id) => id.trim()).filter(Boolean);
  }
}

export function parsePublishInputFromFormData(
  formData: FormData,
): { input: PublishTeacherParentFormInput; file: File | null } {
  const formType = String(formData.get("formType") ?? "upload");
  const file = formData.get("file");

  return {
    input: {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      formType: formType === "builder" ? "builder" : "upload",
      audienceType: parseAudienceType(String(formData.get("audienceType") ?? "")),
      classroomIds: parseIdList(String(formData.get("classroomIds") ?? "")),
      familyIds: parseIdList(String(formData.get("familyIds") ?? "")),
      dueDate: String(formData.get("dueDate") ?? "").trim() || null,
      requireSignature: String(formData.get("requireSignature") ?? "true") !== "false",
      uploadFormat:
        String(formData.get("uploadFormat") ?? "pdf") === "docx" ? "docx" : "pdf",
      uploadFileName: file instanceof File ? file.name : null,
      uploadFileSize: file instanceof File ? String(file.size) : null,
      fields: parseFields(String(formData.get("fields") ?? "")),
      status: parseStatus(String(formData.get("status") ?? "active")),
      formCategory: parseFormCategory(String(formData.get("formCategory") ?? "")),
    },
    file: file instanceof File && file.size > 0 ? file : null,
  };
}

export function parsePublishInputFromJson(
  body: Partial<PublishTeacherParentFormInput> & { organizationId?: string },
): PublishTeacherParentFormInput {
  return {
    title: body.title ?? "",
    description: body.description ?? "",
    formType: body.formType ?? "builder",
    audienceType: body.audienceType ?? "classrooms",
    classroomIds: body.classroomIds ?? [],
    familyIds: body.familyIds ?? [],
    dueDate: body.dueDate ?? null,
    requireSignature: body.requireSignature ?? true,
    uploadFormat: body.uploadFormat ?? "pdf",
    uploadFileName: body.uploadFileName ?? null,
    uploadFileSize: body.uploadFileSize ?? null,
    fields: body.fields ?? [],
    status: body.status ?? "active",
    formCategory: body.formCategory ?? "general",
  };
}
