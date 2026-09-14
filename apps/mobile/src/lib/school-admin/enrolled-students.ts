import type { SupabaseClient } from "@supabase/supabase-js";
import { formatShortDate } from "@/lib/admissions/application-submissions";
import { STUDENT_GRADE_OPTIONS } from "@/lib/admissions/apply-system-fields";

export type AssignedTeacher = {
  id: string;
  name: string;
};

export type AdminEnrolledStudentSummary = {
  id: string;
  firstName: string;
  lastName: string;
  grade: string | null;
  dateOfBirth: string | null;
  status: string;
  familyId: string;
  familyName: string | null;
  primaryContactName: string | null;
  primaryContactEmail: string | null;
  programNames: string[];
  programIds: string[];
  classroomNames: string[];
  classroomIds: string[];
  enrolledAt: string;
  assignedTeachers: AssignedTeacher[];
  assignedTeacherNames: string;
  profilePhotoUrl: string | null;
  hasStandingHealthItems: boolean;
};

export type EnrolledStudentEnrollment = {
  id: string;
  programName: string;
  classroomName: string | null;
  classroomIds: string[];
  enrolledAt: string;
};

export type EnrolledStudentDetail = {
  id: string;
  firstName: string;
  lastName: string;
  grade: string | null;
  dateOfBirth: string | null;
  status: string;
  familyId: string;
  familyName: string | null;
  familyPrimaryEmail: string | null;
  familyPrimaryPhone: string | null;
  programNames: string[];
  programIds: string[];
  classroomNames: string[];
  classroomIds: string[];
  enrollments: EnrolledStudentEnrollment[];
  applicationId: string | null;
  applicationStatus: string | null;
  assignedTeachers: AssignedTeacher[];
  assignedTeacherNames: string;
  profilePhotoUrl: string | null;
};

const ENROLLED_ENROLLMENT_SELECT = `
  id,
  created_at,
  status,
  students!inner (
    id,
    first_name,
    last_name,
    grade,
    date_of_birth,
    status,
    family_id,
    profile_photo_url,
    families (
      name,
      primary_email,
      primary_phone
    )
  ),
  programs (
    id,
    name
  ),
  enrollment_classrooms (
    classrooms (
      id,
      name
    )
  )
`;

export const ORG_ENROLLED_STUDENTS_DEFAULT_LIMIT = 500;

export type ListOrgEnrolledStudentsOptions = {
  limit?: number;
};

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function formatPersonName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

function studentStatusLabel(status: string): string {
  switch (status) {
    case "active":
      return "Active";
    case "prospect":
      return "Prospect";
    case "inactive":
      return "Inactive";
    case "alumni":
      return "Alumni";
    default:
      return status.replace(/_/g, " ");
  }
}

export function formatEnrolledStudentName(student: {
  firstName: string;
  lastName: string;
}): string {
  return formatPersonName(student.firstName, student.lastName) || "Student";
}

export function formatEnrolledStudentSubtitle(
  students: AdminEnrolledStudentSummary[],
): string {
  return students.map(formatEnrolledStudentName).join(" · ");
}

export function formatEnrolledStudentFirstNames(
  students: AdminEnrolledStudentSummary[],
): string {
  return students
    .map((student) => student.firstName.trim())
    .filter(Boolean)
    .join(" · ");
}

export function formatStudentGrade(grade: string | null | undefined): string | null {
  if (!grade) return null;
  const normalized = grade.trim().toLowerCase();
  const match = STUDENT_GRADE_OPTIONS.find((option) => option.value === normalized);
  return match?.label ?? grade;
}

export function formatStaffMemberName(member: {
  firstName: string;
  lastName: string;
}): string {
  return formatPersonName(member.firstName, member.lastName) || "Staff member";
}

export function formatAssignedTeacherNames(
  teachers?: AssignedTeacher[] | null,
): string {
  return (teachers ?? []).map((teacher) => teacher.name).join(", ");
}

export function formatAssignedTeachersLabel(
  teachers?: AssignedTeacher[] | null,
): string {
  const list = teachers ?? [];
  if (list.length === 0) return "Unassigned";
  if (list.length <= 2) return formatAssignedTeacherNames(list);
  return `${list[0].name}, ${list[1].name} +${list.length - 2}`;
}

export function studentHasAssignedTeacher(
  student: Pick<AdminEnrolledStudentSummary, "assignedTeachers">,
  staffMemberId: string,
): boolean {
  return (student.assignedTeachers ?? []).some((teacher) => teacher.id === staffMemberId);
}

