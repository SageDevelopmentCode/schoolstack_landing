import type { TeacherClassroomOption } from "@/lib/classroom-signups/types";

export type TeacherParentFormStatus = "draft" | "active" | "archived";

export type TeacherParentFormType = "upload" | "builder";

export type UploadFileFormat = "pdf" | "docx";

export type TeacherFormFieldType =
  | "short_text"
  | "long_text"
  | "checkbox"
  | "multiple_choice"
  | "date"
  | "signature";

export type TeacherFormField = {
  id: string;
  type: TeacherFormFieldType;
  label: string;
  required: boolean;
  options?: string[];
  locked?: boolean;
};

export type TeacherParentForm = {
  id: string;
  title: string;
  description: string;
  formType: TeacherParentFormType;
  status: TeacherParentFormStatus;
  classroomIds: string[];
  classroomNames: string[];
  dueDate: string | null;
  requireSignature: boolean;
  uploadFormat?: UploadFileFormat;
  uploadFileName?: string;
  uploadFileSize?: string;
  fields?: TeacherFormField[];
  totalFamilies: number;
  signedFamilies: number;
  createdAt: string;
  updatedAt: string;
};

export type TeacherFormSignatureStatus = "pending" | "signed" | "overdue";

export type TeacherFormSignatureRow = {
  id: string;
  formId: string;
  familyName: string;
  studentNames: string[];
  status: TeacherFormSignatureStatus;
  signedAt: string | null;
};

export type TeacherFormFilterStatus = TeacherParentFormStatus | "all";

export type TeacherFormMetrics = {
  activeCount: number;
  pendingSignatures: number;
  completedThisMonth: number;
};

export type TeacherFormCreateType = TeacherParentFormType;

export type TeacherFormUploadConfig = {
  storagePath: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string | null;
  uploadFormat: UploadFileFormat;
};

export type TeacherFormConfig = {
  fields?: TeacherFormField[];
  upload?: TeacherFormUploadConfig;
  classroomNames?: string[];
};

export type TeacherFormDraft = {
  title: string;
  description: string;
  formType: TeacherFormCreateType;
  classroomIds: string[];
  dueDate: string | null;
  requireSignature: boolean;
  uploadFormat: UploadFileFormat;
  uploadFileName: string | null;
  uploadFileSize: string | null;
  uploadFile?: File | null;
  fields: TeacherFormField[];
};

export type PublishTeacherParentFormInput = Omit<
  TeacherFormDraft,
  "uploadFile"
> & {
  status: TeacherParentFormStatus;
};

export const FORM_STATUS_LABELS: Record<TeacherParentFormStatus, string> = {
  draft: "Draft",
  active: "Active",
  archived: "Archived",
};

export const FORM_TYPE_LABELS: Record<TeacherParentFormType, string> = {
  upload: "PDF",
  builder: "Built form",
};

export const FIELD_TYPE_LABELS: Record<TeacherFormFieldType, string> = {
  short_text: "Short text",
  long_text: "Long text",
  checkbox: "Checkbox",
  multiple_choice: "Multiple choice",
  date: "Date",
  signature: "Signature",
};

export const SIGNATURE_STATUS_LABELS: Record<TeacherFormSignatureStatus, string> = {
  pending: "Pending",
  signed: "Signed",
  overdue: "Overdue",
};

export type { TeacherClassroomOption };
