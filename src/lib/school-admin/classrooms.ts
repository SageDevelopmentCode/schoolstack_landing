import type { SupabaseClient } from "@supabase/supabase-js";
import {
  assignStudentsToStaff,
  fetchClassroomLeadTeachersByStudentIds,
  formatAssignedTeacherNames,
  formatStaffMemberName,
  listOrgEnrolledStudents,
  unassignStudentFromStaff,
  type AdminEnrolledStudentSummary,
  type AssignedTeacher,
} from "@/lib/school-admin/enrolled-students";

export type ClassroomStatus = "open" | "full" | "inactive";

export type ClassroomStaffRole = "lead" | "assistant";

export type ClassroomStaffAssignment = {
  id: string;
  staffMemberId: string;
  name: string;
  role: ClassroomStaffRole;
};

export type ClassroomSummary = {
  id: string;
  name: string;
  programId: string | null;
  programName: string | null;
  status: ClassroomStatus;
  studentCount: number;
  staffCount: number;
  leadTeacherNames: string[];
  createdAt: string;
  updatedAt: string;
};

export type ClassroomDetail = ClassroomSummary & {
  staff: ClassroomStaffAssignment[];
};

export type StaffClassroomOption = {
  id: string;
  name: string;
  studentCount: number;
};

export type SetStudentClassroomsResult = {
  classroomIds: string[];
  classroomNames: string[];
  assignedTeachers: AssignedTeacher[];
  assignedTeacherNames: string;
};

export class ClassroomError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ClassroomError";
    this.code = code;
    this.status = status;
  }
}

type CreateClassroomInput = {
  organizationId: string;
  name: string;
  programId?: string | null;
  status?: ClassroomStatus;
};

type UpdateClassroomInput = {
  organizationId: string;
  classroomId: string;
  name?: string;
  programId?: string | null;
  status?: ClassroomStatus;
};

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapClassroomStatus(value: unknown): ClassroomStatus {
  if (value === "full" || value === "inactive") return value;
  return "open";
}

async function assertClassroomInOrg(
  supabase: SupabaseClient,
  organizationId: string,
  classroomId: string,
): Promise<{ id: string; programId: string | null; name: string }> {
  const { data, error } = await supabase
    .from("classrooms")
    .select("id, program_id, name")
    .eq("organization_id", organizationId)
    .eq("id", classroomId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new ClassroomError("Classroom not found.", "not_found", 404);
  }

  return {
    id: String(data.id),
    programId: data.program_id ? String(data.program_id) : null,
    name: String(data.name),
  };
}

async function fetchStudentCountsByClassroomIds(
  supabase: SupabaseClient,
  organizationId: string,
  classroomIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (classroomIds.length === 0) return counts;

  const { data, error } = await supabase
    .from("enrollments")
    .select("classroom_id, student_id")
    .eq("organization_id", organizationId)
    .eq("status", "enrolled")
    .in("classroom_id", classroomIds);

  if (error) throw error;

  const uniqueStudentsByClassroom = new Map<string, Set<string>>();
  for (const row of data ?? []) {
    const classroomId = row.classroom_id ? String(row.classroom_id) : null;
    if (!classroomId) continue;
    const studentId = String(row.student_id);
    const set = uniqueStudentsByClassroom.get(classroomId) ?? new Set<string>();
    set.add(studentId);
    uniqueStudentsByClassroom.set(classroomId, set);
  }

  for (const [classroomId, studentIds] of uniqueStudentsByClassroom) {
    counts.set(classroomId, studentIds.size);
  }

  return counts;
}

async function fetchStaffCountsByClassroomIds(
  supabase: SupabaseClient,
  organizationId: string,
  classroomIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (classroomIds.length === 0) return counts;

  const { data, error } = await supabase
    .from("classroom_staff_assignments")
    .select("classroom_id")
    .eq("organization_id", organizationId)
    .in("classroom_id", classroomIds);

  if (error) throw error;

  for (const row of data ?? []) {
    const classroomId = String(row.classroom_id);
    counts.set(classroomId, (counts.get(classroomId) ?? 0) + 1);
  }

  return counts;
}