type LegacyEnrolledStudentSummary = Partial<AdminEnrolledStudentSummary> & {
  assignedTeacherId?: string | null;
  assignedTeacherName?: string | null;
};

function resolveAssignedTeachers(
  student: LegacyEnrolledStudentSummary,
): AssignedTeacher[] {
  if (Array.isArray(student.assignedTeachers)) {
    return student.assignedTeachers;
  }

  const legacyId =
    typeof student.assignedTeacherId === "string"
      ? student.assignedTeacherId.trim()
      : "";
  const legacyName =
    typeof student.assignedTeacherName === "string"
      ? student.assignedTeacherName.trim()
      : "";

  if (legacyId && legacyName) {
    return [{ id: legacyId, name: legacyName }];
  }

  return [];
}

export function normalizeEnrolledStudentSummary(
  student: LegacyEnrolledStudentSummary,
): AdminEnrolledStudentSummary {
  const assignedTeachers = resolveAssignedTeachers(student);
  const assignedTeacherNames =
    typeof student.assignedTeacherNames === "string"
      ? student.assignedTeacherNames
      : formatAssignedTeacherNames(assignedTeachers);

  return {
    id: String(student.id ?? ""),
    firstName: String(student.firstName ?? ""),
    lastName: String(student.lastName ?? ""),
    grade: typeof student.grade === "string" ? student.grade : null,
    dateOfBirth:
      typeof student.dateOfBirth === "string" ? student.dateOfBirth : null,
    status: String(student.status ?? "active"),
    familyId: String(student.familyId ?? ""),
    familyName:
      typeof student.familyName === "string" ? student.familyName : null,
    primaryContactName:
      typeof student.primaryContactName === "string"
        ? student.primaryContactName
        : null,
    primaryContactEmail:
      typeof student.primaryContactEmail === "string"
        ? student.primaryContactEmail
        : null,
    programNames: Array.isArray(student.programNames) ? student.programNames : [],
    programIds: Array.isArray(student.programIds) ? student.programIds : [],
    classroomNames: Array.isArray(student.classroomNames) ? student.classroomNames : [],
    classroomIds: Array.isArray(student.classroomIds) ? student.classroomIds : [],
    enrolledAt: String(student.enrolledAt ?? ""),
    assignedTeachers,
    assignedTeacherNames,
    profilePhotoUrl:
      typeof student.profilePhotoUrl === "string" &&
      student.profilePhotoUrl.trim() !== ""
        ? student.profilePhotoUrl.trim()
        : null,
    hasStandingHealthItems: student.hasStandingHealthItems === true,
  };
}

export function normalizeEnrolledStudentSummaries(
  students: LegacyEnrolledStudentSummary[],
): AdminEnrolledStudentSummary[] {
  return students.map(normalizeEnrolledStudentSummary);
}

export class StudentTeacherAssignmentError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "StudentTeacherAssignmentError";
    this.code = code;
    this.status = status;
  }
}

export type SetStudentTeachersInput = {
  organizationId: string;
  studentId: string;
  staffMemberIds: string[];
};

export type SetStudentTeachersResult = {
  assignedTeachers: AssignedTeacher[];
  assignedTeacherNames: string;
};

export type AssignStudentsToStaffInput = {
  organizationId: string;
  staffMemberId: string;
  studentIds: string[];
};

export type UnassignStudentFromStaffInput = {
  organizationId: string;
  staffMemberId: string;
  studentId: string;
};

export { studentStatusLabel };

async function fetchPrimaryContactsByFamilyId(
  supabase: SupabaseClient,
  organizationId: string,
  familyIds: string[],
): Promise<Map<string, { name: string | null; email: string | null }>> {
  const result = new Map<string, { name: string | null; email: string | null }>();
  if (familyIds.length === 0) return result;

  const { data, error } = await supabase
    .from("guardians")
    .select("family_id, first_name, last_name, email")
    .eq("organization_id", organizationId)
    .in("family_id", familyIds)
    .order("created_at", { ascending: true });

  if (error) throw error;

  for (const row of data ?? []) {
    const familyId = String(row.family_id);
    if (result.has(familyId)) continue;

    const name = formatPersonName(
      String(row.first_name ?? ""),
      String(row.last_name ?? ""),
    );
    const email = typeof row.email === "string" ? row.email.trim() || null : null;
    result.set(familyId, {
      name: name || null,
      email,
    });
  }

  return result;
}

type EnrollmentAggregate = {
  summary: AdminEnrolledStudentSummary;
  programNameSet: Set<string>;
  programIdSet: Set<string>;
  classroomNameSet: Set<string>;
  classroomIdSet: Set<string>;
};

