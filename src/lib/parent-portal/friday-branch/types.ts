import type {
  FridayBranchBlock,
  FridayBranchClassEnrollmentStatus,
} from "@/lib/school-admin/friday-branch/friday-branch-types";

export type ParentFridayBranchStudentOption = {
  id: string;
  name: string;
};

export type ParentFridayBranchChildEnrollment = {
  enrollmentId: string;
  studentId: string;
  status: FridayBranchClassEnrollmentStatus;
};

export type ParentFridayBranchClassSummary = {
  classId: string;
  slotId: string;
  slotTime: string;
  name: string;
  location: string;
  ageGroup: string;
  teacher?: string;
  capacity: number | null;
  priceCents: number | null;
  hasFlyer: boolean;
  flyerFileName?: string | null;
  confirmedCount: number;
  spotsRemaining: number | null;
  familyEnrollments: ParentFridayBranchChildEnrollment[];
};

export type ParentFridayBranchBlockSummary = {
  block: FridayBranchBlock;
  classes: ParentFridayBranchClassSummary[];
};

export type ParentFridayBranchPageBundle = {
  blocks: ParentFridayBranchBlockSummary[];
  studentOptions: ParentFridayBranchStudentOption[];
};

export type ParentFridayBranchStudentEnrollmentState = {
  studentId: string;
  studentName: string;
  enrollmentId?: string;
  status?: FridayBranchClassEnrollmentStatus;
  canEnroll: boolean;
  blockedReason?: string;
};

export type ParentFridayBranchClassDetailBundle = {
  classId: string;
  blockId: string;
  slotId: string;
  slotTime: string;
  blockLabel: string;
  blockDateRange: string;
  name: string;
  location: string;
  ageGroup: string;
  teacher?: string;
  capacity: number | null;
  priceCents: number | null;
  hasFlyer: boolean;
  flyerFileName?: string | null;
  confirmedCount: number;
  spotsRemaining: number | null;
  studentStates: ParentFridayBranchStudentEnrollmentState[];
};