async function fetchLeadTeacherNamesByClassroomIds(
  supabase: SupabaseClient,
  organizationId: string,
  classroomIds: string[],
): Promise<Map<string, string[]>> {
  const namesByClassroom = new Map<string, string[]>();
  if (classroomIds.length === 0) return namesByClassroom;

  const { data, error } = await supabase
    .from("classroom_staff_assignments")
    .select(
      `
      classroom_id,
      staff_members!inner (
        first_name,
        last_name
      )
    `,
    )
    .eq("organization_id", organizationId)
    .eq("role", "lead")
    .in("classroom_id", classroomIds);

  if (error) throw error;

  for (const row of data ?? []) {
    const classroomId = String(row.classroom_id);
    const member = unwrapRelation(
      row.staff_members as
        | { first_name?: string; last_name?: string }
        | { first_name?: string; last_name?: string }[]
        | null,
    );
    if (!member) continue;

    const name = formatStaffMemberName({
      firstName: String(member.first_name ?? ""),
      lastName: String(member.last_name ?? ""),
    });
    const list = namesByClassroom.get(classroomId) ?? [];
    if (!list.includes(name)) {
      list.push(name);
    }
    namesByClassroom.set(classroomId, list);
  }

  for (const [classroomId, names] of namesByClassroom) {
    namesByClassroom.set(
      classroomId,
      [...names].sort((a, b) => a.localeCompare(b)),
    );
  }

  return namesByClassroom;
}

async function getLeadStaffIdsForClassroom(
  supabase: SupabaseClient,
  organizationId: string,
  classroomId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("classroom_staff_assignments")
    .select("staff_member_id")
    .eq("organization_id", organizationId)
    .eq("classroom_id", classroomId)
    .eq("role", "lead");

  if (error) throw error;
  return (data ?? []).map((row) => String(row.staff_member_id));
}

async function getClassroomIdsForStudent(
  supabase: SupabaseClient,
  organizationId: string,
  studentId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("enrollments")
    .select("classroom_id")
    .eq("organization_id", organizationId)
    .eq("student_id", studentId)
    .eq("status", "enrolled")
    .not("classroom_id", "is", null);

  if (error) throw error;

  return [
    ...new Set(
      (data ?? [])
        .map((row) => (row.classroom_id ? String(row.classroom_id) : null))
        .filter((id): id is string => id != null),
    ),
  ];
}

async function getLeadClassroomIdsForStaff(
  supabase: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("classroom_staff_assignments")
    .select("classroom_id")
    .eq("organization_id", organizationId)
    .eq("staff_member_id", staffMemberId)
    .eq("role", "lead");

  if (error) throw error;
  return (data ?? []).map((row) => String(row.classroom_id));
}

async function studentSharesLeadClassroomWithStaff(
  supabase: SupabaseClient,
  organizationId: string,
  studentId: string,
  staffMemberId: string,
  excludeClassroomId?: string,
): Promise<boolean> {
  const [studentClassrooms, staffLeadClassrooms] = await Promise.all([
    getClassroomIdsForStudent(supabase, organizationId, studentId),
    getLeadClassroomIdsForStaff(supabase, organizationId, staffMemberId),
  ]);

  return studentClassrooms.some(
    (classroomId) =>
      classroomId !== excludeClassroomId &&
      staffLeadClassrooms.includes(classroomId),
  );
}

async function getClassroomStudentIds(
  supabase: SupabaseClient,
  organizationId: string,
  classroomId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("enrollments")
    .select("student_id")
    .eq("organization_id", organizationId)
    .eq("classroom_id", classroomId)
    .eq("status", "enrolled");

  if (error) throw error;

  return [
    ...new Set((data ?? []).map((row) => String(row.student_id))),
  ];
}

async function syncAssignStudentsToLeadTeachers(
  supabase: SupabaseClient,
  organizationId: string,
  classroomId: string,
  studentIds: string[],
): Promise<void> {
  if (studentIds.length === 0) return;

  const leadStaffIds = await getLeadStaffIdsForClassroom(
    supabase,
    organizationId,
    classroomId,
  );

  for (const staffMemberId of leadStaffIds) {
    await assignStudentsToStaff(supabase, {
      organizationId,
      staffMemberId,
      studentIds,
    });
  }
}

