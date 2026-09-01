export type ClassroomSignupType = "time_slots" | "roles" | "open";

export type ClassroomSignupStatus = "draft" | "open" | "closed";

export type ClassroomSignupAudience = "assigned" | "classroom";

export type ClassroomSignupResponseStatus = "confirmed" | "withdrawn";

export type ClassroomSignupTimeSlot = {
  id: string;
  label: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
};

export type ClassroomSignupRole = {
  id: string;
  name: string;
  description: string;
  quantityNeeded: number;
};

export type ClassroomSignupConfig = {
  slots?: ClassroomSignupTimeSlot[];
  roles?: ClassroomSignupRole[];
  allowMultipleSelections?: boolean;
  maxFamilies?: number;
  parentPrompt?: string;
};

export type ClassroomSignup = {
  id: string;
  organizationId: string;
  createdByStaffMemberId: string;
  teacherName: string;
  title: string;
  description: string;
  signupType: ClassroomSignupType;
  audience: ClassroomSignupAudience;
  classroomId: string | null;
  classroomName: string | null;
  familyCount: number;
  status: ClassroomSignupStatus;
  responseDeadline: string | null;
  config: ClassroomSignupConfig;
  publishedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ClassroomSignupResponse = {
  id: string;
  signupId: string;
  familyId: string;
  familyName: string;
  guardianName: string;
  guardianEmail: string;
  studentId: string;
  studentName: string;
  selectedSlotIds: string[];
  selectedRoleIds: string[];
  note: string | null;
  status: ClassroomSignupResponseStatus;
  createdAt: string;
  updatedAt: string;
};

export type ClassroomSignupTemplateId =
  | "reading_buddies"
  | "class_event_helpers"
  | "field_trip_chaperones"
  | "class_party_contributions"
  | "blank";

export type ClassroomSignupDraft = Omit<
  ClassroomSignup,
  "id" | "organizationId" | "createdByStaffMemberId" | "teacherName" | "createdAt" | "updatedAt" | "publishedAt" | "closedAt"
> & {
  id?: string;
};

export type TeacherClassroomOption = {
  id: string;
  name: string;
  familyCount: number;
};

export type ClassroomSignupMetrics = {
  openCount: number;
  responsesThisWeek: number;
  needsAttentionCount: number;
};

export type ParentSignupAttentionItem = {
  signupId: string;
  teacherName: string;
  title: string;
  classroomName: string | null;
};

export const SIGNUP_TYPE_LABELS: Record<ClassroomSignupType, string> = {
  time_slots: "Time slots",
  roles: "Roles & tasks",
  open: "Open signup",
};

export const SIGNUP_STATUS_LABELS: Record<ClassroomSignupStatus, string> = {
  draft: "Draft",
  open: "Open",
  closed: "Closed",
};