type StudentRow = {
  id?: string;
  first_name?: string;
  last_name?: string;
  grade?: string | null;
  date_of_birth?: string | null;
  status?: string;
  family_id?: string;
  profile_photo_url?: string | null;
  families?:
    | {
        name?: string;
        primary_email?: string | null;
        primary_phone?: string | null;
      }
    | {
        name?: string;
        primary_email?: string | null;
        primary_phone?: string | null;
      }[]
    | null;
};

async function fetchTeacherAssignmentsByStudentIds(
  supabase: SupabaseClient,
  organizationId: string,
  studentIds: string[],
): Promise<Map<string, AssignedTeacher[]>> {
  const result = new Map<string, AssignedTeacher[]>();
  if (studentIds.length === 0) return result;

  const { data, error } = await supabase
    .from("student_teacher_assignments")
    .select(
      `
      student_id,
      staff_members!inner (
        id,
        first_name,
        last_name
      )
    `,
    )
    .eq("organization_id", organizationId)
    .in("student_id", studentIds);

  if (error) throw error;

  for (const row of data ?? []) {
    const studentId = String(row.student_id);
    const staffMember = unwrapRelation(
      row.staff_members as
        | { id?: string; first_name?: string; last_name?: string }
        | { id?: string; first_name?: string; last_name?: string }[]
        | null,
    );
    if (!staffMember?.id) continue;

    const teacher: AssignedTeacher = {
      id: String(staffMember.id),
      name: formatStaffMemberName({
        firstName: String(staffMember.first_name ?? ""),
        lastName: String(staffMember.last_name ?? ""),
      }),
    };

    const list = result.get(studentId) ?? [];
    list.push(teacher);
    result.set(studentId, list);
  }

  for (const [studentId, teachers] of result) {
    result.set(
      studentId,
      [...teachers].sort((a, b) => a.name.localeCompare(b.name)),
    );
  }

  return result;
}

export async function fetchClassroomLeadTeachersByStudentIds(
  supabase: SupabaseClient,
  organizationId: string,
  studentIds: string[],
): Promise<Map<string, AssignedTeacher[]>> {
  const result = new Map<string, AssignedTeacher[]>();
  if (studentIds.length === 0) return result;

  const { data: junctionRows, error: enrollmentError } = await supabase
    .from("enrollment_classrooms")
    .select("classroom_id, enrollments!inner ( student_id, status )")
    .eq("organization_id", organizationId)
    .eq("enrollments.status", "enrolled")
    .in("enrollments.student_id", studentIds);

  if (enrollmentError) throw enrollmentError;

  const classroomIds = new Set<string>();
  const classroomsByStudent = new Map<string, Set<string>>();

  for (const row of junctionRows ?? []) {
    const enrollment = unwrapRelation(
      row.enrollments as { student_id?: string } | { student_id?: string }[] | null,
    );
    const studentId = enrollment?.student_id ? String(enrollment.student_id) : null;
    const classroomId = row.classroom_id ? String(row.classroom_id) : null;
    if (!studentId || !classroomId) continue;

    classroomIds.add(classroomId);
    const set = classroomsByStudent.get(studentId) ?? new Set<string>();
    set.add(classroomId);
    classroomsByStudent.set(studentId, set);
  }

  if (classroomIds.size === 0) return result;

  const { data: assignmentRows, error: assignmentError } = await supabase
    .from("classroom_staff_assignments")
    .select(
      `
      classroom_id,
      staff_members!inner (
        id,
        first_name,
        last_name
      )
    `,
    )
    .eq("organization_id", organizationId)
    .eq("role", "lead")
    .in("classroom_id", [...classroomIds]);

  if (assignmentError) throw assignmentError;

  const teachersByClassroomId = new Map<string, AssignedTeacher[]>();

  for (const row of assignmentRows ?? []) {
    const classroomId = String(row.classroom_id);
    const staffMember = unwrapRelation(
      row.staff_members as
        | { id?: string; first_name?: string; last_name?: string }
        | { id?: string; first_name?: string; last_name?: string }[]
        | null,
    );
    if (!staffMember?.id) continue;

    const teacher: AssignedTeacher = {
      id: String(staffMember.id),
      name: formatStaffMemberName({
        firstName: String(staffMember.first_name ?? ""),
        lastName: String(staffMember.last_name ?? ""),
      }),
    };

    const list = teachersByClassroomId.get(classroomId) ?? [];
    if (!list.some((entry) => entry.id === teacher.id)) {
      list.push(teacher);
    }
    teachersByClassroomId.set(classroomId, list);
  }

  for (const studentId of studentIds) {
    const classroomIdSet = classroomsByStudent.get(studentId);
    if (!classroomIdSet) {
      result.set(studentId, []);
      continue;
    }

    const teachersById = new Map<string, AssignedTeacher>();
    for (const classroomId of classroomIdSet) {
      for (const teacher of teachersByClassroomId.get(classroomId) ?? []) {
        teachersById.set(teacher.id, teacher);
      }
    }

    result.set(
      studentId,
      [...teachersById.values()].sort((a, b) => a.name.localeCompare(b.name)),
    );
  }

  return result;
}