async function syncUnassignStudentFromLeadTeachers(
  supabase: SupabaseClient,
  organizationId: string,
  classroomId: string,
  studentIds: string[],
): Promise<void> {
  const leadStaffIds = await getLeadStaffIdsForClassroom(
    supabase,
    organizationId,
    classroomId,
  );

  for (const studentId of studentIds) {
    for (const staffMemberId of leadStaffIds) {
      const stillShared = await studentSharesLeadClassroomWithStaff(
        supabase,
        organizationId,
        studentId,
        staffMemberId,
        classroomId,
      );

      if (!stillShared) {
        await unassignStudentFromStaff(supabase, {
          organizationId,
          staffMemberId,
          studentId,
        });
      }
    }
  }
}

async function syncUnassignRosterFromRemovedLeadStaff(
  supabase: SupabaseClient,
  organizationId: string,
  classroomId: string,
  staffMemberId: string,
): Promise<void> {
  const studentIds = await getClassroomStudentIds(
    supabase,
    organizationId,
    classroomId,
  );

  for (const studentId of studentIds) {
    const stillShared = await studentSharesLeadClassroomWithStaff(
      supabase,
      organizationId,
      studentId,
      staffMemberId,
      classroomId,
    );

    if (!stillShared) {
      await unassignStudentFromStaff(supabase, {
        organizationId,
        staffMemberId,
        studentId,
      });
    }
  }
}

async function updateStudentClassroomOnEnrollments(
  supabase: SupabaseClient,
  organizationId: string,
  classroomId: string | null,
  programId: string | null,
  studentIds: string[],
): Promise<void> {
  for (const studentId of studentIds) {
    let query = supabase
      .from("enrollments")
      .update({ classroom_id: classroomId })
      .eq("organization_id", organizationId)
      .eq("student_id", studentId)
      .eq("status", "enrolled");

    if (programId) {
      query = query.eq("program_id", programId);
    }

    const { error } = await query;
    if (error) throw error;
  }
}

