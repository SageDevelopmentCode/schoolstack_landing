import type {
  ClassroomSignup,
  ClassroomSignupAudience,
  ClassroomSignupConfig,
  ClassroomSignupResponse,
  ClassroomSignupResponseStatus,
  ClassroomSignupStatus,
  ClassroomSignupType,
} from "./types";

export type ClassroomSignupRow = {
  id: string;
  organization_id: string;
  created_by_staff_member_id: string;
  title: string;
  description: string;
  signup_type: ClassroomSignupType;
  audience: ClassroomSignupAudience;
  classroom_id: string | null;
  family_count: number;
  status: ClassroomSignupStatus;
  response_deadline: string | null;
  config: ClassroomSignupConfig | null;
  published_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  staff_members?:
    | { first_name?: string | null; last_name?: string | null }
    | { first_name?: string | null; last_name?: string | null }[]
    | null;
  classrooms?: { name?: string | null } | { name?: string | null }[] | null;
};

export type ClassroomSignupResponseRow = {
  id: string;
  organization_id: string;
  signup_id: string;
  family_id: string;
  student_id: string;
  selected_slot_ids: string[] | null;
  selected_role_ids: string[] | null;
  note: string | null;
  status: ClassroomSignupResponseStatus;
  created_at: string;
  updated_at: string;
  families?:
    | { name?: string | null; primary_email?: string | null }
    | { name?: string | null; primary_email?: string | null }[]
    | null;
  students?:
    | { first_name?: string | null; last_name?: string | null }
    | { first_name?: string | null; last_name?: string | null }[]
    | null;
  guardians?:
    | { first_name?: string | null; last_name?: string | null; email?: string | null }
    | { first_name?: string | null; last_name?: string | null; email?: string | null }[]
    | null;
};

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function staffDisplayName(
  staff: ClassroomSignupRow["staff_members"],
): string {
  const row = unwrapRelation(staff);
  if (!row) return "Teacher";
  const name = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
  return name || "Teacher";
}

function studentDisplayName(
  student: ClassroomSignupResponseRow["students"],
): string {
  const row = unwrapRelation(student);
  if (!row) return "Student";
  const name = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
  return name || "Student";
}

function guardianDisplayName(
  guardian: ClassroomSignupResponseRow["guardians"],
): string {
  const row = unwrapRelation(guardian);
  if (!row) return "Parent";
  const name = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
  return name || "Parent";
}

export function mapClassroomSignupRow(row: ClassroomSignupRow): ClassroomSignup {
  const classroom = unwrapRelation(row.classrooms);
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    createdByStaffMemberId: String(row.created_by_staff_member_id),
    teacherName: staffDisplayName(row.staff_members),
    title: String(row.title),
    description: String(row.description ?? ""),
    signupType: row.signup_type,
    audience: row.audience,
    classroomId: row.classroom_id ? String(row.classroom_id) : null,
    classroomName: classroom?.name ? String(classroom.name) : null,
    familyCount: Number(row.family_count ?? 0),
    status: row.status,
    responseDeadline: row.response_deadline,
    config: (row.config ?? {}) as ClassroomSignupConfig,
    publishedAt: row.published_at,
    closedAt: row.closed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapClassroomSignupResponseRow(
  row: ClassroomSignupResponseRow,
): ClassroomSignupResponse {
  const family = unwrapRelation(row.families);
  const guardian = unwrapRelation(row.guardians);
  return {
    id: String(row.id),
    signupId: String(row.signup_id),
    familyId: String(row.family_id),
    familyName: family?.name ? String(family.name) : "Family",
    guardianName: guardianDisplayName(row.guardians),
    guardianEmail:
      guardian?.email?.trim() ||
      family?.primary_email?.trim() ||
      "",
    studentId: String(row.student_id),
    studentName: studentDisplayName(row.students),
    selectedSlotIds: Array.isArray(row.selected_slot_ids)
      ? row.selected_slot_ids.map(String)
      : [],
    selectedRoleIds: Array.isArray(row.selected_role_ids)
      ? row.selected_role_ids.map(String)
      : [],
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const CLASSROOM_SIGNUP_SELECT = `
  *,
  staff_members ( first_name, last_name ),
  classrooms ( name )
`;

export const CLASSROOM_SIGNUP_RESPONSE_SELECT = `
  *,
  families ( name, primary_email ),
  students ( first_name, last_name )
`;