function mapEnrollmentRowToAggregate(
  row: Record<string, unknown>,
  primaryContactsByFamilyId: Map<string, { name: string | null; email: string | null }>,
  teachersByStudentId: Map<string, AssignedTeacher[]>,
): EnrollmentAggregate | null {
  const student = unwrapRelation(
    row.students as StudentRow | StudentRow[] | null,
  );

  if (!student?.id) return null;

  const family = unwrapRelation(student.families);
  const familyId = String(student.family_id ?? "");
  if (!familyId) return null;

  const program = unwrapRelation(
    row.programs as { id?: string; name?: string } | { id?: string; name?: string }[] | null,
  );
  const programName = program?.name ? String(program.name) : null;
  const programId = program?.id ? String(program.id) : null;
  const enrollmentClassroomRows = row.enrollment_classrooms;
  const classroomEntries = Array.isArray(enrollmentClassroomRows)
    ? enrollmentClassroomRows
    : enrollmentClassroomRows
      ? [enrollmentClassroomRows]
      : [];

  const classroomNames: string[] = [];
  const classroomIds: string[] = [];
  for (const entry of classroomEntries) {
    const record = entry as Record<string, unknown>;
    const classroom = unwrapRelation(
      record.classrooms as
        | { id?: string; name?: string }
        | { id?: string; name?: string }[]
        | null,
    );
    if (classroom?.id) classroomIds.push(String(classroom.id));
    if (classroom?.name) classroomNames.push(String(classroom.name));
  }
  const enrolledAt = String(row.created_at ?? "");

  const primaryContact = primaryContactsByFamilyId.get(familyId);
  const familyPrimaryEmail =
    typeof family?.primary_email === "string"
      ? family.primary_email.trim() || null
      : null;

  const firstName = String(student.first_name ?? "");
  const lastName = String(student.last_name ?? "");
  const studentId = String(student.id);
  const assignedTeachers = teachersByStudentId.get(studentId) ?? [];

  const summary: AdminEnrolledStudentSummary = {
    id: studentId,
    firstName,
    lastName,
    grade: typeof student.grade === "string" ? student.grade : null,
    dateOfBirth:
      typeof student.date_of_birth === "string" ? student.date_of_birth : null,
    status: String(student.status ?? "active"),
    familyId,
    familyName: family?.name ? String(family.name) : null,
    primaryContactName: primaryContact?.name ?? null,
    primaryContactEmail: primaryContact?.email ?? familyPrimaryEmail,
    programNames: programName ? [programName] : [],
    programIds: programId ? [programId] : [],
    classroomNames,
    classroomIds,
    enrolledAt,
    assignedTeachers,
    assignedTeacherNames: formatAssignedTeacherNames(assignedTeachers),
    profilePhotoUrl:
      typeof student.profile_photo_url === "string" &&
      student.profile_photo_url.trim() !== ""
        ? student.profile_photo_url.trim()
        : null,
    hasStandingHealthItems: false,
  };

  return {
    summary,
    programNameSet: new Set(programName ? [programName] : []),
    programIdSet: new Set(programId ? [programId] : []),
    classroomNameSet: new Set(classroomNames),
    classroomIdSet: new Set(classroomIds),
  };
}

