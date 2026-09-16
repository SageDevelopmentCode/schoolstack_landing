import type { SupabaseClient } from "@supabase/supabase-js";
import { countFamiliesForClassroomIds } from "@/lib/classroom-signups/audience";
import type { TeacherClassroomOption } from "@/lib/classroom-signups/types";
import { listClassrooms } from "@/lib/school-admin/classrooms";

export async function loadAdminClassroomOptions(
  admin: SupabaseClient,
  organizationId: string,
): Promise<TeacherClassroomOption[]> {
  const classrooms = await listClassrooms(admin, organizationId);
  const activeClassrooms = classrooms.filter((classroom) => classroom.status !== "inactive");

  if (activeClassrooms.length === 0) return [];

  const options: TeacherClassroomOption[] = [];
  for (const classroom of activeClassrooms) {
    const { count } = await countFamiliesForClassroomIds(
      admin,
      organizationId,
      [classroom.id],
    );
    options.push({
      id: classroom.id,
      name: classroom.name,
      familyCount: count,
      role: null,
    });
  }

  return options;
}
