import type { SupabaseClient } from "@supabase/supabase-js";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import { listAssignedEnrolledStudents, formatEnrolledStudentSubtitle, listFamilyEnrolledStudents } from "@/lib/school-admin/enrolled-students";
import { listStaffMembers } from "@/lib/staff/staff-members";
import { colorForKey } from "./format";
import {
  resolveTeacherFamilyThreadTitle,
  toMessageStudentRefs,
  toMessageStudentSummaries,
  type ParticipantDisplayContext,
} from "./mappers";
import { loadFamilyGuardianDisplayMaps } from "./threads";
import type { MessageContact } from "./types";

export async function listParentMessageContacts(
  admin: SupabaseClient,
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  schoolOfficeLabel: string,
): Promise<{ familyId: string | null; contacts: MessageContact[] }> {
  const familyIds = await getFamilyIdsForUser(supabase, userId, organizationId);
  const familyId = familyIds[0] ?? null;
  const contacts: MessageContact[] = [];

  contacts.push({
    key: "school_office",
    kind: "school_office",
    name: schoolOfficeLabel,
    subtitle: "Admin",
    color: "#4A6354",
  });

  if (!familyId) {
    return { familyId, contacts };
  }

  const { data: students, error } = await admin
    .from("enrollments")
    .select(
      `
      students!inner (
        assigned_teacher_id,
        staff_members:assigned_teacher_id (
          id,
          first_name,
          last_name,
          role_title
        )
      )
    `,
    )
    .eq("organization_id", organizationId)
    .eq("status", "enrolled")
    .eq("students.family_id", familyId);

  if (error) throw new Error(error.message);

  const teacherMap = new Map<string, MessageContact>();
  for (const row of students ?? []) {
    const student = row.students as
      | {
          assigned_teacher_id?: string | null;
          staff_members?:
            | {
                id: string;
                first_name: string;
                last_name: string;
                role_title?: string | null;
              }
            | {
                id: string;
                first_name: string;
                last_name: string;
                role_title?: string | null;
              }[]
            | null;
        }
      | {
          assigned_teacher_id?: string | null;
          staff_members?:
            | {
                id: string;
                first_name: string;
                last_name: string;
                role_title?: string | null;
              }
            | {
                id: string;
                first_name: string;
                last_name: string;
                role_title?: string | null;
              }[]
            | null;
        }[]
      | null;

    const studentRow = Array.isArray(student) ? student[0] : student;
    const teacherId = studentRow?.assigned_teacher_id;
    if (!teacherId) continue;

    const staffRaw = studentRow?.staff_members;
    const staff = Array.isArray(staffRaw) ? staffRaw[0] : staffRaw;
    if (!staff) continue;

    const staffMemberId = String(staff.id);
    if (teacherMap.has(staffMemberId)) continue;

    const name = [staff.first_name, staff.last_name].filter(Boolean).join(" ");
    teacherMap.set(staffMemberId, {
      key: `staff:${staffMemberId}`,
      kind: "staff_member",
      staffMemberId,
      name: name || "Teacher",
      subtitle: staff.role_title ?? "Teacher",
      color: colorForKey(staffMemberId),
    });
  }

  contacts.push(...teacherMap.values());
  return { familyId, contacts };
}

export async function listTeacherMessageContacts(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
): Promise<MessageContact[]> {
  const students = await listAssignedEnrolledStudents(
    admin,
    organizationId,
    staffMemberId,
  );

  const studentsByFamily = new Map<string, typeof students>();
  for (const student of students) {
    if (!student.familyId) continue;
    const familyStudents = studentsByFamily.get(student.familyId) ?? [];
    familyStudents.push(student);
    studentsByFamily.set(student.familyId, familyStudents);
  }

  const familyIds = [...studentsByFamily.keys()];
  const [guardianMaps, enrolledStudentsByFamily] = await Promise.all([
    loadFamilyGuardianDisplayMaps(admin, organizationId, familyIds),
    listFamilyEnrolledStudents(admin, organizationId, familyIds),
  ]);

  const displayContext: ParticipantDisplayContext = {
    families: guardianMaps.families,
    staffMembers: new Map(),
    guardians: guardianMaps.guardians,
    familyPrimaryGuardianIds: guardianMaps.familyPrimaryGuardianIds,
    familyFirstGuardianIds: guardianMaps.familyFirstGuardianIds,
    familyEnrolledStudents: enrolledStudentsByFamily,
    schoolOfficeLabel: "",
    currentUserId: "",
  };

  const contacts: MessageContact[] = [];
  for (const familyId of familyIds) {
    const enrolledStudents = enrolledStudentsByFamily.get(familyId) ?? [];
    contacts.push({
      key: `family:${familyId}`,
      kind: "family",
      familyId,
      name: resolveTeacherFamilyThreadTitle(familyId, displayContext),
      subtitle:
        enrolledStudents.length > 0
          ? formatEnrolledStudentSubtitle(enrolledStudents)
          : undefined,
      subtitleStudents: toMessageStudentRefs(enrolledStudents),
      subtitleStudentSummaries: toMessageStudentSummaries(enrolledStudents),
      color: colorForKey(familyId),
    });
  }

  return contacts.sort((a, b) => a.name.localeCompare(b.name));
}

export async function listAdminMessageContacts(
  admin: SupabaseClient,
  organizationId: string,
  schoolOfficeLabel: string,
): Promise<MessageContact[]> {
  const contacts: MessageContact[] = [];

  const { data: families, error: familiesError } = await admin
    .from("families")
    .select("id, name")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true })
    .limit(500);

  if (familiesError) throw new Error(familiesError.message);

  const familyIds = (families ?? []).map((family) => String(family.id));
  const guardianMaps = await loadFamilyGuardianDisplayMaps(
    admin,
    organizationId,
    familyIds,
  );

  const displayContext: ParticipantDisplayContext = {
    families: guardianMaps.families,
    staffMembers: new Map(),
    guardians: guardianMaps.guardians,
    familyPrimaryGuardianIds: guardianMaps.familyPrimaryGuardianIds,
    familyFirstGuardianIds: guardianMaps.familyFirstGuardianIds,
    familyEnrolledStudents: new Map(),
    schoolOfficeLabel: "",
    currentUserId: "",
  };

  for (const family of families ?? []) {
    const familyId = String(family.id);
    contacts.push({
      key: `family:${familyId}`,
      kind: "family",
      familyId,
      name: resolveTeacherFamilyThreadTitle(familyId, displayContext),
      subtitle: "Family",
      color: colorForKey(familyId),
    });
  }

  const staffMembers = await listStaffMembers(admin, organizationId);
  for (const staff of staffMembers) {
    if (staff.employmentStatus !== "active") continue;
    const name = [staff.firstName, staff.lastName].filter(Boolean).join(" ");
    contacts.push({
      key: `staff:${staff.id}`,
      kind: "staff_member",
      staffMemberId: staff.id,
      name: name || "Staff",
      subtitle: staff.roleTitle ?? staff.portalRole ?? "Staff",
      color: colorForKey(staff.id),
    });
  }

  contacts.unshift({
    key: "school_office",
    kind: "school_office",
    name: schoolOfficeLabel,
    subtitle: "Shared inbox",
    color: "#4A6354",
  });

  return contacts;
}