function mergeEnrollmentAggregate(
  existing: EnrollmentAggregate,
  incoming: EnrollmentAggregate,
): EnrollmentAggregate {
  for (const programName of incoming.programNameSet) {
    existing.programNameSet.add(programName);
  }

  for (const programId of incoming.programIdSet) {
    existing.programIdSet.add(programId);
  }

  for (const classroomName of incoming.classroomNameSet) {
    existing.classroomNameSet.add(classroomName);
  }

  for (const classroomId of incoming.classroomIdSet) {
    existing.classroomIdSet.add(classroomId);
  }

  if (
    incoming.summary.enrolledAt &&
    (existing.summary.enrolledAt === "" ||
      incoming.summary.enrolledAt < existing.summary.enrolledAt)
  ) {
    existing.summary.enrolledAt = incoming.summary.enrolledAt;
  }

  existing.summary.programNames = [...existing.programNameSet].sort((a, b) =>
    a.localeCompare(b),
  );
  existing.summary.programIds = [...existing.programIdSet].sort((a, b) =>
    a.localeCompare(b),
  );
  existing.summary.classroomNames = [...existing.classroomNameSet].sort((a, b) =>
    a.localeCompare(b),
  );
  existing.summary.classroomIds = [...existing.classroomIdSet].sort((a, b) =>
    a.localeCompare(b),
  );

  return existing;
}

type AggregateEnrolledStudentSummariesOptions = {
  useClassroomLeadTeachers?: boolean;
};

async function aggregateEnrolledStudentSummaries(
  supabase: SupabaseClient,
  organizationId: string,
  rows: Record<string, unknown>[],
  options: AggregateEnrolledStudentSummariesOptions = {},
): Promise<AdminEnrolledStudentSummary[]> {
  const familyIds = new Set<string>();
  const studentIds = new Set<string>();

  for (const row of rows) {
    const student = unwrapRelation(
      row.students as { id?: string; family_id?: string } | { id?: string; family_id?: string }[] | null,
    );
    if (student?.family_id) {
      familyIds.add(String(student.family_id));
    }
    if (student?.id) {
      studentIds.add(String(student.id));
    }
  }

  const fetchTeachers = options.useClassroomLeadTeachers
    ? fetchClassroomLeadTeachersByStudentIds(supabase, organizationId, [...studentIds])
    : fetchTeacherAssignmentsByStudentIds(supabase, organizationId, [...studentIds]);

  const [primaryContactsByFamilyId, teachersByStudentId] = await Promise.all([
    fetchPrimaryContactsByFamilyId(supabase, organizationId, [...familyIds]),
    fetchTeachers,
  ]);

  const aggregates = new Map<string, EnrollmentAggregate>();

  for (const row of rows) {
    const aggregate = mapEnrollmentRowToAggregate(
      row,
      primaryContactsByFamilyId,
      teachersByStudentId,
    );
    if (!aggregate) continue;

    const studentId = aggregate.summary.id;
    const existing = aggregates.get(studentId);
    if (existing) {
      aggregates.set(studentId, mergeEnrollmentAggregate(existing, aggregate));
    } else {
      aggregates.set(studentId, aggregate);
    }
  }

  return [...aggregates.values()]
    .map((aggregate) => aggregate.summary)
    .sort((a, b) => {
      const nameA = formatEnrolledStudentName(a);
      const nameB = formatEnrolledStudentName(b);
      return nameA.localeCompare(nameB);
    });
}

export async function listOrgEnrolledStudents(
  supabase: SupabaseClient,
  organizationId: string,
  options: ListOrgEnrolledStudentsOptions = {},
): Promise<AdminEnrolledStudentSummary[]> {
  const limit = Math.min(
    Math.max(options.limit ?? ORG_ENROLLED_STUDENTS_DEFAULT_LIMIT, 1),
    500,
  );

  const { data, error } = await supabase
    .from("enrollments")
    .select(ENROLLED_ENROLLMENT_SELECT)
    .eq("organization_id", organizationId)
    .eq("status", "enrolled")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;

  return aggregateEnrolledStudentSummaries(
    supabase,
    organizationId,
    (data ?? []) as Record<string, unknown>[],
    { useClassroomLeadTeachers: true },
  );
}

export async function listFamilyEnrolledStudents(
  supabase: SupabaseClient,
  organizationId: string,
  familyIds: string[],
): Promise<Map<string, AdminEnrolledStudentSummary[]>> {
  const byFamily = new Map<string, AdminEnrolledStudentSummary[]>();
  if (familyIds.length === 0) return byFamily;

  const { data, error } = await supabase
    .from("enrollments")
    .select(ENROLLED_ENROLLMENT_SELECT)
    .eq("organization_id", organizationId)
    .eq("status", "enrolled")
    .in("students.family_id", familyIds);

  if (error) throw error;

  const summaries = await aggregateEnrolledStudentSummaries(
    supabase,
    organizationId,
    (data ?? []) as Record<string, unknown>[],
    { useClassroomLeadTeachers: true },
  );

  for (const summary of summaries) {
    const list = byFamily.get(summary.familyId) ?? [];
    list.push(summary);
    byFamily.set(summary.familyId, list);
  }

  for (const [familyId, list] of byFamily) {
    byFamily.set(
      familyId,
      [...list].sort((a, b) =>
        formatEnrolledStudentName(a).localeCompare(formatEnrolledStudentName(b)),
      ),
    );
  }

  return byFamily;
}

