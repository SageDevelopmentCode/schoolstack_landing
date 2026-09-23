import type { SupabaseClient } from "@supabase/supabase-js";
import { loadTeacherClassroomOptions } from "@/lib/classroom-signups/load-teacher-classrooms";

export type FormFamilyOption = {
  id: string;
  name: string;
  studentNames: string[];
};

function studentDisplayName(student: {
  first_name?: string | null;
  last_name?: string | null;
}): string {
  const name = [student.first_name, student.last_name].filter(Boolean).join(" ").trim();
  return name || "Student";
}

async function loadEnrolledFamilyOptions(
  admin: SupabaseClient,
  organizationId: string,
  options?: {
    query?: string;
    limit?: number;
    familyIds?: string[];
    classroomIds?: string[];
  },
): Promise<FormFamilyOption[]> {
  const limit = Math.min(Math.max(options?.limit ?? 25, 1), 100);
  const query = options?.query?.trim().toLowerCase() ?? "";

  let enrollmentQuery = admin
    .from("enrollments")
    .select(
      `
      student_id,
      students!inner (
        id,
        first_name,
        last_name,
        family_id,
        families!inner (
          id,
          name
        )
      )
    `,
    )
    .eq("organization_id", organizationId)
    .eq("status", "enrolled");

  if (options?.familyIds?.length) {
    enrollmentQuery = enrollmentQuery.in("students.family_id", options.familyIds);
  }

  const { data: enrollmentRows, error } = await enrollmentQuery;
  if (error) throw error;

  const byFamily = new Map<string, FormFamilyOption>();

  for (const row of enrollmentRows ?? []) {
    const student = row.students as
      | {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          family_id?: string;
          families?:
            | { id?: string; name?: string | null }
            | { id?: string; name?: string | null }[]
            | null;
        }
      | {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          family_id?: string;
          families?:
            | { id?: string; name?: string | null }
            | { id?: string; name?: string | null }[]
            | null;
        }[]
      | null;
    const studentRow = Array.isArray(student) ? student[0] : student;
    if (!studentRow?.family_id) continue;

    const familyRelation = studentRow.families;
    const familyRow = Array.isArray(familyRelation) ? familyRelation[0] : familyRelation;
    const familyId = String(studentRow.family_id);
    const familyName = familyRow?.name ? String(familyRow.name) : "Family";

    const existing = byFamily.get(familyId) ?? {
      id: familyId,
      name: familyName,
      studentNames: [],
    };
    const studentName = studentDisplayName(studentRow);
    if (!existing.studentNames.includes(studentName)) {
      existing.studentNames.push(studentName);
    }
    byFamily.set(familyId, existing);
  }

  let families = [...byFamily.values()];

  if (options?.classroomIds?.length) {
    const classroomFamilyIds = await loadFamilyIdsForClassrooms(
      admin,
      organizationId,
      options.classroomIds,
    );
    const allowed = new Set(classroomFamilyIds);
    families = families.filter((family) => allowed.has(family.id));
  }

  if (query) {
    families = families.filter((family) => {
      const haystack = [family.name, ...family.studentNames].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }

  families.sort((a, b) => a.name.localeCompare(b.name));
  return families.slice(0, limit);
}

async function loadFamilyIdsForClassrooms(
  admin: SupabaseClient,
  organizationId: string,
  classroomIds: string[],
): Promise<string[]> {
  if (classroomIds.length === 0) return [];

  const { data, error } = await admin
    .from("enrollment_classrooms")
    .select("enrollments!inner ( students!inner ( family_id ), status )")
    .eq("organization_id", organizationId)
    .in("classroom_id", classroomIds)
    .eq("enrollments.status", "enrolled");

  if (error) throw error;

  const familyIds = new Set<string>();
  for (const row of data ?? []) {
    const enrollment = row.enrollments as
      | { students?: { family_id?: string } | { family_id?: string }[] | null }
      | { students?: { family_id?: string } | { family_id?: string }[] | null }[]
      | null;
    const enrollmentRow = Array.isArray(enrollment) ? enrollment[0] : enrollment;
    const student = enrollmentRow?.students;
    const studentRow = Array.isArray(student) ? student[0] : student;
    if (studentRow?.family_id) {
      familyIds.add(String(studentRow.family_id));
    }
  }

  return [...familyIds];
}

export async function loadAdminFormFamilyOptions(
  admin: SupabaseClient,
  organizationId: string,
  options?: { query?: string; limit?: number; familyIds?: string[] },
): Promise<FormFamilyOption[]> {
  return loadEnrolledFamilyOptions(admin, organizationId, options);
}

export async function loadTeacherFormFamilyOptions(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  options?: { query?: string; limit?: number; familyIds?: string[] },
): Promise<FormFamilyOption[]> {
  const classroomOptions = await loadTeacherClassroomOptions(
    admin,
    organizationId,
    staffMemberId,
  );
  return loadEnrolledFamilyOptions(admin, organizationId, {
    ...options,
    classroomIds: classroomOptions.map((option) => option.id),
  });
}

export async function assertOrgFamilyAccess(
  admin: SupabaseClient,
  organizationId: string,
  familyIds: string[],
): Promise<void> {
  if (familyIds.length === 0) return;

  const families = await loadEnrolledFamilyOptions(admin, organizationId, {
    familyIds,
    limit: familyIds.length,
  });
  const allowedIds = new Set(families.map((family) => family.id));
  const invalid = familyIds.filter((id) => !allowedIds.has(id));
  if (invalid.length > 0) {
    throw new Error("One or more selected families are invalid.");
  }
}

export async function assertTeacherFamilyAccess(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  familyIds: string[],
): Promise<void> {
  if (familyIds.length === 0) return;

  const families = await loadTeacherFormFamilyOptions(admin, organizationId, staffMemberId, {
    familyIds,
    limit: familyIds.length,
  });
  const allowedIds = new Set(families.map((family) => family.id));
  const invalid = familyIds.filter((id) => !allowedIds.has(id));
  if (invalid.length > 0) {
    throw new Error("You can only assign forms to families in your classrooms.");
  }
}
