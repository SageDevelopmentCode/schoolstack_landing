import type { SupabaseClient } from "@supabase/supabase-js";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import { listAssignedEnrolledStudents, formatEnrolledStudentFirstNames, formatEnrolledStudentSubtitle, listFamilyEnrolledStudents } from "@/lib/school-admin/enrolled-students";
import { listStaffMembers } from "@/lib/staff/staff-members";
import { colorForKey } from "./format";
import {
  guardianPhotoUrl,
  resolveGuardianDisplayName,
  toMessageStudentRefs,
  toMessageStudentSummaries,
  type ParticipantDisplayContext,
} from "./mappers";
import { getGuardianIdForUser } from "./messages";
import { loadFamilyGuardianDisplayMaps } from "./threads";
import type { MessageContact } from "./types";

export async function listParentMessageContacts(
  admin: SupabaseClient,
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  schoolOfficeLabel: string,
): Promise<{ familyId: string | null; guardianId: string | null; contacts: MessageContact[] }> {
  const familyIds = await getFamilyIdsForUser(supabase, userId, organizationId);
  const familyId = familyIds[0] ?? null;
  const guardianId = familyId
    ? await getGuardianIdForUser(admin, userId, organizationId, familyId)
    : null;
  const contacts: MessageContact[] = [];

  contacts.push({
    key: "school_office",
    kind: "school_office",
    name: schoolOfficeLabel,
    subtitle: "Admin",
    color: "#4A6354",
  });

  if (!familyId) {
    return { familyId, guardianId, contacts };
  }

  const { data: assignments, error } = await admin
    .from("student_teacher_assignments")
    .select(
      `
      staff_members!inner (
        id,
        first_name,
        last_name,
        role_title,
        profile_photo_url
      ),
      students!inner (
        family_id
      )
    `,
    )
    .eq("organization_id", organizationId)
    .eq("students.family_id", familyId);

  if (error) throw new Error(error.message);

  const teacherMap = new Map<string, MessageContact>();
  for (const row of assignments ?? []) {
    const staffRaw = row.staff_members as
      | {
          id: string;
          first_name: string;
          last_name: string;
          role_title?: string | null;
          profile_photo_url?: string | null;
        }
      | {
          id: string;
          first_name: string;
          last_name: string;
          role_title?: string | null;
          profile_photo_url?: string | null;
        }[]
      | null;
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
      profilePhotoUrl:
        typeof staff.profile_photo_url === "string" && staff.profile_photo_url.trim()
          ? staff.profile_photo_url.trim()
          : null,
    });
  }

  contacts.push(...teacherMap.values());
  return { familyId, guardianId, contacts };
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
  for (const [guardianId, guardian] of guardianMaps.guardians) {
    const familyId = guardian.familyId;
    if (!familyId || !familyIds.includes(familyId)) continue;
    const enrolledStudents = enrolledStudentsByFamily.get(familyId) ?? [];
    if (enrolledStudents.length === 0) continue;
    contacts.push({
      key: `guardian:${guardianId}`,
      kind: "guardian",
      guardianId,
      familyId,
      name: resolveGuardianDisplayName(guardianId, displayContext) ?? "Parent",
      subtitle:
        enrolledStudents.length > 0
          ? formatEnrolledStudentSubtitle(enrolledStudents)
          : undefined,
      subtitleStudents: toMessageStudentRefs(enrolledStudents),
      subtitleStudentSummaries: toMessageStudentSummaries(enrolledStudents),
      color: colorForKey(guardianId),
      profilePhotoUrl: guardianPhotoUrl(guardianId, displayContext),
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

  const { data: guardianRows, error: guardiansError } = await admin
    .from("guardians")
    .select("id, first_name, last_name, family_id, profile_photo_url")
    .eq("organization_id", organizationId)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true })
    .limit(500);

  if (guardiansError) throw new Error(guardiansError.message);

  const familyIds = [
    ...new Set(
      (guardianRows ?? [])
        .map((row) => (row.family_id ? String(row.family_id) : null))
        .filter((familyId): familyId is string => Boolean(familyId)),
    ),
  ];

  const enrolledStudentsByFamily =
    familyIds.length > 0
      ? await listFamilyEnrolledStudents(admin, organizationId, familyIds)
      : new Map();

  for (const guardian of guardianRows ?? []) {
    const guardianId = String(guardian.id);
    const familyId = guardian.family_id ? String(guardian.family_id) : null;
    const name = [guardian.first_name, guardian.last_name].filter(Boolean).join(" ");
    const enrolledStudents = familyId ? enrolledStudentsByFamily.get(familyId) ?? [] : [];
    if (enrolledStudents.length === 0) continue;

    contacts.push({
      key: `guardian:${guardianId}`,
      kind: "guardian",
      guardianId,
      familyId: familyId ?? undefined,
      name: name || "Parent",
      subtitle:
        enrolledStudents.length > 0
          ? formatEnrolledStudentFirstNames(enrolledStudents)
          : "Parent",
      subtitleStudents: toMessageStudentRefs(enrolledStudents),
      subtitleStudentSummaries: toMessageStudentSummaries(enrolledStudents),
      color: colorForKey(guardianId),
      profilePhotoUrl:
        typeof guardian.profile_photo_url === "string" && guardian.profile_photo_url.trim()
          ? guardian.profile_photo_url.trim()
          : null,
    });
  }

  const staffMembers = await listStaffMembers(admin, organizationId);
  const { data: staffPhotoRows, error: staffPhotoError } = await admin
    .from("staff_members")
    .select("id, profile_photo_url")
    .eq("organization_id", organizationId);

  if (staffPhotoError) throw new Error(staffPhotoError.message);

  const staffPhotoById = new Map<string, string | null>();
  for (const row of staffPhotoRows ?? []) {
    staffPhotoById.set(
      String(row.id),
      typeof row.profile_photo_url === "string" && row.profile_photo_url.trim()
        ? row.profile_photo_url.trim()
        : null,
    );
  }

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
      profilePhotoUrl: staffPhotoById.get(staff.id) ?? null,
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
