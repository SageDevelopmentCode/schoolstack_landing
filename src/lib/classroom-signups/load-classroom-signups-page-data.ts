import type { SupabaseClient } from "@supabase/supabase-js";
import { countAssignedFamiliesForTeacher } from "./audience";
import { loadTeacherClassroomOptions } from "./load-teacher-classrooms";
import {
  listClassroomSignupResponsesBySignupIds,
  listTeacherClassroomSignups,
} from "./load-teacher-signups";
import type {
  ClassroomSignup,
  ClassroomSignupResponse,
  TeacherClassroomOption,
} from "./types";

export type TeacherClassroomSignupsPageData = {
  signups: ClassroomSignup[];
  responsesBySignupId: Record<string, ClassroomSignupResponse[]>;
  classroomOptions: TeacherClassroomOption[];
  assignedFamilyCount: number;
};

export async function loadTeacherClassroomSignupsPageData(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
): Promise<TeacherClassroomSignupsPageData> {
  const signups = await listTeacherClassroomSignups(
    admin,
    organizationId,
    staffMemberId,
  );
  const signupIds = signups.map((signup) => signup.id);

  const [responsesBySignupId, classroomOptions, assignedFamilyCount] =
    await Promise.all([
      listClassroomSignupResponsesBySignupIds(admin, organizationId, signupIds),
      loadTeacherClassroomOptions(admin, organizationId, staffMemberId),
      countAssignedFamiliesForTeacher(admin, organizationId, staffMemberId),
    ]);

  return {
    signups,
    responsesBySignupId,
    classroomOptions,
    assignedFamilyCount,
  };
}
