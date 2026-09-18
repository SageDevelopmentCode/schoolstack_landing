export type FridayBranchBlockAccent = "sky" | "berry" | "sage" | "sun";

export type FridayBranchBlockStatus = "current" | "upcoming" | "draft";

export type FridayBranchClassEnrollmentStatus = "confirmed" | "waitlisted" | "withdrawn";

export type FridayBranchClass = {
  id: string;
  name: string;
  location: string;
  ageGroup: string;
  teacher?: string;
  familyVisible?: boolean;
  capacity?: number | null;
};

export type FridayBranchClassEnrollment = {
  id: string;
  studentId: string;
  familyId: string;
  studentName: string;
  familyName: string;
  status: FridayBranchClassEnrollmentStatus;
};

export type FridayBranchClassDetail = {
  class: FridayBranchClass;
  slotTime: string;
  blockLabel: string;
  blockDateRange: string;
  enrollmentCount: number;
  enrollments: FridayBranchClassEnrollment[];
};

export type FridayBranchTimeSlot = {
  id: string;
  time: string;
  classes: FridayBranchClass[];
};

export type FridayBranchBlock = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  accent: FridayBranchBlockAccent;
  description?: string;
  status?: FridayBranchBlockStatus;
  slots: FridayBranchTimeSlot[];
};

export type FridayBranchScheduleGap = {
  classId: string;
  slotId: string;
  className: string;
  missingLocation: boolean;
  missingAge: boolean;
};

export type FridayBranchStatusTagVariant = "green" | "blue" | "amber" | "purple" | "rose";
