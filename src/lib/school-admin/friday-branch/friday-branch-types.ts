export type FridayBranchBlockAccent = "sky" | "berry" | "sage" | "sun";

export type FridayBranchClass = {
  id: string;
  name: string;
  location: string;
  ageGroup: string;
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
  slots: FridayBranchTimeSlot[];
};
