import type {
  PublishTeacherParentFormInput,
  TeacherFormField,
  TeacherParentFormStatus,
} from "@/lib/school-teacher/forms-documents/types";

export function parseStatus(value: string | null | undefined): TeacherParentFormStatus {
  if (value === "draft" || value === "active" || value === "archived") {
    return value;
  }
  return "active";
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

export function parseClassroomIds(raw: string | null | undefined): string[] {
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
      classroomIds: parseClassroomIds(String(formData.get("classroomIds") ?? "")),
      dueDate: String(formData.get("dueDate") ?? "").trim() || null,
      requireSignature: String(formData.get("requireSignature") ?? "true") !== "false",
      uploadFormat:
        String(formData.get("uploadFormat") ?? "pdf") === "docx" ? "docx" : "pdf",
      uploadFileName: file instanceof File ? file.name : null,
      uploadFileSize: file instanceof File ? String(file.size) : null,
      fields: parseFields(String(formData.get("fields") ?? "")),
      status: parseStatus(String(formData.get("status") ?? "active")),
    },
    file: file instanceof File && file.size > 0 ? file : null,
  };
}
