import type { SupabaseClient } from "@supabase/supabase-js";
import { mergeFeatures } from "@/lib/organization-settings/merge";
import {
  formatEnrolledStudentName,
  formatStudentGrade,
} from "@/lib/school-admin/enrolled-students";
import { mapRecordStatusToRosterStatus, parseAttendanceDate } from "./attendance-mutations";
import { buildProgramAttendanceEnabledMap } from "./program-attendance-enabled";
import { studentHasAttendanceEnabledEnrollment } from "./attendance-roster-filter";
import type {
  AttendanceRosterResponse,
  AttendanceRosterStudent,
  AttendanceRosterSummary,
} from "./attendance-types";

type EnrollmentRow = {
  program_id?: string;
  status?: string;
  students?: StudentRow | StudentRow[] | null;
  programs?: { name?: string } | { name?: string }[] | null;
  enrollment_classrooms?:
    | { classrooms?: { name?: string } | { name?: string }[] | null }
    | { classrooms?: { name?: string } | { name?: string }[] | null }[]
    | null;
};

type StudentRow = {
  id?: string;
  first_name?: string;
  last_name?: string;
  grade?: string | null;
  family_id?: string;
  profile_photo_url?: string | null;
  families?: { name?: string } | { name?: string }[] | null;
};

type AttendanceRecordQueryRow = {
  student_id: string;
  status: string;
  present_at: string | null;
  absent_at: string | null;
  picked_up_at: string | null;
  picked_up_by_guardian_id: string | null;
  picked_up_by_authorized_contact_id: string | null;
  picked_up_by_name: string | null;
};

type StudentAggregate = {
  student: StudentRow;
  programNames: Set<string>;
  classroomNames: Set<string>;
  enrollments: { programId: string; status: string }[];
};

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function buildAttendanceSummary(
  students: AttendanceRosterStudent[],
): AttendanceRosterSummary {
  let presentCount = 0;
  let absentCount = 0;
  let pickedUpCount = 0;
  let notMarkedCount = 0;

  for (const student of students) {
    switch (student.attendanceStatus) {
      case "present":
        presentCount += 1;
        break;
      case "absent":
        absentCount += 1;
        break;
      case "picked_up":
        pickedUpCount += 1;
        break;
      default:
        notMarkedCount += 1;
        break;
    }
  }

  return {
    totalStudents: students.length,
    presentCount,
    absentCount,
    pickedUpCount,
    notMarkedCount,
  };
}

const ATTENDANCE_ENROLLMENT_SELECT = `
  program_id,
  status,
  students!inner (
    id,
    first_name,
    last_name,
    grade,
    family_id,
    profile_photo_url,
    families (
      name
    )
  ),
  programs (
    name
  ),
  enrollment_classrooms (
    classrooms (
      name
    )
  )
`;

