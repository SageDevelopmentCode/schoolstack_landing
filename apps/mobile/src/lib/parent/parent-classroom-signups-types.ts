export type ClassroomSignupType = 'time_slots' | 'roles' | 'open';

export type ClassroomSignupStatus = 'draft' | 'open' | 'closed';

export type ClassroomSignupAudience = 'assigned' | 'classroom' | 'classrooms';

export type ClassroomSignupResponseStatus = 'confirmed' | 'withdrawn';

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
  audienceClassroomNames?: string[];
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
  classroomIds: string[];
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

export type ParentSignupAttentionItem = {
  signupId: string;
  teacherName: string;
  title: string;
  classroomName: string | null;
};

export type ParentClassroomSignupListStatus = 'needs_response' | 'signed_up' | 'closed';

export type ParentClassroomSignupListItem = {
  signup: ClassroomSignup;
  familyResponse: ClassroomSignupResponse | null;
  listStatus: ParentClassroomSignupListStatus;
};

export type ParentClassroomSignupStudentOption = {
  id: string;
  name: string;
};

export type ParentClassroomSignupsPageBundle = {
  items: ParentClassroomSignupListItem[];
  studentOptions: ParentClassroomSignupStudentOption[];
};

export type ParentClassroomSignupDetail = {
  signup: ClassroomSignup;
  responses: ClassroomSignupResponse[];
  familyResponse: ClassroomSignupResponse | null;
  studentOptions: ParentClassroomSignupStudentOption[];
};

export type ParentClassroomSignupsFilter = ParentClassroomSignupListStatus | 'all';

export const SIGNUP_TYPE_LABELS: Record<ClassroomSignupType, string> = {
  time_slots: 'Time slots',
  roles: 'Roles & tasks',
  open: 'Open signup',
};