export async function listAssignedEnrolledStudents(
  supabase: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  options: ListOrgEnrolledStudentsOptions = {},
): Promise<AdminEnrolledStudentSummary[]> {
  const limit = Math.min(
    Math.max(options.limit ?? ORG_ENROLLED_STUDENTS_DEFAULT_LIMIT, 1),
    500,
  );

  const { data: assignmentRows, error: assignmentError } = await supabase
    .from("student_teacher_assignments")
    .select("student_id")
    .eq("organization_id", organizationId)
    .eq("staff_member_id", staffMemberId);

  if (assignmentError) throw assignmentError;

  const studentIds = (assignmentRows ?? []).map((row) => String(row.student_id));
  if (studentIds.length === 0) return [];

  const { data, error } = await supabase
    .from("enrollments")
    .select(ENROLLED_ENROLLMENT_SELECT)
    .eq("organization_id", organizationId)
    .eq("status", "enrolled")
    .in("student_id", studentIds)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;

  return aggregateEnrolledStudentSummaries(
    supabase,
    organizationId,
    (data ?? []) as Record<string, unknown>[],
  );
}

export async function loadEnrolledStudentDetail(
  supabase: SupabaseClient,
  organizationId: string,
  studentId: string,
): Promise<EnrolledStudentDetail | null> {
  const { data: studentRow, error: studentError } = await supabase
    .from("students")
    .select(
      `
      id,
      first_name,
      last_name,
      grade,
      date_of_birth,
      status,
      family_id,
      profile_photo_url,
      families (
        name,
        primary_email,
        primary_phone
      )
    `,
    )
    .eq("organization_id", organizationId)
    .eq("id", studentId)
    .maybeSingle();

  if (studentError) throw studentError;
  if (!studentRow) return null;

  const family = unwrapRelation(
    studentRow.families as
      | {
          name?: string;
          primary_email?: string | null;
          primary_phone?: string | null;
        }
      | {
          name?: string;
          primary_email?: string | null;
          primary_phone?: string | null;
        }[]
      | null,
  );

  const familyId = String(studentRow.family_id ?? "");

  const [
    { data: enrollmentRows, error: enrollmentsError },
    { data: applicationRows, error: applicationsError },
    teachersByStudentId,
  ] = await Promise.all([
    supabase
      .from("enrollments")
      .select(
        `
        id,
        created_at,
        status,
        programs ( id, name ),
        enrollment_classrooms (
          classrooms ( id, name )
        )
      `,
      )
      .eq("organization_id", organizationId)
      .eq("student_id", studentId)
      .eq("status", "enrolled")
      .order("created_at", { ascending: true }),
    supabase
      .from("applications")
      .select("id, status, updated_at")
      .eq("organization_id", organizationId)
      .eq("student_id", studentId)
      .order("updated_at", { ascending: false })
      .limit(1),
    fetchClassroomLeadTeachersByStudentIds(supabase, organizationId, [studentId]),
  ]);

  if (enrollmentsError) throw enrollmentsError;
  if (applicationsError) throw applicationsError;

  const enrollments: EnrolledStudentEnrollment[] = (enrollmentRows ?? []).map(
    (row) => {
      const program = unwrapRelation(
        row.programs as { id?: string; name?: string } | { id?: string; name?: string }[] | null,
      );
      const enrollmentClassroomRows = row.enrollment_classrooms;
      const classroomEntries = Array.isArray(enrollmentClassroomRows)
        ? enrollmentClassroomRows
        : enrollmentClassroomRows
          ? [enrollmentClassroomRows]
          : [];
      const classroomNameList: string[] = [];
      const classroomIdList: string[] = [];
      for (const entry of classroomEntries) {
        const record = entry as Record<string, unknown>;
        const classroom = unwrapRelation(
          record.classrooms as
            | { id?: string; name?: string }
            | { id?: string; name?: string }[]
            | null,
        );
        if (classroom?.id) classroomIdList.push(String(classroom.id));
        if (classroom?.name) classroomNameList.push(String(classroom.name));
      }

      return {
        id: String(row.id),
        programName: program?.name ? String(program.name) : "Program",
        classroomName:
          classroomNameList.length > 0
            ? [...classroomNameList].sort((a, b) => a.localeCompare(b)).join(", ")
            : null,
        classroomIds: [...classroomIdList].sort((a, b) => a.localeCompare(b)),
        enrolledAt: String(row.created_at ?? ""),
      };
    },
  );

  const programNames = [...new Set(enrollments.map((row) => row.programName))].sort(
    (a, b) => a.localeCompare(b),
  );
  const programIds = [
    ...new Set(
      (enrollmentRows ?? [])
        .map((row) => {
          const program = unwrapRelation(
            row.programs as { id?: string } | { id?: string }[] | null,
          );
          return program?.id ? String(program.id) : null;
        })
        .filter((id): id is string => Boolean(id)),
    ),
  ].sort((a, b) => a.localeCompare(b));
  const classroomNameSet = new Set<string>();
  const classroomIdSet = new Set<string>();
  for (const enrollment of enrollments) {
    if (enrollment.classroomName) {
      for (const name of enrollment.classroomName.split(', ')) {
        if (name.trim()) classroomNameSet.add(name.trim());
      }
    }
    for (const classroomId of enrollment.classroomIds) {
      classroomIdSet.add(classroomId);
    }
  }

  const latestApplication = applicationRows?.[0];
  const assignedTeachers = teachersByStudentId.get(studentId) ?? [];

  return {
    id: String(studentRow.id),
    firstName: String(studentRow.first_name ?? ""),
    lastName: String(studentRow.last_name ?? ""),
    grade: typeof studentRow.grade === "string" ? studentRow.grade : null,
    dateOfBirth:
      typeof studentRow.date_of_birth === "string"
        ? studentRow.date_of_birth
        : null,
    status: String(studentRow.status ?? "active"),
    familyId,
    familyName: family?.name ? String(family.name) : null,
    familyPrimaryEmail:
      typeof family?.primary_email === "string"
        ? family.primary_email.trim() || null
        : null,
    familyPrimaryPhone:
      typeof family?.primary_phone === "string"
        ? family.primary_phone.trim() || null
        : null,
    programNames,
    programIds,
    classroomNames: [...classroomNameSet].sort((a, b) => a.localeCompare(b)),
    classroomIds: [...classroomIdSet].sort((a, b) => a.localeCompare(b)),
    enrollments,
    applicationId: latestApplication?.id ? String(latestApplication.id) : null,
    applicationStatus: latestApplication?.status
      ? String(latestApplication.status)
      : null,
    assignedTeachers,
    assignedTeacherNames: formatAssignedTeacherNames(assignedTeachers),
    profilePhotoUrl:
      typeof studentRow.profile_photo_url === "string" &&
      studentRow.profile_photo_url.trim() !== ""
        ? studentRow.profile_photo_url.trim()
        : null,
  };
}

