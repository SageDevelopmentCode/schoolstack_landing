import type {
  TeacherFormConfig,
  TeacherFormField,
  TeacherFormSignatureRow,
  TeacherFormSignatureStatus,
  TeacherParentForm,
  TeacherParentFormStatus,
  TeacherParentFormType,
  UploadFileFormat,
} from "./types";

export type TeacherParentFormRow = {
  id: string;
  organization_id: string;
  created_by_staff_member_id: string;
  title: string;
  description: string;
  form_type: TeacherParentFormType;
  status: TeacherParentFormStatus;
  classroom_ids: string[] | null;
  due_date: string | null;
  require_signature: boolean;
  config: TeacherFormConfig | null;
  total_families: number;
  signed_families: number;
  published_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TeacherParentFormResponseRow = {
  id: string;
  organization_id: string;
  form_id: string;
  family_id: string;
  student_ids: string[] | null;
  status: TeacherFormSignatureStatus;
  responses: Record<string, unknown> | null;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
  families?:
    | { name?: string | null }
    | { name?: string | null }[]
    | null;
  students?:
    | { id?: string; first_name?: string | null; last_name?: string | null }
    | { id?: string; first_name?: string | null; last_name?: string | null }[]
    | null;
};

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function studentDisplayName(
  student: { first_name?: string | null; last_name?: string | null } | null,
): string {
  if (!student) return "Student";
  const name = [student.first_name, student.last_name].filter(Boolean).join(" ").trim();
  return name || "Student";
}

export function resolveSignatureStatus(
  status: TeacherFormSignatureStatus,
  dueDate: string | null,
): TeacherFormSignatureStatus {
  if (status === "signed") return "signed";
  if (!dueDate) return status === "overdue" ? "pending" : status;
  const due = new Date(`${dueDate}T23:59:59`);
  if (Number.isNaN(due.getTime())) return status;
  if (status === "pending" && due < new Date()) return "overdue";
  return status;
}

export function mapTeacherParentFormRow(row: TeacherParentFormRow): TeacherParentForm {
  const config = (row.config ?? {}) as TeacherFormConfig;
  const classroomIds = (row.classroom_ids ?? []).map(String);
  const classroomNames = config.classroomNames ?? [];
  const upload = config.upload;

  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description ?? ""),
    formType: row.form_type,
    status: row.status,
    classroomIds,
    classroomNames,
    dueDate: row.due_date,
    requireSignature: Boolean(row.require_signature),
    uploadFormat: upload?.uploadFormat,
    uploadFileName: upload?.fileName,
    uploadFileSize:
      upload?.fileSizeBytes != null ? formatFileSize(upload.fileSizeBytes) : undefined,
    fields: row.form_type === "builder" ? config.fields ?? [] : undefined,
    totalFamilies: Number(row.total_families ?? 0),
    signedFamilies: Number(row.signed_families ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTeacherParentFormResponseRow(
  row: TeacherParentFormResponseRow,
  dueDate: string | null,
): TeacherFormSignatureRow {
  const family = unwrapRelation(row.families);
  const students = Array.isArray(row.students)
    ? row.students
    : row.students
      ? [row.students]
      : [];

  const studentNames = students.map((student) => studentDisplayName(student));

  return {
    id: String(row.id),
    formId: String(row.form_id),
    familyName: family?.name ? String(family.name) : "Family",
    studentNames,
    status: resolveSignatureStatus(row.status, dueDate),
    signedAt: row.signed_at,
  };
}

export const TEACHER_PARENT_FORM_SELECT = "*";

export const TEACHER_PARENT_FORM_RESPONSE_SELECT = `
  *,
  families ( name )
`;
