import type { SupabaseClient } from "@supabase/supabase-js";
import { countFamiliesForClassroomIds } from "@/lib/classroom-signups/audience";
import type { TeacherFormAudienceType } from "./types";

export type FormAudienceFamily = {
  familyId: string;
  studentIds: string[];
  studentNames: string[];
};

async function classroomFamilyStudents(
  admin: SupabaseClient,
  organizationId: string,
  classroomId: string,
): Promise<{ family_id: string; student_id: string }[]> {
  const { data: junctionRows, error } = await admin
    .from("enrollment_classrooms")
    .select("enrollments!inner ( student_id, status, students ( family_id ) )")
    .eq("organization_id", organizationId)
    .eq("classroom_id", classroomId)
    .eq("enrollments.status", "enrolled");

  if (error) throw error;

  const rows: { family_id: string; student_id: string }[] = [];
  for (const junctionRow of junctionRows ?? []) {
    const enrollment = junctionRow.enrollments as
      | {
          student_id?: string;
          students?: { family_id?: string } | { family_id?: string }[] | null;
        }
      | {
          student_id?: string;
          students?: { family_id?: string } | { family_id?: string }[] | null;
        }[]
      | null;
    const enrollmentRow = Array.isArray(enrollment) ? enrollment[0] : enrollment;
    if (!enrollmentRow?.student_id) continue;

    const student = enrollmentRow.students;
    const studentRow = Array.isArray(student) ? student[0] : student;
    if (!studentRow?.family_id) continue;

    rows.push({
      family_id: String(studentRow.family_id),
      student_id: String(enrollmentRow.student_id),
    });
  }
  return rows;
}

export async function resolveFormAudienceFamilies(
  admin: SupabaseClient,
  organizationId: string,
  classroomIds: string[],
): Promise<FormAudienceFamily[]> {
  if (classroomIds.length === 0) return [];

  const byFamily = new Map<string, Set<string>>();
  for (const classroomId of classroomIds) {
    const rows = await classroomFamilyStudents(admin, organizationId, classroomId);
    for (const row of rows) {
      const existing = byFamily.get(row.family_id) ?? new Set<string>();
      existing.add(row.student_id);
      byFamily.set(row.family_id, existing);
    }
  }

  const familyIds = [...byFamily.keys()];
  if (familyIds.length === 0) return [];

  const { data: students, error } = await admin
    .from("students")
    .select("id, first_name, last_name, family_id")
    .eq("organization_id", organizationId)
    .in("family_id", familyIds);

  if (error) throw error;

  const studentNameById = new Map<string, string>();
  for (const student of students ?? []) {
    const name = [student.first_name, student.last_name].filter(Boolean).join(" ").trim();
    studentNameById.set(String(student.id), name || "Student");
  }

  return familyIds.map((familyId) => {
    const studentIds = [...(byFamily.get(familyId) ?? [])];
    return {
      familyId,
      studentIds,
      studentNames: studentIds.map((id) => studentNameById.get(id) ?? "Student"),
    };
  });
}

export async function countFormAudienceFamilies(
  admin: SupabaseClient,
  organizationId: string,
  classroomIds: string[],
): Promise<number> {
  const result = await countFamiliesForClassroomIds(
    admin,
    organizationId,
    classroomIds,
  );
  return result.count;
}

export async function resolveFormAudienceFamiliesByIds(
  admin: SupabaseClient,
  organizationId: string,
  familyIds: string[],
): Promise<FormAudienceFamily[]> {
  if (familyIds.length === 0) return [];

  const { data: enrollmentRows, error } = await admin
    .from("enrollments")
    .select(
      `
      student_id,
      students!inner (
        id,
        first_name,
        last_name,
        family_id
      )
    `,
    )
    .eq("organization_id", organizationId)
    .eq("status", "enrolled")
    .in("students.family_id", familyIds);

  if (error) throw error;

  const byFamily = new Map<string, { studentIds: string[]; studentNames: string[] }>();
  for (const row of enrollmentRows ?? []) {
    const student = row.students as
      | {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          family_id?: string;
        }
      | {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          family_id?: string;
        }[]
      | null;
    const studentRow = Array.isArray(student) ? student[0] : student;
    if (!studentRow?.family_id || !studentRow.id) continue;

    const familyId = String(studentRow.family_id);
    if (!familyIds.includes(familyId)) continue;

    const name = [studentRow.first_name, studentRow.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    const existing = byFamily.get(familyId) ?? { studentIds: [], studentNames: [] };
    if (!existing.studentIds.includes(String(studentRow.id))) {
      existing.studentIds.push(String(studentRow.id));
      existing.studentNames.push(name || "Student");
      byFamily.set(familyId, existing);
    }
  }

  return familyIds
    .filter((familyId) => byFamily.has(familyId))
    .map((familyId) => {
      const family = byFamily.get(familyId)!;
      return {
        familyId,
        studentIds: family.studentIds,
        studentNames: family.studentNames,
      };
    });
}

export async function countFormAudienceFamiliesByIds(
  admin: SupabaseClient,
  organizationId: string,
  familyIds: string[],
): Promise<number> {
  const families = await resolveFormAudienceFamiliesByIds(
    admin,
    organizationId,
    familyIds,
  );
  return families.length;
}

export async function resolveFormAudienceForType(
  admin: SupabaseClient,
  organizationId: string,
  audienceType: TeacherFormAudienceType,
  classroomIds: string[],
  familyIds: string[],
): Promise<FormAudienceFamily[]> {
  if (audienceType === "families") {
    return resolveFormAudienceFamiliesByIds(admin, organizationId, familyIds);
  }
  if (audienceType === "classrooms") {
    return resolveFormAudienceFamilies(admin, organizationId, classroomIds);
  }
  return [];
}

export async function countFormAudienceForType(
  admin: SupabaseClient,
  organizationId: string,
  audienceType: TeacherFormAudienceType,
  classroomIds: string[],
  familyIds: string[],
): Promise<number> {
  if (audienceType === "families") {
    return countFormAudienceFamiliesByIds(admin, organizationId, familyIds);
  }
  if (audienceType === "classrooms") {
    return countFormAudienceFamilies(admin, organizationId, classroomIds);
  }
  return 0;
}