export async function teacherHasAssignedStudentInFamily(
  supabase: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  familyId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("student_teacher_assignments")
    .select("id, students!inner(family_id)")
    .eq("organization_id", organizationId)
    .eq("staff_member_id", staffMemberId)
    .eq("students.family_id", familyId)
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function loadTeacherMessageableFamilyStudentDetail(
  supabase: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  studentId: string,
): Promise<EnrolledStudentDetail | null> {
  const detail = await loadEnrolledStudentDetail(
    supabase,
    organizationId,
    studentId,
  );

  if (!detail || detail.enrollments.length === 0) {
    return null;
  }

  const hasAccess = await teacherHasAssignedStudentInFamily(
    supabase,
    organizationId,
    staffMemberId,
    detail.familyId,
  );

  if (!hasAccess) {
    return null;
  }

  return detail;
}

export async function loadTeacherAssignedStudentDetail(
  supabase: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  studentId: string,
): Promise<EnrolledStudentDetail | null> {
  const detail = await loadEnrolledStudentDetail(
    supabase,
    organizationId,
    studentId,
  );

  if (!detail || !studentHasAssignedTeacher(detail, staffMemberId)) {
    return null;
  }

  return detail;
}

async function validateActiveStaffMembers(
  supabase: SupabaseClient,
  organizationId: string,
  staffMemberIds: string[],
): Promise<AssignedTeacher[]> {
  const uniqueIds = [...new Set(staffMemberIds.filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const { data, error } = await supabase
    .from("staff_members")
    .select("id, first_name, last_name, status")
    .eq("organization_id", organizationId)
    .in("id", uniqueIds);

  if (error) throw error;

  if ((data ?? []).length !== uniqueIds.length) {
    throw new StudentTeacherAssignmentError(
      "Staff member not found.",
      "not_found",
      404,
    );
  }

  const teachers: AssignedTeacher[] = [];
  for (const row of data ?? []) {
    if (row.status !== "active") {
      throw new StudentTeacherAssignmentError(
        "Only active staff members can be assigned.",
        "invalid_staff",
        400,
      );
    }

    teachers.push({
      id: String(row.id),
      name: formatStaffMemberName({
        firstName: String(row.first_name ?? ""),
        lastName: String(row.last_name ?? ""),
      }),
    });
  }

  return teachers.sort((a, b) => a.name.localeCompare(b.name));
}

export async function setStudentTeachers(
  supabase: SupabaseClient,
  input: SetStudentTeachersInput,
): Promise<SetStudentTeachersResult> {
  const { organizationId, studentId, staffMemberIds } = input;

  const { data: studentRow, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("id", studentId)
    .maybeSingle();

  if (studentError) throw studentError;
  if (!studentRow) {
    throw new StudentTeacherAssignmentError(
      "Student not found.",
      "not_found",
      404,
    );
  }

  const assignedTeachers = await validateActiveStaffMembers(
    supabase,
    organizationId,
    staffMemberIds,
  );

  const { error: deleteError } = await supabase
    .from("student_teacher_assignments")
    .delete()
    .eq("organization_id", organizationId)
    .eq("student_id", studentId);

  if (deleteError) throw deleteError;

  if (assignedTeachers.length > 0) {
    const { error: insertError } = await supabase
      .from("student_teacher_assignments")
      .insert(
        assignedTeachers.map((teacher) => ({
          organization_id: organizationId,
          student_id: studentId,
          staff_member_id: teacher.id,
        })),
      );

    if (insertError) throw insertError;
  }

  return {
    assignedTeachers,
    assignedTeacherNames: formatAssignedTeacherNames(assignedTeachers),
  };
}

export async function assignStudentsToStaff(
  supabase: SupabaseClient,
  input: AssignStudentsToStaffInput,
): Promise<void> {
  const { organizationId, staffMemberId, studentIds } = input;
  const uniqueStudentIds = [...new Set(studentIds.filter(Boolean))];
  if (uniqueStudentIds.length === 0) return;

  await validateActiveStaffMembers(supabase, organizationId, [staffMemberId]);

  const { data: studentRows, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("organization_id", organizationId)
    .in("id", uniqueStudentIds);

  if (studentError) throw studentError;
  if ((studentRows ?? []).length !== uniqueStudentIds.length) {
    throw new StudentTeacherAssignmentError(
      "Student not found.",
      "not_found",
      404,
    );
  }

  const { error: insertError } = await supabase
    .from("student_teacher_assignments")
    .upsert(
      uniqueStudentIds.map((studentId) => ({
        organization_id: organizationId,
        student_id: studentId,
        staff_member_id: staffMemberId,
      })),
      { onConflict: "student_id,staff_member_id", ignoreDuplicates: true },
    );

  if (insertError) throw insertError;
}

export async function unassignStudentFromStaff(
  supabase: SupabaseClient,
  input: UnassignStudentFromStaffInput,
): Promise<void> {
  const { organizationId, staffMemberId, studentId } = input;

  const { error } = await supabase
    .from("student_teacher_assignments")
    .delete()
    .eq("organization_id", organizationId)
    .eq("student_id", studentId)
    .eq("staff_member_id", staffMemberId);

  if (error) throw error;
}

/** @deprecated Use setStudentTeachers instead */
export async function assignStudentTeacher(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    studentId: string;
    staffMemberId: string | null;
  },
): Promise<SetStudentTeachersResult> {
  return setStudentTeachers(supabase, {
    organizationId: input.organizationId,
    studentId: input.studentId,
    staffMemberIds: input.staffMemberId ? [input.staffMemberId] : [],
  });
}

export function formatEnrolledDate(value: string): string {
  if (!value) return "—";
  return formatShortDate(value);
}

export type OrgStaffMemberRecord = {
  id: string;
  firstName: string;
  lastName: string;
  employmentStatus: 'active' | 'inactive' | 'on_leave';
};

export async function listOrgStaffMembers(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<OrgStaffMemberRecord[]> {
  const { data, error } = await supabase
    .from('staff_members')
    .select('id, first_name, last_name, status')
    .eq('organization_id', organizationId)
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: String(row.id),
    firstName: String(row.first_name ?? ''),
    lastName: String(row.last_name ?? ''),
    employmentStatus: (row.status as OrgStaffMemberRecord['employmentStatus']) ?? 'active',
  }));
}
