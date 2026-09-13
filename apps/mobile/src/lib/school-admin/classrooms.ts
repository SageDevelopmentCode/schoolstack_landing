export type ClassroomStatus = 'open' | 'full' | 'inactive';

export type ClassroomStaffRole = 'lead' | 'assistant';

export type ClassroomStaffAssignment = {
  id: string;
  staffMemberId: string;
  name: string;
  role: ClassroomStaffRole;
};

export type ClassroomSummary = {
  id: string;
  name: string;
  programId: string | null;
  programName: string | null;
  status: ClassroomStatus;
  studentCount: number;
  staffCount: number;
  leadTeacherNames: string[];
  createdAt: string;
  updatedAt: string;
};

export type ClassroomDetail = ClassroomSummary & {
  staff: ClassroomStaffAssignment[];
};

export type ProgramOption = {
  id: string;
  name: string;
};

export type SetStudentClassroomsResult = {
  classroomIds: string[];
  classroomNames: string[];
  assignedTeachers: { id: string; name: string }[];
  assignedTeacherNames: string;
};

export type ClassroomStudentRosterEntry = {
  id: string;
  firstName: string;
  lastName: string;
  grade: string | null;
  programNames: string[];
  profilePhotoUrl: string | null;
};