function mapClassroomRow(
  row: Record<string, unknown>,
  studentCount: number,
  staffCount: number,
  leadTeacherNames: string[] = [],
): ClassroomSummary {
  const program = unwrapRelation(
    row.programs as { id?: string; name?: string } | { id?: string; name?: string }[] | null,
  );

  return {
    id: String(row.id),
    name: String(row.name),
    programId: row.program_id ? String(row.program_id) : null,
    programName: program?.name ? String(program.name) : null,
    status: mapClassroomStatus(row.status),
    studentCount,
    staffCount,
    leadTeacherNames,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

export function resolveClassroomIdForEnrollment(
  enrollmentProgramId: string | null,
  programToClassroomId: Map<string, string>,
): string | null {
  const programKey = enrollmentProgramId ?? "__none__";
  return (
    programToClassroomId.get(programKey) ??
    programToClassroomId.get("__none__") ??
    null
  );
}

export async function listClassrooms(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<ClassroomSummary[]> {
  const { data, error } = await supabase
    .from("classrooms")
    .select(
      `
      id,
      name,
      program_id,
      status,
      created_at,
      updated_at,
      programs ( id, name )
    `,
    )
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (error) throw error;

  const classroomIds = (data ?? []).map((row) => String(row.id));
  const [studentCounts, staffCounts, leadTeacherNamesByClassroom] =
    await Promise.all([
      fetchStudentCountsByClassroomIds(supabase, organizationId, classroomIds),
      fetchStaffCountsByClassroomIds(supabase, organizationId, classroomIds),
      fetchLeadTeacherNamesByClassroomIds(supabase, organizationId, classroomIds),
    ]);

  return (data ?? []).map((row) =>
    mapClassroomRow(
      row as Record<string, unknown>,
      studentCounts.get(String(row.id)) ?? 0,
      staffCounts.get(String(row.id)) ?? 0,
      leadTeacherNamesByClassroom.get(String(row.id)) ?? [],
    ),
  );
}

export async function getClassroomDetail(
  supabase: SupabaseClient,
  organizationId: string,
  classroomId: string,
): Promise<ClassroomDetail> {
  const { data, error } = await supabase
    .from("classrooms")
    .select(
      `
      id,
      name,
      program_id,
      status,
      created_at,
      updated_at,
      programs ( id, name )
    `,
    )
    .eq("organization_id", organizationId)
    .eq("id", classroomId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new ClassroomError("Classroom not found.", "not_found", 404);
  }

  const [studentCounts, staffCounts, staffRows] = await Promise.all([
    fetchStudentCountsByClassroomIds(supabase, organizationId, [classroomId]),
    fetchStaffCountsByClassroomIds(supabase, organizationId, [classroomId]),
    supabase
      .from("classroom_staff_assignments")
      .select(
        `
        id,
        staff_member_id,
        role,
        staff_members!inner (
          id,
          first_name,
          last_name
        )
      `,
      )
      .eq("organization_id", organizationId)
      .eq("classroom_id", classroomId)
      .order("created_at", { ascending: true }),
  ]);

  if (staffRows.error) throw staffRows.error;

  const staff: ClassroomStaffAssignment[] = (staffRows.data ?? [])
    .map((row) => {
      const member = unwrapRelation(
        row.staff_members as
          | { id?: string; first_name?: string; last_name?: string }
          | { id?: string; first_name?: string; last_name?: string }[]
          | null,
      );
      if (!member?.id) return null;

      return {
        id: String(row.id),
        staffMemberId: String(member.id),
        name: formatStaffMemberName({
          firstName: String(member.first_name ?? ""),
          lastName: String(member.last_name ?? ""),
        }),
        role: row.role === "assistant" ? "assistant" : "lead",
      };
    })
    .filter((entry): entry is ClassroomStaffAssignment => entry != null);

  const summary = mapClassroomRow(
    data as Record<string, unknown>,
    studentCounts.get(classroomId) ?? 0,
    staffCounts.get(classroomId) ?? 0,
    staff
      .filter((member) => member.role === "lead")
      .map((member) => member.name)
      .sort((a, b) => a.localeCompare(b)),
  );

  return { ...summary, staff };
}

export async function createClassroom(
  supabase: SupabaseClient,
  input: CreateClassroomInput,
): Promise<ClassroomSummary> {
  const name = input.name.trim();
  if (!name) {
    throw new ClassroomError("Classroom name is required.", "invalid_input", 400);
  }

  if (input.programId) {
    const { data: programRow, error: programError } = await supabase
      .from("programs")
      .select("id")
      .eq("organization_id", input.organizationId)
      .eq("id", input.programId)
      .maybeSingle();

    if (programError) throw programError;
    if (!programRow) {
      throw new ClassroomError("Program not found.", "not_found", 404);
    }
  }

  const { data, error } = await supabase
    .from("classrooms")
    .insert({
      organization_id: input.organizationId,
      name,
      program_id: input.programId ?? null,
      status: input.status ?? "open",
    })
    .select(
      `
      id,
      name,
      program_id,
      status,
      created_at,
      updated_at,
      programs ( id, name )
    `,
    )
    .single();

  if (error) throw error;

  return mapClassroomRow(data as Record<string, unknown>, 0, 0);
}

export async function updateClassroom(
  supabase: SupabaseClient,
  input: UpdateClassroomInput,
): Promise<ClassroomSummary> {
  await assertClassroomInOrg(
    supabase,
    input.organizationId,
    input.classroomId,
  );

  const patch: Record<string, unknown> = {};

  if (input.name != null) {
    const name = input.name.trim();
    if (!name) {
      throw new ClassroomError("Classroom name is required.", "invalid_input", 400);
    }
    patch.name = name;
  }

  if (input.status != null) {
    patch.status = input.status;
  }

  if (input.programId !== undefined) {
    if (input.programId) {
      const { data: programRow, error: programError } = await supabase
        .from("programs")
        .select("id")
        .eq("organization_id", input.organizationId)
        .eq("id", input.programId)
        .maybeSingle();

      if (programError) throw programError;
      if (!programRow) {
        throw new ClassroomError("Program not found.", "not_found", 404);
      }
    }
    patch.program_id = input.programId;
  }

  if (Object.keys(patch).length === 0) {
    return getClassroomDetail(supabase, input.organizationId, input.classroomId);
  }

  const { data, error } = await supabase
    .from("classrooms")
    .update(patch)
    .eq("organization_id", input.organizationId)
    .eq("id", input.classroomId)
    .select(
      `
      id,
      name,
      program_id,
      status,
      created_at,
      updated_at,
      programs ( id, name )
    `,
    )
    .single();

  if (error) throw error;

  const [studentCounts, staffCounts] = await Promise.all([
    fetchStudentCountsByClassroomIds(supabase, input.organizationId, [
      input.classroomId,
    ]),
    fetchStaffCountsByClassroomIds(supabase, input.organizationId, [
      input.classroomId,
    ]),
  ]);

  return mapClassroomRow(
    data as Record<string, unknown>,
    studentCounts.get(input.classroomId) ?? 0,
    staffCounts.get(input.classroomId) ?? 0,
  );
}

export async function deleteClassroom(
  supabase: SupabaseClient,
  organizationId: string,
  classroomId: string,
): Promise<void> {
  await assertClassroomInOrg(supabase, organizationId, classroomId);

  const studentIds = await getClassroomStudentIds(
    supabase,
    organizationId,
    classroomId,
  );

  await updateStudentClassroomOnEnrollments(
    supabase,
    organizationId,
    null,
    null,
    studentIds,
  );

  await syncUnassignStudentFromLeadTeachers(
    supabase,
    organizationId,
    classroomId,
    studentIds,
  );

  const { error } = await supabase
    .from("classrooms")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", classroomId);

  if (error) throw error;
}

export async function listClassroomStaff(
  supabase: SupabaseClient,
  organizationId: string,
  classroomId: string,
): Promise<ClassroomStaffAssignment[]> {
  const detail = await getClassroomDetail(supabase, organizationId, classroomId);
  return detail.staff;
}

export async function assignStaffToClassroom(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    classroomId: string;
    staffMemberId: string;
    role?: ClassroomStaffRole;
  },
): Promise<void> {
  const classroom = await assertClassroomInOrg(
    supabase,
    input.organizationId,
    input.classroomId,
  );

  const { data: staffRow, error: staffError } = await supabase
    .from("staff_members")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("id", input.staffMemberId)
    .maybeSingle();

  if (staffError) throw staffError;
  if (!staffRow) {
    throw new ClassroomError("Staff member not found.", "not_found", 404);
  }

  const role = input.role ?? "lead";

  const { error } = await supabase.from("classroom_staff_assignments").upsert(
    {
      organization_id: input.organizationId,
      classroom_id: input.classroomId,
      staff_member_id: input.staffMemberId,
      role,
    },
    { onConflict: "classroom_id,staff_member_id" },
  );

  if (error) throw error;

  if (role === "lead") {
    const studentIds = await getClassroomStudentIds(
      supabase,
      input.organizationId,
      classroom.id,
    );
    await syncAssignStudentsToLeadTeachers(
      supabase,
      input.organizationId,
      classroom.id,
      studentIds,
    );
  }
}

export async function removeStaffFromClassroom(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    classroomId: string;
    staffMemberId: string;
  },
): Promise<void> {
  const { data: existing, error: existingError } = await supabase
    .from("classroom_staff_assignments")
    .select("role")
    .eq("organization_id", input.organizationId)
    .eq("classroom_id", input.classroomId)
    .eq("staff_member_id", input.staffMemberId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (!existing) return;

  const { error } = await supabase
    .from("classroom_staff_assignments")
    .delete()
    .eq("organization_id", input.organizationId)
    .eq("classroom_id", input.classroomId)
    .eq("staff_member_id", input.staffMemberId);

  if (error) throw error;

  if (existing.role === "lead") {
    await syncUnassignRosterFromRemovedLeadStaff(
      supabase,
      input.organizationId,
      input.classroomId,
      input.staffMemberId,
    );
  }
}

export async function listClassroomStudents(
  supabase: SupabaseClient,
  organizationId: string,
  classroomId: string,
): Promise<AdminEnrolledStudentSummary[]> {
  await assertClassroomInOrg(supabase, organizationId, classroomId);

  const studentIds = await getClassroomStudentIds(
    supabase,
    organizationId,
    classroomId,
  );

  if (studentIds.length === 0) return [];

  const studentIdSet = new Set(studentIds);
  const allStudents = await listOrgEnrolledStudents(supabase, organizationId, {
    limit: 500,
  });

  return allStudents
    .filter((student) => studentIdSet.has(student.id))
    .sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`),
    );
}

export async function assignStudentsToClassroom(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    classroomId: string;
    studentIds: string[];
  },
): Promise<void> {
  const classroom = await assertClassroomInOrg(
    supabase,
    input.organizationId,
    input.classroomId,
  );

  const uniqueStudentIds = [...new Set(input.studentIds.filter(Boolean))];
  if (uniqueStudentIds.length === 0) return;

  const { data: studentRows, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("organization_id", input.organizationId)
    .in("id", uniqueStudentIds);

  if (studentError) throw studentError;
  if ((studentRows ?? []).length !== uniqueStudentIds.length) {
    throw new ClassroomError("Student not found.", "not_found", 404);
  }

  await updateStudentClassroomOnEnrollments(
    supabase,
    input.organizationId,
    classroom.id,
    classroom.programId,
    uniqueStudentIds,
  );

  await syncAssignStudentsToLeadTeachers(
    supabase,
    input.organizationId,
    classroom.id,
    uniqueStudentIds,
  );
}

export async function removeStudentFromClassroom(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    classroomId: string;
    studentId: string;
  },
): Promise<void> {
  await assertClassroomInOrg(
    supabase,
    input.organizationId,
    input.classroomId,
  );

  const { error } = await supabase
    .from("enrollments")
    .update({ classroom_id: null })
    .eq("organization_id", input.organizationId)
    .eq("classroom_id", input.classroomId)
    .eq("student_id", input.studentId)
    .eq("status", "enrolled");

  if (error) throw error;

  await syncUnassignStudentFromLeadTeachers(
    supabase,
    input.organizationId,
    input.classroomId,
    [input.studentId],
  );
}

export async function setStudentClassrooms(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    studentId: string;
    classroomIds: string[];
  },
): Promise<SetStudentClassroomsResult> {
  const { data: studentRow, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("id", input.studentId)
    .maybeSingle();

  if (studentError) throw studentError;
  if (!studentRow) {
    throw new ClassroomError("Student not found.", "not_found", 404);
  }

  const uniqueClassroomIds = [...new Set(input.classroomIds.filter(Boolean))];

  const classroomsById = new Map<
    string,
    { id: string; programId: string | null; name: string }
  >();

  if (uniqueClassroomIds.length > 0) {
    const { data: classroomRows, error: classroomError } = await supabase
      .from("classrooms")
      .select("id, program_id, name")
      .eq("organization_id", input.organizationId)
      .in("id", uniqueClassroomIds);

    if (classroomError) throw classroomError;

    for (const row of classroomRows ?? []) {
      classroomsById.set(String(row.id), {
        id: String(row.id),
        programId: row.program_id ? String(row.program_id) : null,
        name: String(row.name),
      });
    }

    if (classroomsById.size !== uniqueClassroomIds.length) {
      throw new ClassroomError("Classroom not found.", "not_found", 404);
    }
  }

  const programToClassroomId = new Map<string, string>();
  for (const classroomId of uniqueClassroomIds) {
    const classroom = classroomsById.get(classroomId);
    if (!classroom) continue;

    const programKey = classroom.programId ?? "__none__";
    if (programToClassroomId.has(programKey)) {
      throw new ClassroomError(
        "Only one classroom can be selected per program.",
        "duplicate_program",
        400,
      );
    }
    programToClassroomId.set(programKey, classroomId);
  }

  const { data: enrollmentRows, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id, program_id, classroom_id")
    .eq("organization_id", input.organizationId)
    .eq("student_id", input.studentId)
    .eq("status", "enrolled");

  if (enrollmentError) throw enrollmentError;

  for (const enrollment of enrollmentRows ?? []) {
    const programKey = enrollment.program_id
      ? String(enrollment.program_id)
      : null;
    const nextClassroomId = resolveClassroomIdForEnrollment(
      programKey,
      programToClassroomId,
    );
    const previousClassroomId = enrollment.classroom_id
      ? String(enrollment.classroom_id)
      : null;

    if (previousClassroomId === nextClassroomId) continue;

    const { error: updateError } = await supabase
      .from("enrollments")
      .update({ classroom_id: nextClassroomId })
      .eq("id", enrollment.id);

    if (updateError) throw updateError;

    if (previousClassroomId) {
      await syncUnassignStudentFromLeadTeachers(
        supabase,
        input.organizationId,
        previousClassroomId,
        [input.studentId],
      );
    }

    if (nextClassroomId) {
      await syncAssignStudentsToLeadTeachers(
        supabase,
        input.organizationId,
        nextClassroomId,
        [input.studentId],
      );
    }
  }

  const result = await buildStudentClassroomAssignmentSummary(
    supabase,
    input.organizationId,
    input.studentId,
  );

  if (uniqueClassroomIds.length > 0 && result.classroomIds.length === 0) {
    throw new ClassroomError(
      "Selected classroom doesn't apply to this student's program.",
      "no_matching_enrollment",
      400,
    );
  }

  return result;
}

async function buildStudentClassroomAssignmentSummary(
  supabase: SupabaseClient,
  organizationId: string,
  studentId: string,
): Promise<SetStudentClassroomsResult> {
  const classroomIds = await getClassroomIdsForStudent(
    supabase,
    organizationId,
    studentId,
  );

  let classroomNames: string[] = [];
  if (classroomIds.length > 0) {
    const { data, error } = await supabase
      .from("classrooms")
      .select("id, name")
      .eq("organization_id", organizationId)
      .in("id", classroomIds);

    if (error) throw error;

    const namesById = new Map(
      (data ?? []).map((row) => [String(row.id), String(row.name)]),
    );
    classroomNames = classroomIds
      .map((id) => namesById.get(id))
      .filter((name): name is string => Boolean(name))
      .sort((a, b) => a.localeCompare(b));
  }

  const teachersByStudentId = await fetchClassroomLeadTeachersByStudentIds(
    supabase,
    organizationId,
    [studentId],
  );
  const assignedTeachers = teachersByStudentId.get(studentId) ?? [];

  return {
    classroomIds,
    classroomNames,
    assignedTeachers,
    assignedTeacherNames: formatAssignedTeacherNames(assignedTeachers),
  };
}

export async function setStudentClassroom(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    studentId: string;
    classroomId: string | null;
  },
): Promise<SetStudentClassroomsResult> {
  return setStudentClassrooms(supabase, {
    organizationId: input.organizationId,
    studentId: input.studentId,
    classroomIds: input.classroomId ? [input.classroomId] : [],
  });
}

export async function listStaffClassroomsForTeacher(
  supabase: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
): Promise<StaffClassroomOption[]> {
  const { data, error } = await supabase
    .from("classroom_staff_assignments")
    .select(
      `
      classroom_id,
      classrooms!inner (
        id,
        name
      )
    `,
    )
    .eq("organization_id", organizationId)
    .eq("staff_member_id", staffMemberId);

  if (error) throw error;

  const classrooms = (data ?? [])
    .map((row) => {
      const classroom = unwrapRelation(
        row.classrooms as { id?: string; name?: string } | { id?: string; name?: string }[] | null,
      );
      if (!classroom?.id) return null;
      return {
        id: String(classroom.id),
        name: String(classroom.name ?? "Classroom"),
      };
    })
    .filter((entry): entry is { id: string; name: string } => entry != null);

  const uniqueById = new Map<string, { id: string; name: string }>();
  for (const classroom of classrooms) {
    uniqueById.set(classroom.id, classroom);
  }

  const classroomIds = [...uniqueById.keys()];
  const studentCounts = await fetchStudentCountsByClassroomIds(
    supabase,
    organizationId,
    classroomIds,
  );

  return [...uniqueById.values()]
    .map((classroom) => ({
      id: classroom.id,
      name: classroom.name,
      studentCount: studentCounts.get(classroom.id) ?? 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function listProgramsForClassroomPicker(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase
    .from("programs")
    .select("id, name")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
  }));
}
