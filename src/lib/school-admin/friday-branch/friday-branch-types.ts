export type FridayBranchBlockAccent = "sky" | "berry" | "sage" | "sun";

export type FridayBranchBlockStatus = "current" | "upcoming" | "draft";

export type FridayBranchClass = {
  id: string;
  name: string;
  location: string;
  ageGroup: string;
  teacher?: string;
  familyVisible?: boolean;
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
