import type { ClassroomSignupAudience, ClassroomSignupStatus } from "./types";

/** Open signups with classroom multiselect audience need at least one classroom. */
export function classroomAudienceRequiresSelection(
  audience: ClassroomSignupAudience | string,
  classroomIds: string[],
  status: ClassroomSignupStatus | "open" | "draft",
): boolean {
  return status === "open" && audience === "classrooms" && classroomIds.length === 0;
}