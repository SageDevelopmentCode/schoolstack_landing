import type {
  TeacherFormDraft,
  TeacherFormField,
  TeacherFormFilterStatus,
  TeacherFormMetrics,
  TeacherParentForm,
  TeacherFormSignatureRow,
} from "./types";

export const TEACHER_FORM_DOCUMENT_PREVIEW_HEIGHT_CLASS = "h-[min(560px,55vh)]";

export function filterFormsByStatus(
  forms: TeacherParentForm[],
  filter: TeacherFormFilterStatus,
): TeacherParentForm[] {
  if (filter === "all") return forms;
  return forms.filter((form) => form.status === filter);
}

export function computeFormMetrics(forms: TeacherParentForm[]): TeacherFormMetrics {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let pendingSignatures = 0;
  let completedThisMonth = 0;

  for (const form of forms) {
    if (form.status === "active") {
      pendingSignatures += form.totalFamilies - form.signedFamilies;
    }
    if (form.status === "archived" && form.signedFamilies === form.totalFamilies) {
      const updated = new Date(form.updatedAt);
      if (updated >= monthStart) completedThisMonth += 1;
    }
  }

  return {
    activeCount: forms.filter((form) => form.status === "active").length,
    pendingSignatures,
    completedThisMonth,
  };
}

export function formatUploadFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatFormDueDate(dueDate: string | null): string {
  if (!dueDate) return "No due date";
  const date = new Date(`${dueDate}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatClassroomNames(names: string[]): string {
  if (names.length === 0) return "No classrooms";
  if (names.length <= 2) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
}

export function getFormProgressPercent(form: TeacherParentForm): number {
  if (form.totalFamilies === 0) return 0;
  return Math.round((form.signedFamilies / form.totalFamilies) * 100);
}

export function createDefaultBuilderFields(): TeacherFormField[] {
  return [
    {
      id: "field-signature",
      type: "signature",
      label: "Parent / guardian signature",
      required: true,
      locked: true,
    },
  ];
}

export function createEmptyFormDraft(): TeacherFormDraft {
  return {
    title: "",
    description: "",
    formType: "upload",
    classroomIds: [],
    dueDate: null,
    requireSignature: true,
    uploadFormat: "pdf",
    uploadFileName: null,
    uploadFileSize: null,
    fields: createDefaultBuilderFields(),
  };
}

export function createFormFromDraft(
  draft: TeacherFormDraft,
  classroomNames: string[],
): TeacherParentForm {
  const now = new Date().toISOString();
  const totalFamilies = draft.classroomIds.length > 0 ? 12 : 0;

  return {
    id: `form-${Date.now()}`,
    title: draft.title.trim(),
    description: draft.description.trim(),
    formType: draft.formType,
    status: "active",
    classroomIds: draft.classroomIds,
    classroomNames,
    dueDate: draft.dueDate,
    requireSignature: draft.requireSignature,
    uploadFormat: draft.formType === "upload" ? draft.uploadFormat : undefined,
    uploadFileName: draft.uploadFileName ?? undefined,
    uploadFileSize: draft.uploadFileSize ?? undefined,
    fields: draft.formType === "builder" ? draft.fields : undefined,
    totalFamilies,
    signedFamilies: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function getSignatureRowsForForm(
  formId: string,
  signatureRowsByFormId: Record<string, TeacherFormSignatureRow[]>,
): TeacherFormSignatureRow[] {
  return signatureRowsByFormId[formId] ?? [];
}

export function isLockedSignatureField(field: TeacherFormField): boolean {
  return field.locked === true || field.type === "signature";
}

export function splitFormBuilderFields(fields: TeacherFormField[]): {
  reorderableFields: TeacherFormField[];
  signatureField: TeacherFormField | null;
} {
  const signatureField =
    fields.find((field) => isLockedSignatureField(field)) ?? null;
  const reorderableFields = fields.filter((field) => !isLockedSignatureField(field));
  return { reorderableFields, signatureField };
}

export function mergeReorderedFormFields(
  reordered: TeacherFormField[],
  allFields: TeacherFormField[],
): TeacherFormField[] {
  const { signatureField } = splitFormBuilderFields(allFields);
  const custom = reordered.filter((field) => !isLockedSignatureField(field));
  return signatureField ? [...custom, signatureField] : custom;
}

export function moveFormField(
  fields: TeacherFormField[],
  fieldId: string,
  direction: "up" | "down",
): TeacherFormField[] {
  const { reorderableFields, signatureField } = splitFormBuilderFields(fields);
  const index = reorderableFields.findIndex((field) => field.id === fieldId);
  if (index === -1) return fields;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= reorderableFields.length) return fields;

  const next = [...reorderableFields];
  const [moved] = next.splice(index, 1);
  next.splice(targetIndex, 0, moved);
  return signatureField ? [...next, signatureField] : next;
}