export async function loadAttendanceRoster(
  admin: SupabaseClient,
  organizationId: string,
  date: string,
): Promise<AttendanceRosterResponse> {
  const attendanceDate = parseAttendanceDate(date);

  const [{ data: settingsRow }, { data: programs }, { data: enrollmentRows }] =
    await Promise.all([
      admin
        .from("organization_settings")
        .select("features")
        .eq("organization_id", organizationId)
        .maybeSingle(),
      admin
        .from("programs")
        .select("id, parent_portal_settings")
        .eq("organization_id", organizationId),
      admin
        .from("enrollments")
        .select(ATTENDANCE_ENROLLMENT_SELECT)
        .eq("organization_id", organizationId)
        .eq("status", "enrolled"),
    ]);

  const orgFeatures = mergeFeatures(
    settingsRow?.features as Record<string, unknown> | null | undefined,
  );
  const programAttendanceEnabled = buildProgramAttendanceEnabledMap(
    orgFeatures,
    programs ?? [],
  );

  const aggregates = new Map<string, StudentAggregate>();

  for (const row of enrollmentRows ?? []) {
    const enrollment = row as EnrollmentRow;
    const student = unwrapRelation(enrollment.students);
    if (!student?.id || !student.family_id) continue;

    const studentId = String(student.id);
    const programId = String(enrollment.program_id ?? "");
    const program = unwrapRelation(enrollment.programs);
    const programName = program?.name ? String(program.name) : null;

    const classroomEntries = Array.isArray(enrollment.enrollment_classrooms)
      ? enrollment.enrollment_classrooms
      : enrollment.enrollment_classrooms
        ? [enrollment.enrollment_classrooms]
        : [];

    const existing = aggregates.get(studentId) ?? {
      student,
      programNames: new Set<string>(),
      classroomNames: new Set<string>(),
      enrollments: [],
    };

    if (programName) existing.programNames.add(programName);
    if (programId) {
      existing.enrollments.push({
        programId,
        status: String(enrollment.status ?? "enrolled"),
      });
    }

    for (const entry of classroomEntries) {
      const classroom = unwrapRelation(entry.classrooms);
      if (classroom?.name) existing.classroomNames.add(String(classroom.name));
    }

    aggregates.set(studentId, existing);
  }

  const eligibleStudentIds = [...aggregates.entries()]
    .filter(([, aggregate]) =>
      studentHasAttendanceEnabledEnrollment(
        aggregate.enrollments,
        programAttendanceEnabled,
      ),
    )
    .map(([studentId]) => studentId);

  const recordsByStudentId = new Map<string, AttendanceRecordQueryRow>();

  if (eligibleStudentIds.length > 0) {
    const { data: records, error: recordsError } = await admin
      .from("student_attendance_records")
      .select(
        `
        student_id,
        status,
        present_at,
        absent_at,
        picked_up_at,
        picked_up_by_guardian_id,
        picked_up_by_authorized_contact_id,
        picked_up_by_name
      `,
      )
      .eq("organization_id", organizationId)
      .eq("attendance_date", attendanceDate)
      .in("student_id", eligibleStudentIds);

    if (recordsError) throw recordsError;

    for (const record of records ?? []) {
      recordsByStudentId.set(String(record.student_id), record as AttendanceRecordQueryRow);
    }
  }

  const students: AttendanceRosterStudent[] = eligibleStudentIds
    .map((studentId) => {
      const aggregate = aggregates.get(studentId);
      if (!aggregate) return null;

      const student = aggregate.student;
      const firstName = String(student.first_name ?? "");
      const lastName = String(student.last_name ?? "");
      const family = unwrapRelation(student.families);
      const record = recordsByStudentId.get(studentId);

      return {
        id: studentId,
        firstName,
        lastName,
        grade: formatStudentGrade(
          typeof student.grade === "string" ? student.grade : null,
        ),
        profilePhotoUrl:
          typeof student.profile_photo_url === "string" &&
          student.profile_photo_url.trim() !== ""
            ? student.profile_photo_url.trim()
            : null,
        familyId: String(student.family_id),
        familyName: family?.name ? String(family.name) : null,
        programNames: [...aggregate.programNames].sort((a, b) => a.localeCompare(b)),
        classroomNames: [...aggregate.classroomNames].sort((a, b) =>
          a.localeCompare(b),
        ),
        attendanceStatus: mapRecordStatusToRosterStatus(
          record?.status as "present" | "absent" | "picked_up" | undefined,
        ),
        presentAt: record?.present_at ?? null,
        absentAt: record?.absent_at ?? null,
        pickedUpAt: record?.picked_up_at ?? null,
        pickedUpByGuardianId: record?.picked_up_by_guardian_id ?? null,
        pickedUpByAuthorizedContactId:
          record?.picked_up_by_authorized_contact_id ?? null,
        pickedUpByName: record?.picked_up_by_name ?? null,
      } satisfies AttendanceRosterStudent;
    })
    .filter((student): student is AttendanceRosterStudent => student != null)
    .sort((a, b) =>
      formatEnrolledStudentName(a).localeCompare(formatEnrolledStudentName(b)),
    );

  return {
    date: attendanceDate,
    students,
    summary: buildAttendanceSummary(students),
  };
}

export async function assertStudentEligibleForAttendance(
  admin: SupabaseClient,
  organizationId: string,
  studentId: string,
  date: string,
): Promise<{ familyId: string; currentStatus: AttendanceRosterStudent["attendanceStatus"] }> {
  const attendanceDate = parseAttendanceDate(date);
  const [{ data: settingsRow }, { data: programs }, { data: enrollments }] =
    await Promise.all([
      admin
        .from("organization_settings")
        .select("features")
        .eq("organization_id", organizationId)
        .maybeSingle(),
      admin
        .from("programs")
        .select("id, parent_portal_settings")
        .eq("organization_id", organizationId),
      admin
        .from("enrollments")
        .select("program_id, status, students!inner ( family_id )")
        .eq("organization_id", organizationId)
        .eq("status", "enrolled")
        .eq("student_id", studentId),
    ]);

  const orgFeatures = mergeFeatures(
    settingsRow?.features as Record<string, unknown> | null | undefined,
  );
  const programAttendanceEnabled = buildProgramAttendanceEnabledMap(
    orgFeatures,
    programs ?? [],
  );

  const enrollmentRefs = (enrollments ?? []).map((row) => ({
    programId: String(row.program_id),
    status: String(row.status ?? "enrolled"),
  }));

  if (!studentHasAttendanceEnabledEnrollment(enrollmentRefs, programAttendanceEnabled)) {
    throw new Error("Student is not eligible for attendance tracking.");
  }

  const firstEnrollment = enrollments?.[0];
  const student = unwrapRelation(
    firstEnrollment?.students as { family_id?: string } | { family_id?: string }[] | null,
  );
  const familyId = student?.family_id ? String(student.family_id) : "";
  if (!familyId) {
    throw new Error("Student family not found.");
  }

  const { data: record } = await admin
    .from("student_attendance_records")
    .select("status")
    .eq("organization_id", organizationId)
    .eq("student_id", studentId)
    .eq("attendance_date", attendanceDate)
    .maybeSingle();

  return {
    familyId,
    currentStatus: mapRecordStatusToRosterStatus(
      record?.status as "present" | "absent" | "picked_up" | undefined,
    ),
  };
}
