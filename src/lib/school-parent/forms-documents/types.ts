import type {
  TeacherFormField,
  TeacherFormSignatureStatus,
  TeacherParentForm,
  TeacherParentFormType,
} from "@/lib/school-teacher/forms-documents/types";

export type ParentFormListStatus = "needs_action" | "signed";

export type ParentFormResponseSummary = {
  id: string;
  formId: string;
  status: TeacherFormSignatureStatus;
  signedAt: string | null;
  studentNames: string[];
  responses: Record<string, unknown>;
};

export type ParentFormListItem = {
  form: TeacherParentForm;
  response: ParentFormResponseSummary;
  listStatus: ParentFormListStatus;
};

export type ParentFormsDocumentsPageBundle = {
  items: ParentFormListItem[];
};

export type ParentFormDetail = {
  form: TeacherParentForm;
  response: ParentFormResponseSummary;
};

export type ParentFormFilterStatus = ParentFormListStatus | "all";

export type SubmitParentFormInput = {
  signerName?: string;
  fieldValues?: Record<string, string | boolean | string[]>;
};

export type { TeacherFormField, TeacherParentFormType };
