export type AttendanceRecordStatus = 'present' | 'absent' | 'picked_up';

export type AttendanceRosterStatus = AttendanceRecordStatus | 'not_marked';

export type AttendanceAction = 'present' | 'absent' | 'pickup';

export type PickupContactSource = 'guardian' | 'authorized_contact';

export type AttendanceRosterStudent = {
  id: string;
  firstName: string;
  lastName: string;
  grade: string | null;
  profilePhotoUrl: string | null;
  familyId: string;
  familyName: string | null;
  programNames: string[];
  classroomNames: string[];
  attendanceStatus: AttendanceRosterStatus;
  presentAt: string | null;
  absentAt: string | null;
  pickedUpAt: string | null;
  pickedUpByGuardianId: string | null;
  pickedUpByAuthorizedContactId: string | null;
  pickedUpByName: string | null;
};

export type AttendanceRosterSummary = {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  pickedUpCount: number;
  notMarkedCount: number;
};

export type AttendanceRosterResponse = {
  date: string;
  students: AttendanceRosterStudent[];
  summary: AttendanceRosterSummary;
};

export type AttendancePickupContact = {
  id: string;
  source: PickupContactSource;
  firstName: string;
  lastName: string;
  relationship: string | null;
  email: string | null;
  phone: string | null;
};

export type AttendancePickupSelection = {
  source: PickupContactSource;
  contactId: string;
};

export type AttendanceHistoryEntry = {
  date: string;
  status: AttendanceRecordStatus;
  presentAt: string | null;
  absentAt: string | null;
  pickedUpAt: string | null;
  pickedUpByName: string | null;
  recordedByUserId: string | null;
  recordedByName: string | null;
  recordedByPhotoUrl: string | null;
};

export type AttendanceHistoryResponse = {
  studentId: string;
  entries: AttendanceHistoryEntry[];
  totalCount: number;
  hasMore: boolean;
};

export type UpsertAttendanceRecordResult = {
  status: AttendanceRecordStatus;
  presentAt: string | null;
  absentAt: string | null;
  pickedUpAt: string | null;
  pickedUpByGuardianId: string | null;
  pickedUpByAuthorizedContactId: string | null;
  pickedUpByName: string | null;
};

export type AttendanceRecordRequest = {
  organizationId: string;
  studentId: string;
  date: string;
  action: AttendanceAction;
  pickupSource?: PickupContactSource;
  pickupContactId?: string;
};
