export type TeacherParentFormStatus = 'draft' | 'active' | 'archived';

export type TeacherParentFormType = 'upload' | 'builder';

export type UploadFileFormat = 'pdf' | 'docx';

export type TeacherFormFieldType =
  | 'short_text'
  | 'long_text'
  | 'checkbox'
  | 'multiple_choice'
  | 'date'
  | 'signature';

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

export type TeacherFormSignatureStatus = 'pending' | 'signed' | 'overdue';

export type ParentFormResponseSummary = {
  id: string;
  formId: string;
  status: TeacherFormSignatureStatus;
  signedAt: string | null;
  studentNames: string[];
  responses: Record<string, unknown>;
};

export type ParentFormListStatus = 'needs_action' | 'signed';

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

export type ParentFormFilterStatus = ParentFormListStatus | 'all';

export type SubmitParentFormInput = {
  signerName?: string;
  fieldValues?: Record<string, string | boolean | string[]>;
};

export type ParentFormDownloadPayload = {
  signedUrl: string;
  fileName: string;
};
