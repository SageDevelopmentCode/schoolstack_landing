import type { SupabaseClient } from "@supabase/supabase-js";
import { formatShortDate } from "@/lib/admissions/application-submissions";

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
  enrolledAt: string;
};

export type EnrolledStudentEnrollment = {
  id: string;
  programName: string;
  classroomName: string | null;
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
  enrollments: EnrolledStudentEnrollment[];
  applicationId: string | null;
  applicationStatus: string | null;
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
    families (
      name,
      primary_email,
      primary_phone
    )
  ),
  programs (
    name
  ),
  classrooms (
    name
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
};

function mapEnrollmentRowToAggregate(
  row: Record<string, unknown>,
  primaryContactsByFamilyId: Map<string, { name: string | null; email: string | null }>,
): EnrollmentAggregate | null {
  const student = unwrapRelation(
    row.students as
      | {
          id?: string;
          first_name?: string;
          last_name?: string;
          grade?: string | null;
          date_of_birth?: string | null;
          status?: string;
          family_id?: string;
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
        }
      | {
          id?: string;
          first_name?: string;
          last_name?: string;
          grade?: string | null;
          date_of_birth?: string | null;
          status?: string;
          family_id?: string;
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
        }[]
      | null,
  );

  if (!student?.id) return null;

  const family = unwrapRelation(student.families);
  const familyId = String(student.family_id ?? "");
  if (!familyId) return null;

  const program = unwrapRelation(
    row.programs as { name?: string } | { name?: string }[] | null,
  );
  const programName = program?.name ? String(program.name) : null;
  const enrolledAt = String(row.created_at ?? "");

  const primaryContact = primaryContactsByFamilyId.get(familyId);
  const familyPrimaryEmail =
    typeof family?.primary_email === "string"
      ? family.primary_email.trim() || null
      : null;

  const firstName = String(student.first_name ?? "");
  const lastName = String(student.last_name ?? "");

  const summary: AdminEnrolledStudentSummary = {
    id: String(student.id),
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
    enrolledAt,
  };

  return {
    summary,
    programNameSet: new Set(programName ? [programName] : []),
  };
}

function mergeEnrollmentAggregate(
  existing: EnrollmentAggregate,
  incoming: EnrollmentAggregate,
): EnrollmentAggregate {
  for (const programName of incoming.programNameSet) {
    existing.programNameSet.add(programName);
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

  return existing;
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

  const rows = (data ?? []) as Record<string, unknown>[];
  const familyIds = new Set<string>();

  for (const row of rows) {
    const student = unwrapRelation(
      row.students as { family_id?: string } | { family_id?: string }[] | null,
    );
    if (student?.family_id) {
      familyIds.add(String(student.family_id));
    }
  }

  const primaryContactsByFamilyId = await fetchPrimaryContactsByFamilyId(
    supabase,
    organizationId,
    [...familyIds],
  );

  const aggregates = new Map<string, EnrollmentAggregate>();

  for (const row of rows) {
    const aggregate = mapEnrollmentRowToAggregate(row, primaryContactsByFamilyId);
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
  ] = await Promise.all([
    supabase
      .from("enrollments")
      .select(
        `
        id,
        created_at,
        status,
        programs ( name ),
        classrooms ( name )
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
  ]);

  if (enrollmentsError) throw enrollmentsError;
  if (applicationsError) throw applicationsError;

  const enrollments: EnrolledStudentEnrollment[] = (enrollmentRows ?? []).map(
    (row) => {
      const program = unwrapRelation(
        row.programs as { name?: string } | { name?: string }[] | null,
      );
      const classroom = unwrapRelation(
        row.classrooms as { name?: string } | { name?: string }[] | null,
      );

      return {
        id: String(row.id),
        programName: program?.name ? String(program.name) : "Program",
        classroomName: classroom?.name ? String(classroom.name) : null,
        enrolledAt: String(row.created_at ?? ""),
      };
    },
  );

  const programNames = [...new Set(enrollments.map((row) => row.programName))].sort(
    (a, b) => a.localeCompare(b),
  );

  const latestApplication = applicationRows?.[0];

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
    enrollments,
    applicationId: latestApplication?.id ? String(latestApplication.id) : null,
    applicationStatus: latestApplication?.status
      ? String(latestApplication.status)
      : null,
  };
}

export function formatEnrolledDate(value: string): string {
  if (!value) return "—";
  return formatShortDate(value);
}
