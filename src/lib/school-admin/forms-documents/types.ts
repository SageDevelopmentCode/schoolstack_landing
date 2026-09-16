import type { TeacherParentForm } from "@/lib/school-teacher/forms-documents/types";

export type AdminParentForm = TeacherParentForm & {
  createdByName: string;
  createdByStaffMemberId: string;
};
